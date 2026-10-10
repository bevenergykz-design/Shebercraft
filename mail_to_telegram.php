<?php
/**
 * Shebercraft — уведомления в Telegram о новых письмах на info@shebercraft.kz
 *
 * Как работает: раз в 1–2 минуты (задание cron в Plesk) скрипт подключается к ящику
 * по IMAP, находит новые письма и отправляет в Telegram отправителя, тему и начало текста.
 * Письма НЕ помечаются прочитанными и не удаляются.
 *
 * Запуск:
 *   CLI (рекомендуется):  php /var/www/vhosts/shebercraft.kz/httpdocs/mail_to_telegram.php
 *   По URL:               https://shebercraft.kz/mail_to_telegram.php?key=<cron_key из config.php>
 *
 * Не требует расширения php-imap — используется собственный мини-клиент IMAP.
 */

$isCli = PHP_SAPI === 'cli';
if (!$isCli) header('Content-Type: text/plain; charset=utf-8');

$config = is_file(__DIR__ . '/config.php') ? (array) require __DIR__ . '/config.php' : [];
$need = ['tg_token', 'tg_chat_id', 'imap_host', 'imap_user', 'imap_pass', 'cron_key'];
foreach ($need as $k) {
    if (empty($config[$k]) || str_contains((string)$config[$k], 'ВСТАВЬТЕ')) {
        http_response_code(500);
        exit("config.php: не заполнен параметр {$k}\n");
    }
}

// Доступ по URL — только с секретным ключом
if (!$isCli && !hash_equals((string)$config['cron_key'], (string)($_GET['key'] ?? ''))) {
    http_response_code(403);
    exit("Forbidden\n");
}

$stateFile = __DIR__ . '/.mail_state.json';   // хранит последний обработанный UID
$lockFile  = __DIR__ . '/.mail_state.lock';
$logFile   = __DIR__ . '/form_errors.log';

