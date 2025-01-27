document.addEventListener('DOMContentLoaded', async () => {
    if (!document.cookie.includes('discord_token')) {
        window.location.href = '/.netlify/functions/auth';
        return;
    }

    try {
        const sessionCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('session='))
            ?.split('=')[1];

        if (sessionCookie) {
            const sessionData = JSON.parse(atob(sessionCookie));
            updateUserInfo(sessionData);
            await fetchAndDisplayServers(sessionData.accessToken);
            setupEventListeners();
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
    }
});

function updateUserInfo(sessionData) {
    document.getElementById('username').textContent = sessionData.username;
    document.getElementById('user-avatar').src = sessionData.avatar ? 
        `https://cdn.discordapp.com/avatars/${sessionData.userId}/${sessionData.avatar}.png` :
        '/images/default-avatar.png';
}

async function fetchAndDisplayServers(accessToken) {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
    const guilds = await response.json();
    
    // Update stats
    document.getElementById('active-servers').textContent = guilds.length;
    let totalMembers = 0;
    
    const serversList = document.getElementById('servers-list');
    serversList.innerHTML = ''; // Clear existing content
    
    guilds.forEach(guild => {
        const serverCard = createServerCard(guild);
        serversList.appendChild(serverCard);
        if (guild.approximate_member_count) {
            totalMembers += guild.approximate_member_count;
        }
    });
    
    document.getElementById('total-members').textContent = totalMembers || '-';
}

function createServerCard(guild) {
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
            <p class="member-count">Members: ${guild.approximate_member_count || '-'}</p>
        </div>
        <div class="server-actions">
            <button onclick="manageServer('${guild.id}')" class="manage-btn">
                <i class="fas fa-cog"></i> Manage
            </button>
        </div>
    `;
    return serverCard;
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const serverCards = document.querySelectorAll('.server-card');
        
        serverCards.forEach(card => {
            const serverName = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = serverName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Navigation links
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function manageServer(guildId) {
    window.location.href = `/server-management.html?id=${guildId}`;
}

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
