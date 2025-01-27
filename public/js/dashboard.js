const dashboard = {
    init: async function () {
        updateStatus('auth-status', 'Initializing...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            updateStatus('auth-status', 'Processing OAuth Code...');
            try {
                const userData = await this.getUserData(code);
                updateStatus('api-status', 'User Data Received');
                this.displayUserInfo(userData);
            } catch (error) {
                updateStatus('api-status', `Error: ${error.message}`);
                setTimeout(() => {
                    window.location.href = '/.netlify/functions/auth';
                }, 3000);
            }
        } else {
            updateStatus('auth-status', 'No Code - Redirecting to Auth...');
            window.location.href = '/.netlify/functions/auth';
        }
    },

    getUserData: async function (code) {
        const response = await fetch('/.netlify/functions/getUserProfile', {
            headers: {
                'Authorization': `Code ${code}`
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    },

    displayUserInfo: function (userData) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        this.loadUserServers(userData.id);
    },

    loadUserServers: async function (userId) {
        try {
            const response = await fetch('/.netlify/functions/getUserServers', {
                headers: {
                    'Authorization': `Bearer ${userId}`
                }
            });
            const servers = await response.json();
            this.displayServers(servers);
        } catch (error) {
            updateStatus('api-status', `Server Load Error: ${error.message}`);
        }
    },

    displayServers: function (servers) {
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

    logout: function () {
        updateStatus('auth-status', 'Logging out...');
        window.location.href = '/';
    }
};
