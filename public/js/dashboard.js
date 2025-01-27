const dashboard = {
    init: async function () {
        // Remove the ?code parameter from URL first
        if (window.location.search.includes('code')) {
            window.history.replaceState({}, document.title, '/dashboard.html');
        }

        console.log('Dashboard initializing...');
        console.log('Cookies:', document.cookie);

        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('discord_token='))
            ?.split('=')[1];

        console.log('Token found:', token);

        if (!token) {
            window.location.href = '/.netlify/functions/auth';
            return;
        }

        try {
            await this.loadUserProfile(token);
            await this.loadUserServers(token);
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    },

    loadUserProfile: async function (token) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = await response.json();

        document.getElementById('userName').textContent = user.username;
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    },

    loadUserServers: async function (token) {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const servers = await response.json();

        const container = document.getElementById('servers-container');
        container.innerHTML = servers.map(server => `
            <div class="server-card">
                <img src="https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png" alt="${server.name}">
                <h3>${server.name}</h3>
                <button onclick="dashboard.configureServer('${server.id}')">Configure</button>
            </div>
        `).join('');
    },

    configureServer: function (serverId) {
        console.log(`Configuring server: ${serverId}`);
    },

    logout: function () {
        document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    }
};

document.addEventListener('DOMContentLoaded', () => dashboard.init());