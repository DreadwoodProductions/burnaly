export class Dashboard {
    constructor() {
        this.memberGrowthChart = null;
        this.commandUsageChart = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        await this.loadStats();
        await this.loadUserGuilds();
        this.initCharts();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    async checkAuth() {
        const token = localStorage.getItem('discord_access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
    }

    async loadStats() {
        const stats = await fetch('/.netlify/functions/stats').then(r => r.json());
        this.updateStatCards(stats);
        return stats;
    }

    async loadUserGuilds() {
        const token = localStorage.getItem('discord_access_token');
        try {
            const response = await fetch('/.netlify/functions/getUserGuilds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ access_token: token })
            });
            const { guilds } = await response.json();
            this.renderGuilds(guilds);
            this.updateGuildStats(guilds);
        } catch (error) {
            console.error('Failed to load guilds:', error);
        }
    }

    updateStatCards(stats) {
        const statElements = {
            totalMembers: document.querySelector('.stat-card:nth-child(1) .stat-number'),
            activeServers: document.querySelector('.stat-card:nth-child(2) .stat-number'),
            commandsUsed: document.querySelector('.stat-card:nth-child(3) .stat-number'),
            uptime: document.querySelector('.stat-card:nth-child(4) .stat-number')
        };

        statElements.totalMembers.textContent = stats.totalMembers.toLocaleString();
        statElements.activeServers.textContent = stats.activeServers;
        statElements.commandsUsed.textContent = stats.commandsUsed.toLocaleString();
        statElements.uptime.textContent = `${stats.uptime}%`;
    }

    renderGuilds(guilds) {
        const serversList = document.getElementById('servers-list');
        if (!serversList) return;

        serversList.innerHTML = guilds.map(guild => `
            <div class="server-card ${guild.isAdmin ? 'admin' : ''}" data-guild-id="${guild.id}">
                <img src="${guild.icon}" alt="${guild.name}" class="server-icon">
                <div class="server-info">
                    <h4>${guild.name}</h4>
                    ${guild.memberCount ? `<span class="member-count">${guild.memberCount} members</span>` : ''}
                    <div class="server-features">
                        ${guild.features.map(feature => 
                            `<span class="feature-tag">${feature.toLowerCase().replace(/_/g, ' ')}</span>`
                        ).join('')}
                    </div>
                    ${guild.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                </div>
                ${guild.isAdmin ? `
                    <div class="server-actions">
                        <button class="settings-btn" onclick="handleServerSettings('${guild.id}')">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    updateGuildStats(guilds) {
        const adminGuilds = guilds.filter(g => g.isAdmin);
        const totalMembers = adminGuilds.reduce((sum, guild) => sum + (guild.memberCount || 0), 0);
        
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = totalMembers.toLocaleString();
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = guilds.length;
    }

    initCharts() {
        const memberCtx = document.getElementById('memberGrowthChart').getContext('2d');
        const commandCtx = document.getElementById('commandUsageChart').getContext('2d');

        this.memberGrowthChart = new Chart(memberCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Member Growth',
                    data: [0, 20, 40, 80, 120, 180],
                    borderColor: '#7289da',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(114, 137, 218, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        this.commandUsageChart = new Chart(commandCtx, {
            type: 'bar',
            data: {
                labels: ['Help', 'Play', 'Skip', 'Queue', 'Stop'],
                datasets: [{
                    label: 'Most Used Commands',
                    data: [300, 250, 200, 150, 100],
                    backgroundColor: '#7289da'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    setupRealTimeUpdates() {
        setInterval(async () => {
            const stats = await this.loadStats();
            await this.loadUserGuilds();
            this.updateCharts(stats);
        }, 30000);
    }

    updateCharts(stats) {
        if (stats.memberGrowth) {
            this.memberGrowthChart.data.labels = stats.memberGrowth.labels;
            this.memberGrowthChart.data.datasets[0].data = stats.memberGrowth.data;
            this.memberGrowthChart.update();
        }

        if (stats.commandUsage) {
            this.commandUsageChart.data.labels = stats.commandUsage.labels;
            this.commandUsageChart.data.datasets[0].data = stats.commandUsage.data;
            this.commandUsageChart.update();
        }
    }

    setupEventListeners() {
        // Date filter buttons
        document.querySelectorAll('.date-filter button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.date-filter button.active').classList.remove('active');
                button.classList.add('active');
                this.updateDateRange(button.textContent);
            });
        });

        // Server cards
        document.getElementById('servers-list').addEventListener('click', (e) => {
            const serverCard = e.target.closest('.server-card');
            if (serverCard) {
                const guildId = serverCard.dataset.guildId;
                this.handleServerClick(guildId);
            }
        });

        // Notification toggle
        document.querySelector('.notification-btn').addEventListener('click', () => {
            document.querySelector('.notification-center').classList.toggle('active');
        });

        // Sidebar toggle
        document.querySelector('.toggle-sidebar').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('discord_access_token');
            window.location.href = '/login';
        });
    }

    async updateDateRange(range) {
        const stats = await this.loadStats();
        this.updateCharts(stats);
    }

    handleServerClick(guildId) {
        console.log(`Server ${guildId} clicked`);
        // Implement server navigation or modal
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
