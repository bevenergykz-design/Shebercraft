<?php
/**
 * Shebercraft — Обработчик форм
 * 1) Отправляет уведомление в Telegram (основной канал)
 * 2) Дублирует заявку письмом на info@shebercraft.kz
 *
 * Секреты (токен бота, chat_id) хранятся в config.php рядом с этим файлом.
 * config.php НЕ коммитится в git (см. .gitignore) — его нужно залить на хостинг вручную.
 * Пример: config.example.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://shebercraft.kz');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---------- Конфигурация ----------
$config = [
    'tg_token'   => getenv('TG_BOT_TOKEN') ?: '',
    'tg_chat_id' => getenv('TG_CHAT_ID') ?: '',   // можно несколько через запятую
    'mail_to'    => 'info@shebercraft.kz',
];
if (is_file(__DIR__ . '/config.php')) {
    $config = array_merge($config, (array) require __DIR__ . '/config.php');
}

$logFile = __DIR__ . '/form_errors.log';
function log_error($file, $msg) {
    @file_put_contents($file, '[' . date('c') . '] ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

// ---------- Входные данные ----------
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

// Honeypot: скрытое поле, которое заполняют только боты
if (!empty($input['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

function field($input, $key, $max = 1000) {
    $v = trim(strip_tags((string)($input[$key] ?? '')));
    return mb_substr($v, 0, $max, 'UTF-8');
}

$name    = field($input, 'name', 100);
$company = field($input, 'company', 150);
$phone   = field($input, 'phone', 40);
$service = field($input, 'service', 200);
$message = field($input, 'message', 2000);
$page    = field($input, 'page', 300) ?: ($_SERVER['HTTP_REFERER'] ?? 'неизвестна');

// Валидация телефона: минимум 10 цифр
if (strlen(preg_replace('/\D+/', '', $phone)) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Укажите корректный номер телефона']);
    exit;
}

$dateStr = gmdate('d.m.Y H:i', time() + 5 * 3600) . ' (Алматы)';
$h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

// ---------- 1. Telegram ----------
$tgOk = false;
if ($config['tg_token'] && $config['tg_chat_id']) {
    $phoneDigits = preg_replace('/\D+/', '', $phone);
    $tgText = "🔔 <b>Новая заявка с сайта Shebercraft</b>\n\n"
        . "👤 <b>Имя:</b> " . $h($name ?: 'Не указано') . "\n"
        . "🏢 <b>Компания:</b> " . $h($company ?: 'Не указана') . "\n"
        . "📞 <b>Телефон:</b> " . $h($phone) . "\n"
        . "🧩 <b>Услуга:</b> " . $h($service ?: 'Не выбрана') . "\n"
        . "💬 <b>Сообщение:</b> " . $h($message ?: '—') . "\n\n"
        . "🌐 " . $h($page) . "\n"
        . "🕒 " . $dateStr . "\n\n"
        . "<a href=\"https://wa.me/{$phoneDigits}\">Написать в WhatsApp</a>";

    foreach (array_filter(array_map('trim', explode(',', $config['tg_chat_id']))) as $chatId) {
        $data = http_build_query([
            'chat_id'                  => $chatId,
            'text'                     => $tgText,
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => 'true',
        ]);
        $url = "https://api.telegram.org/bot{$config['tg_token']}/sendMessage";

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $data,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 8,
            ]);
            $resp = curl_exec($ch);
            $err  = curl_error($ch);
            curl_close($ch);
        } else {
            $ctx  = stream_context_create(['http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $data,
                'timeout' => 8,
                'ignore_errors' => true,
            ]]);
            $resp = @file_get_contents($url, false, $ctx);
            $err  = $resp === false ? 'file_get_contents failed' : '';
        }

        $json = $resp ? json_decode($resp, true) : null;
        if (!empty($json['ok'])) {
            $tgOk = true;
        } else {
            // Частая причина: "bot was blocked by the user" — нужно открыть бота и нажать «Старт»
            log_error($logFile, "Telegram chat {$chatId}: " . ($json['description'] ?? $err ?: 'unknown error'));
        }
    }
} else {
    log_error($logFile, 'Telegram не настроен: нет config.php или токена');
}

// ---------- 2. Email ----------
$subject = '=?UTF-8?B?' . base64_encode("Новая заявка: {$name} ({$phone})") . '?=';
$body  = "Новая заявка с сайта Shebercraft\n" . str_repeat('=', 40) . "\n\n"
       . "Имя:       {$name}\n"
       . "Компания:  {$company}\n"
       . "Телефон:   {$phone}\n"
       . "Услуга:    {$service}\n"
       . "Сообщение: {$message}\n\n"
       . str_repeat('-', 40) . "\n"
       . "Страница:  {$page}\n"
       . "Дата:      {$dateStr}\n";

$headers  = "From: Shebercraft <no-reply@shebercraft.kz>\r\n"
          . "Reply-To: {$config['mail_to']}\r\n"
          . "MIME-Version: 1.0\r\n"
          . "Content-Type: text/plain; charset=UTF-8\r\n"
          . "Content-Transfer-Encoding: base64\r\n"
          . "X-Shebercraft-Form: 1\r\n";

$mailOk = @mail($config['mail_to'], $subject, chunk_split(base64_encode($body)), $headers);
if (!$mailOk) {
    log_error($logFile, 'mail() вернул false');
}

// ---------- Ответ ----------
if ($tgOk || $mailOk) {
    echo json_encode(['success' => true, 'telegram' => $tgOk, 'email' => $mailOk]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Не удалось отправить заявку']);
}
