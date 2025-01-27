const dashboard = {
    init: async function () {
        console.log('Dashboard initializing...');
        console.log('Full cookie string:', document.cookie);
        console.log('Current URL:', window.location.href);
        
        // Clear any OAuth2 code from URL
        if (window.location.search.includes('code')) {
            window.history.replaceState({}, document.title, '/dashboard.html');
        }

        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('discord_token='))
            ?.split('=')[1];

        console.log('Extracted token:', token);
        console.log('Token status:', token ? 'Found' : 'Not found');

        if (!token) {
            console.log('Redirecting to auth...');
            window.location.href = '/.netlify/functions/auth';
            return;
        }

        try {
            console.log('Loading user profile...');
            await this.loadUserProfile(token);
            console.log('Loading user servers...');
            await this.loadUserServers(token);
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('401')) {
                try {
                    const newToken = await this.refreshToken();
                    await this.init();
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    window.location.href = '/.netlify/functions/auth';
                }
            }
        }
    },

    loadUserProfile: async function (token) {
        const response = await fetch('/.netlify/functions/getUserProfile', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    },

    loadUserServers: async function (token) {
        const response = await fetch('/.netlify/functions/getUserServers', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const servers = await response.json();
        const container = document.getElementById('servers-container');
        
        container.innerHTML = servers.map(server => `
            <div class="server-card">
                ${server.icon 
                    ? `<img src="https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png" alt="${server.name}">`
                    : `<div class="server-icon-placeholder">${server.name.charAt(0)}</div>`
                }
                <h3>${server.name}</h3>
                <button onclick="dashboard.configureServer('${server.id}')">Configure</button>
            </div>
        `).join('');
    },

    refreshToken: async function () {
        const refreshToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('discord_refresh_token='))
            ?.split('=')[1];

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await fetch('/.netlify/functions/refreshToken', {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tokens = await response.json();
        document.cookie = `discord_token=${tokens.access_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`;
        document.cookie = `discord_refresh_token=${tokens.refresh_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`;

        return tokens.access_token;
    },

    configureServer: function (serverId) {
        console.log(`Configuring server: ${serverId}`);
        // Add your server configuration logic here
    },

    logout: function () {
        document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'discord_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    }
};
