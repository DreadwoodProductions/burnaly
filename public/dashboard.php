<?php
require_once 'includes/config.php';

if (!isset($_SESSION['discord_token'])) {
    header('Location: login.php');
    exit();
}

$user = $_SESSION['discord_user'];
$token = $_SESSION['discord_token'];

function get_user_guilds($token) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => DISCORD_API . '/users/@me/guilds',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token]
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

$guilds = get_user_guilds($token);
require_once 'includes/header.php';
?>

<div class="dashboard-wrapper">
    <nav class="sidebar">
        <div class="user-profile">
            <img src="https://cdn.discordapp.com/avatars/<?php echo $user['id']; ?>/<?php echo $user['avatar']; ?>.png" alt="Profile" id="userAvatar">
            <span id="userName"><?php echo htmlspecialchars($user['username']); ?></span>
        </div>
        <ul class="nav-links">
            <li class="active">Overview</li>
            <li>Servers</li>
            <li>Scripts</li>
            <li>Settings</li>
        </ul>
        <a href="logout.php" class="logout-btn">Logout</a>
    </nav>
    
    <main class="dashboard-content">
        <div class="servers-grid">
            <?php foreach ($guilds as $guild): ?>
            <div class="server-card">
                <?php if ($guild['icon']): ?>
                <img src="https://cdn.discordapp.com/icons/<?php echo $guild['id']; ?>/<?php echo $guild['icon']; ?>.png" alt="<?php echo htmlspecialchars($guild['name']); ?>">
                <?php endif; ?>
                <h3><?php echo htmlspecialchars($guild['name']); ?></h3>
                <span class="status-badge">Active</span>
            </div>
            <?php endforeach; ?>
        </div>
    </main>
</div>

<?php require_once 'includes/footer.php'; ?>