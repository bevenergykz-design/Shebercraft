<?php
/**
 * Shebercraft — Обработчик форм
 * Отправляет заявку на info@shebercraft.kz
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

// Читаем тело запроса (JSON или обычный POST)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Sanitize
function clean($str) {
    return htmlspecialchars(strip_tags(trim((string)$str)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($input['name']    ?? '');
$company = clean($input['company'] ?? '');
$phone   = clean($input['phone']   ?? '');
$service = clean($input['service'] ?? '');
$message = clean($input['message'] ?? '');
$page    = clean($input['page']    ?? $_SERVER['HTTP_REFERER'] ?? 'неизвестна');

// Валидация
if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Телефон обязателен']);
    exit;
}

// 1. Отправка EMAIL
$to      = 'info@shebercraft.kz';
$subject = '=?UTF-8?B?' . base64_encode("Новая заявка с сайта Shebercraft: {$name} ({$phone})") . '?=';

$body  = "Новая заявка с сайта Shebercraft\n";
$body .= str_repeat('=', 50) . "\n\n";
$body .= "Имя:        {$name}\n";
$body .= "Компания:   {$company}\n";
$body .= "Телефон:    {$phone}\n";
$body .= "Услуга:     {$service}\n";
$body .= "Сообщение:  {$message}\n\n";
$body .= str_repeat('-', 50) . "\n";
$body .= "Страница:   {$page}\n";
$body .= "Дата:       " . date('d.m.Y H:i:s', time() + 5*3600) . " (Алматы UTC+5)\n";

$headers  = "From: no-reply@shebercraft.kz\r\n";
$headers .= "Reply-To: info@shebercraft.kz\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: base64\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$emailSent = mail($to, $subject, base64_encode($body), $headers);

// 2. Уведомление в Telegram (фоновое)
$tgToken  = '8953811443:AAHKxOKpIPM26NLim0eKuLFJL_U1fWOlcKo';
$tgChatId = '1994851440';

$tgText = "<b>Новая заявка с сайта Shebercraft!</b>\n\n"
    . "Имя: " . ($name ?: 'Не указано') . "\n"
    . "Компания: " . ($company ?: 'Не указана') . "\n"
    . "Телефон: {$phone}\n"
    . "Услуга: " . ($service ?: 'Не выбрана') . "\n"
    . "Сообщение: " . ($message ?: 'Без комментария') . "\n\n"
    . "Страница: {$page}";

$tgUrl  = "https://api.telegram.org/bot{$tgToken}/sendMessage";
$tgData = http_build_query([
    'chat_id'    => $tgChatId,
    'text'       => $tgText,
    'parse_mode' => 'HTML',
]);

if (function_exists('curl_init')) {
    $ch = curl_init($tgUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $tgData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    curl_exec($ch);
    curl_close($ch);
} else {
    @file_get_contents($tgUrl . '?' . $tgData);
}

// Ответ клиенту
http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Заявка отправлена']);
