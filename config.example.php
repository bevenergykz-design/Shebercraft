<?php
// Скопируйте этот файл в config.php и заполните. config.php не попадает в git.
return [
    'tg_token'   => '123456789:AA...your-bot-token...',
    'tg_chat_id' => '1994851440',          // несколько получателей: '111,222'
    'mail_to'    => 'info@shebercraft.kz',

    'imap_host'   => 'mail.shebercraft.kz',
    'imap_port'   => 993,
    'imap_ssl'    => true,
    'imap_verify' => false,
    'imap_user'   => 'info@shebercraft.kz',
    'imap_pass'   => 'ВСТАВЬТЕ_ПАРОЛЬ_ОТ_ЯЩИКА',

    // Цифровой сотрудник на сайте (chat.php). Ключ: console.anthropic.com -> API Keys
    'anthropic_key'   => 'sk-ant-...',
    'anthropic_model' => 'claude-haiku-5-5',

    'cron_key'    => 'длинная-случайная-строка',
];
