import { getUserDiscordServers } from './services/discordServerRetrieval.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeCharts();
    setupEventListeners();
    await loadUserData();
    await fetchAndDisplayServers();
});

function initializeCharts() {
    // Member Growth Chart
    const memberCtx = document.getElementById('memberGrowthChart').getContext('2d');
    new Chart(memberCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Member Growth',
                data: [1200, 1900, 3000, 5000, 6000, 7000],
                borderColor: '#5865F2',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Command Usage Chart
    const commandCtx = document.getElementById('commandUsageChart').getContext('2d');
    new Chart(commandCtx, {
        type: 'bar',
        data: {
            labels: ['Mod', 'Music', 'Games', 'Utils', 'Fun'],
            datasets: [{
                label: 'Command Usage',
                data: [300, 450, 320, 280, 390],
                backgroundColor: [
                    'rgba(88, 101, 242, 0.8)',
                    'rgba(87, 242, 135, 0.8)',
                    'rgba(254, 231, 92, 0.8)',
                    'rgba(237, 66, 69, 0.8)',
                    'rgba(153, 170, 181, 0.8)'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupEventListeners() {
    // Sidebar Toggle
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? 
            'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
    });

    // Notification Center Toggle
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationCenter = document.querySelector('.notification-center');
    
    notificationBtn.addEventListener('click', () => {
        notificationCenter.classList.toggle('active');
    });

    // Search Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Date Filter
    const dateButtons = document.querySelectorAll('.date-filter button');
    dateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dateButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateChartData(btn.textContent.toLowerCase());
        });
    });

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    });
}

async function loadUserData() {
    try {
        const sessionCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('session='))
            ?.split('=')[1];

        if (sessionCookie) {
            const sessionData = JSON.parse(atob(sessionCookie));
            document.getElementById('username').textContent = sessionData.username;
            document.getElementById('user-avatar').src = sessionData.avatar ? 
                `https://cdn.discordapp.com/avatars/${sessionData.userId}/${sessionData.avatar}.png` :
                '/images/default-avatar.png';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function fetchAndDisplayServers() {
    try {
        const sessionCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('session='))
            ?.split('=')[1];

        if (!sessionCookie) {
            throw new Error('No session found');
        }

        const sessionData = JSON.parse(atob(sessionCookie));
        const guilds = await getUserDiscordServers(sessionData.accessToken);
        
        updateServersList(guilds);

        await fetch('/.netlify/functions/test-guilds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guilds })
        });

    } catch (error) {
        console.error('Failed to fetch servers:', error);
        const serversList = document.getElementById('servers-list');
        serversList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load servers. Please try refreshing the page.</p>
            </div>
        `;
    }
}

function updateServersList(guilds) {
    const serversList = document.getElementById('servers-list');
    serversList.innerHTML = '';
    
    guilds.forEach(guild => {
        const serverCard = document.createElement('div');
        serverCard.className = 'server-card';
        serverCard.innerHTML = `
            <div class="server-icon">
                <img src="${guild.icon ? 
                    `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 
                    '/images/default-server-icon.png'}" alt="${guild.name}">
            </div>
            <div class="server-info">
                <h3>${guild.name}</h3>
                <p class="member-count">ID: ${guild.id}</p>
            </div>
            <button class="manage-btn">
                <i class="fas fa-cog"></i> Manage
            </button>
        `;
        serversList.appendChild(serverCard);
    });
}

function updateChartData(timeframe) {
    console.log(`Updating charts for timeframe: ${timeframe}`);
}
