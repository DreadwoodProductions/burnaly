import { initializeCharts } from './charts.js';
import { setupServerList } from './services/discordServerRetrieval.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeCharts();
    await setupServerList();
    setupEventListeners();
    updateUserInfo();
});

function setupEventListeners() {
    // Toggle sidebar
    const toggleBtn = document.querySelector('.toggle-sidebar');
    toggleBtn.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', toggleNotificationCenter);
}

async function updateUserInfo() {
    try {
        const response = await fetch('/.netlify/functions/getUserInfo');
        const userData = await response.json();
        
        document.getElementById('username').textContent = userData.username;
        document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
    } catch (error) {
        console.error('Failed to fetch user info:', error);
    }
}

function handleLogout() {
    document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
}

function toggleNotificationCenter() {
    document.querySelector('.notification-center').classList.toggle('active');
}
