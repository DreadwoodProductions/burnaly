<?php
require_once 'includes/config.php';

if (isset($_GET['code'])) {
    $token = exchange_code($_GET['code']);
    
    if ($token) {
        $user = get_user_data($token);
        $_SESSION['discord_token'] = $token;
        $_SESSION['discord_user'] = $user;
        header('Location: dashboard.php');
        exit();
    }
}

function exchange_code($code) {
    $data = [
        'client_id' => CLIENT_ID,
        'client_secret' => CLIENT_SECRET,
        'grant_type' => 'authorization_code',
        'code' => $code,
        'redirect_uri' => REDIRECT_URI
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => DISCORD_API . '/oauth2/token',
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => http_build_query($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);
    return $result['access_token'] ?? null;
}

function get_user_data($token) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => DISCORD_API . '/users/@me',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token]
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}