export class Dashboard {
    constructor() {
        this.memberGrowthChart = null;
        this.commandUsageChart = null;
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadGuilds();
        this.initCharts();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    async loadStats() {
        const stats = await fetch('/.netlify/functions/stats').then(r => r.json());
        this.updateStatCards(stats);
        return stats;
    }

    async loadGuilds() {
        const { guilds } = await fetch('/.netlify/functions/guilds').then(r => r.json());
        this.renderGuilds(guilds);
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
            <div class="server-card" data-guild-id="${guild.id}">
                <img src="${guild.icon}" alt="${guild.name}" class="server-icon">
                <div class="server-info">
                    <h4>${guild.name}</h4>
                    <span class="member-count">${guild.memberCount} members</span>
                    <div class="server-features">
                        ${guild.features.map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
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
            this.updateCharts(stats);
        }, 30000);
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
    }

    async updateDateRange(range) {
        // Implement date range filtering logic here
        const stats = await this.loadStats();
        this.updateCharts(stats);
    }

    handleServerClick(guildId) {
        console.log(`Server ${guildId} clicked`);
        // Implement server click handling
    }
}

// Initialize dashboard
new Dashboard();
