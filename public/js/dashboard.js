import { initializeCharts } from './charts.js';
import { setupServerList } from './services/discord-server-retrieval.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/.netlify/functions/auth';
        return;
    }
    
    initializeCharts();
    await setupServerList();
    setupEventListeners();
    await updateUserInfo();
});

function setupEventListeners() {
    const toggleBtn = document.querySelector('.toggle-sidebar');
    toggleBtn.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', toggleNotificationCenter);
}

async function updateUserInfo() {
    try {
        const response = await fetch('/.netlify/functions/get-user', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        
        document.getElementById('username').textContent = userData.username;
        document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        document.getElementById('username').textContent = 'Not logged in';
        document.getElementById('user-avatar').src = '/images/default-avatar.png';
    }
}

function handleLogout() {
    document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
}

function toggleNotificationCenter() {
    document.querySelector('.notification-center').classList.toggle('active');
}

function isAuthenticated() {
    return document.cookie.includes('discord_token');
}
