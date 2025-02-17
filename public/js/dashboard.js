import { initializeCharts } from './charts.js';
import { setupServerList } from './services/discord-server-retrieval.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeCharts();
    await Promise.all([
        setupServerList(),
        updateUserInfo(),
        updateStatistics()
    ]);
    setupEventListeners();
});

function setupEventListeners() {
    const toggleBtn = document.querySelector('.toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationCenter);
    }

    const dateFilters = document.querySelectorAll('.date-filter button');
    dateFilters.forEach(button => {
        button.addEventListener('click', () => {
            dateFilters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateStatistics(button.textContent.toLowerCase());
        });
    });
}

async function updateUserInfo() {
    try {
        const response = await fetch('/.netlify/functions/get-user', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        
        const usernameElement = document.getElementById('username');
        const avatarElement = document.getElementById('user-avatar');
        
        if (usernameElement) {
            usernameElement.textContent = userData.global_name || userData.username;
        }
        
        if (avatarElement) {
            avatarElement.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
            avatarElement.alt = userData.global_name || userData.username;
        }

        if (userData.premium_type) {
            const userDetails = document.querySelector('.user-details');
            if (userDetails && !userDetails.querySelector('.badge.premium')) {
                const premiumBadge = document.createElement('span');
                premiumBadge.className = 'badge premium';
                premiumBadge.textContent = 'Nitro';
                userDetails.appendChild(premiumBadge);
            }
        }
    } catch (error) {
        console.log('User data:', error);
        const usernameElement = document.getElementById('username');
        const avatarElement = document.getElementById('user-avatar');
        
        if (usernameElement) {
            usernameElement.textContent = 'Loading...';
        }
        if (avatarElement) {
            avatarElement.src = '/images/default-avatar.png';
        }
    }
}

async function updateStatistics(timeframe = 'today') {
    const stats = {
        members: '25,431',
        servers: await getServerCount(),
        commands: '1,234',
        uptime: '99.9%'
    };

    Object.entries(stats).forEach(([stat, value]) => {
        const statElement = document.querySelector(`.stat-card .stat-number[data-stat="${stat}"]`);
        if (statElement) {
            statElement.textContent = value;
        }
    });
}

async function getServerCount() {
    try {
        const response = await fetch('/.netlify/functions/get-guilds', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) return '0';
        const guilds = await response.json();
        return guilds.length.toString();
    } catch (error) {
        return '0';
    }
}

function handleLogout() {
    document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
}

function toggleNotificationCenter() {
    const notificationCenter = document.querySelector('.notification-center');
    if (notificationCenter) {
        notificationCenter.classList.toggle('active');
    }
}