$lock = fopen($lockFile, 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit("Уже выполняется\n");

function logm($file, $msg) { @file_put_contents($file, '[' . date('c') . '] mail: ' . $msg . "\n", FILE_APPEND | LOCK_EX); }

// ====================== Мини IMAP-клиент ======================
class Imap {
    private $s; private int $n = 0;
    public function __construct(string $host, int $port, bool $ssl, bool $verify) {
        $ctx = stream_context_create(['ssl' => [
            'verify_peer' => $verify, 'verify_peer_name' => $verify, 'SNI_enabled' => true, 'peer_name' => $host,
        ]]);
        $this->s = @stream_socket_client(($ssl ? 'ssl://' : 'tcp://') . "$host:$port", $en, $es, 15, STREAM_CLIENT_CONNECT, $ctx);
        if (!$this->s) throw new Exception("Нет соединения с IMAP: $es");
        stream_set_timeout($this->s, 30);
        fgets($this->s); // приветствие
    }
    private static function q(string $s): string { return '"' . addcslashes($s, "\"\\") . '"'; }
    /** Выполняет команду, возвращает [строки ответа, литералы] */
    public function cmd(string $c): array {
        $tag = 'A' . (++$this->n);
        fwrite($this->s, "$tag $c\r\n");
        $out = '';
        while (($line = fgets($this->s)) !== false) {
            // литерал {N}
            if (preg_match('/\{(\d+)\}\r\n$/', $line, $m)) {
                $out .= $line;
                $len = (int)$m[1]; $buf = '';
                while (strlen($buf) < $len && !feof($this->s)) $buf .= fread($this->s, $len - strlen($buf));
                $out .= $buf;
                continue;
            }
            $out .= $line;
            if (str_starts_with($line, "$tag ")) {
                if (!preg_match("/^$tag OK/", $line)) throw new Exception('IMAP: ' . trim($line));
                return [$out];
            }
        }
        throw new Exception('IMAP: соединение прервано');
    }
    public function login(string $u, string $p): void { $this->cmd('LOGIN ' . self::q($u) . ' ' . self::q($p)); }
    public function select(string $box): array {
        [$r] = $this->cmd('SELECT ' . self::q($box));
        preg_match('/UIDNEXT (\d+)/', $r, $a); preg_match('/UIDVALIDITY (\d+)/', $r, $b);
        return ['uidnext' => (int)($a[1] ?? 0), 'uidvalidity' => (int)($b[1] ?? 0)];
    }
    public function uidsFrom(int $from): array {
        [$r] = $this->cmd("UID SEARCH UID {$from}:*");
        preg_match('/\* SEARCH([\d ]*)/', $r, $m);
        $ids = array_map('intval', array_filter(explode(' ', trim($m[1] ?? ''))));
        return array_values(array_filter($ids, fn($u) => $u >= $from)); // "N:*" всегда вернёт последний
    }
    /** Первые 128 КБ исходного письма */
    public function raw(int $uid): string {
        [$r] = $this->cmd("UID FETCH {$uid} (BODY.PEEK[]<0.131072>)");
        if (preg_match('/\{(\d+)\}\r\n/', $r, $m, PREG_OFFSET_CAPTURE)) {
            return substr($r, $m[0][1] + strlen($m[0][0]), (int)$m[1][0]);
        }
        return '';
    }
    public function logout(): void { try { $this->cmd('LOGOUT'); } catch (Exception $e) {} fclose($this->s); }
}

// ====================== Разбор MIME ======================
function split_msg(string $raw): array {
    $p = preg_split("/\r?\n\r?\n/", $raw, 2);
    $hdr = preg_replace("/\r?\n[ \t]+/", ' ', $p[0]);   // склейка перенесённых заголовков
    $h = [];
    foreach (preg_split("/\r?\n/", $hdr) as $line) {
        if (strpos($line, ':') === false) continue;
        [$k, $v] = explode(':', $line, 2);
        $k = strtolower(trim($k));
        if (!isset($h[$k])) $h[$k] = trim($v);
    }
    return [$h, $p[1] ?? ''];
}
function dec_header(string $v): string {
    $r = @iconv_mime_decode($v, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');
    return $r !== false ? $r : mb_decode_mimeheader($v);
}
function hparam(string $h, string $name): string {
    return preg_match('/' . $name . '\s*=\s*"?([^";]+)"?/i', $h, $m) ? trim($m[1]) : '';
}
function to_utf8(string $s, string $cs): string {
    $cs = strtolower($cs ?: 'utf-8');
    if ($cs === 'utf-8' || $cs === 'us-ascii') return $s;
    $r = @mb_convert_encoding($s, 'UTF-8', $cs);
    return $r !== false ? $r : (@iconv($cs, 'UTF-8//IGNORE', $s) ?: $s);
}
/** Ищет text/plain (или text/html как запасной) и возвращает текст */
function body_text(array $h, string $body, int $depth = 0): string {
    $ct = $h['content-type'] ?? 'text/plain';
    if ($depth < 5 && stripos($ct, 'multipart/') === 0 && ($b = hparam($ct, 'boundary'))) {
        $parts = explode('--' . $b, $body);
        $html = '';
        foreach ($parts as $part) {
            $part = ltrim($part, "\r\n");
            if ($part === '' || str_starts_with($part, '--')) continue;
            [$ph, $pb] = split_msg($part);
            if (stripos($ph['content-disposition'] ?? '', 'attachment') !== false) continue;
            $pct = $ph['content-type'] ?? 'text/plain';
            if (stripos($pct, 'text/plain') === 0 || stripos($pct, 'multipart/') === 0) {
                $t = body_text($ph, $pb, $depth + 1);
                if (trim($t) !== '') return $t;
            } elseif (stripos($pct, 'text/html') === 0 && $html === '') {
                $html = body_text($ph, $pb, $depth + 1);
            }
        }
        return $html;
    }
    $enc = strtolower($h['content-transfer-encoding'] ?? '');
    if ($enc === 'base64') $body = base64_decode(preg_replace('/\s+/', '', $body));
    elseif ($enc === 'quoted-printable') $body = quoted_printable_decode($body);
    $body = to_utf8($body, hparam($ct, 'charset'));
    if (stripos($ct, 'text/html') === 0) {
        $body = preg_replace('#<(style|script)[^>]*>.*?</\1>#is', '', $body);
        $body = preg_replace('#<br\s*/?>|</p>|</div>#i', "\n", $body);
        $body = html_entity_decode(strip_tags($body), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    return $body;
}

function tg_send(array $config, string $text, string $logFile): bool {
    $ok = false;
    foreach (array_filter(array_map('trim', explode(',', $config['tg_chat_id']))) as $chatId) {
        $ch = curl_init("https://api.telegram.org/bot{$config['tg_token']}/sendMessage");
        curl_setopt_array($ch, [
            CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            CURLOPT_POSTFIELDS => http_build_query([
                'chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true',
            ]),
        ]);
        $j = json_decode((string)curl_exec($ch), true);
        curl_close($ch);
        if (!empty($j['ok'])) $ok = true; else logm($logFile, "Telegram {$chatId}: " . ($j['description'] ?? 'ошибка сети'));
    }
    return $ok;
}

// ====================== Основная логика ======================
$h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
try {
    $imap = new Imap($config['imap_host'], (int)($config['imap_port'] ?? 993), (bool)($config['imap_ssl'] ?? true), (bool)($config['imap_verify'] ?? false));
    $imap->login($config['imap_user'], $config['imap_pass']);
    $box = $imap->select('INBOX');

    $state = is_file($stateFile) ? json_decode(file_get_contents($stateFile), true) : null;
    if (!$state || ($state['uidvalidity'] ?? 0) !== $box['uidvalidity']) {
        // Первый запуск: старые письма не присылаем, только новые
        file_put_contents($stateFile, json_encode(['uidvalidity' => $box['uidvalidity'], 'last' => $box['uidnext'] - 1]));
        $imap->logout();
        exit("Инициализация: последний UID = " . ($box['uidnext'] - 1) . "\n");
    }

    $uids = $imap->uidsFrom($state['last'] + 1);
    $sent = 0;
    foreach (array_slice($uids, 0, 20) as $uid) {        // не более 20 за запуск
        $raw = $imap->raw($uid);
        [$hd, $body] = split_msg($raw);

        $from    = dec_header($hd['from'] ?? '—');
        $subject = dec_header($hd['subject'] ?? '(без темы)');
        $isForm  = isset($hd['x-shebercraft-form']);       // письма с формы уже пришли в бот из send_form.php
        $isSpam  = preg_match('/^yes/i', $hd['x-spam-flag'] ?? '') === 1;

        if (!$isForm && !$isSpam) {
            $text = trim(preg_replace("/\n{3,}/", "\n\n", str_replace("\r", '', body_text($hd, $body))));
            $snippet = mb_substr($text, 0, 700, 'UTF-8') . (mb_strlen($text, 'UTF-8') > 700 ? '…' : '');
            $msg = "📧 <b>Новое письмо на " . $h($config['imap_user']) . "</b>\n\n"
                 . "<b>От:</b> " . $h($from) . "\n"
                 . "<b>Тема:</b> " . $h($subject) . "\n\n"
                 . $h($snippet ?: '(пустое письмо или только вложения)');
            if (!tg_send($config, $msg, $logFile)) break;   // не сдвигаем указатель — повторим в следующий раз
            $sent++;
        }
        $state['last'] = $uid;
        file_put_contents($stateFile, json_encode($state));
    }
    $imap->logout();
    echo "Новых писем: " . count($uids) . ", отправлено в Telegram: {$sent}\n";
} catch (Throwable $e) {
    logm($logFile, $e->getMessage());
    http_response_code(500);
    echo 'Ошибка: ' . $e->getMessage() . "\n";
}
