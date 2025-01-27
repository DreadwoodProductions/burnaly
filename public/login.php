<?php
require_once 'includes/config.php';

$auth_url = DISCORD_API . '/oauth2/authorize?' . http_build_query([
    'client_id' => CLIENT_ID,
    'redirect_uri' => REDIRECT_URI,
    'response_type' => 'code',
    'scope' => 'identify email guilds'
]);

header('Location: ' . $auth_url);
exit();