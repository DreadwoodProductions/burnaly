class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        const token = this.getCookie('discord_token');
        if (!token) {
            window.location.href = '/.netlify/functions/auth';
            return;
        }
        await this.loadUserData(token);
        this.setupEventListeners();
    }

    async loadUserData(token) {
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const userData = await response.json();
            this.renderDashboard(userData);
        } catch (error) {
            console.error('Failed to load user data:', error);
            window.location.href = '/.netlify/functions/auth';
        }
    }

    renderDashboard(userData) {
        document.getElementById('app').innerHTML = `
            <nav class="sidebar">
                <div class="user-profile">
                    <img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png" alt="Profile">
                    <span>${userData.username}</span>
                </div>
                <ul class="nav-links">
                    <li class="active">Overview</li>
                    <li>Servers</li>
                    <li>Scripts</li>
                    <li>Settings</li>
                </ul>
                <button class="logout-btn" onclick="dashboard.logout()">Logout</button>
            </nav>
            <main class="dashboard-content">
                <div class="servers-grid" id="servers-container">
                    Loading servers...
                </div>
            </main>
        `;
        this.loadServers();
    }

    async loadServers() {
        const token = this.getCookie('discord_token');
        try {
            const response = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const servers = await response.json();
            this.renderServers(servers);
        } catch (error) {
            console.error('Failed to load servers:', error);
        }
    }

    renderServers(servers) {
        const container = document.getElementById('servers-container');
        container.innerHTML = servers.map(server => `
            <div class="server-card">
                ${server.icon 
                    ? `<img src="https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png" alt="${server.name}">`
                    : ''}
                <h3>${server.name}</h3>
                <span class="status-badge">Active</span>
            </div>
        `).join('');
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-links li').forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget.textContent.trim());
            });
        });
    }

    handleNavigation(section) {
        document.querySelectorAll('.nav-links li').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.nav-links li:contains('${section}')`).classList.add('active');
    }

    logout() {
        document.cookie = 'discord_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
}

const dashboard = new Dashboard();