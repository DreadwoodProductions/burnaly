// Import necessary dependencies
import { fetchApiStatus, fetchGuilds } from '../api';

export class Dashboard {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadStatus();
    await this.loadGuilds();
    this.setupEventListeners();
  }

  async loadStatus() {
    const status = await fetchApiStatus();
    this.updateStatusDisplay(status);
  }

  async loadGuilds() {
    const { guilds, pagination, meta } = await fetchGuilds();
    this.renderGuilds(guilds);
    this.updatePagination(pagination);
    this.updateLastUpdated(meta.lastUpdated);
  }

  updateStatusDisplay(status) {
    const statusElement = document.getElementById('api-status');
    if (statusElement) {
      statusElement.textContent = `Status: ${status.status}`;
      statusElement.classList.add(status.status === 'online' ? 'status-online' : 'status-offline');
    }
  }

  renderGuilds(guilds) {
    const guildContainer = document.getElementById('guild-list');
    if (!guildContainer) return;

    guildContainer.innerHTML = guilds.map(guild => `
      <div class="guild-card" data-guild-id="${guild.id}">
        <img src="${guild.icon}" alt="${guild.name}" class="guild-icon">
        <h3>${guild.name}</h3>
        <div class="guild-details">
          <span>${guild.memberCount} members</span>
          <div class="guild-features">
            ${guild.features.map(feature => `<span class="feature-badge">${feature}</span>`).join('')}
          </div>
        </div>
        <div class="guild-channels">
          ${guild.channels.map(channel => `
            <div class="channel-item ${channel.type}">
              ${channel.name}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  updatePagination(pagination) {
    const paginationElement = document.getElementById('pagination');
    if (paginationElement) {
      paginationElement.innerHTML = `
        <span>Page ${pagination.page} of ${Math.ceil(pagination.total / pagination.limit)}</span>
      `;
    }
  }

  updateLastUpdated(lastUpdated) {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = `Last updated: ${new Date(lastUpdated).toLocaleString()}`;
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const guildCard = e.target.closest('.guild-card');
      if (guildCard) {
        const guildId = guildCard.dataset.guildId;
        this.handleGuildClick(guildId);
      }
    });
  }

  handleGuildClick(guildId) {
    // Handle guild selection/navigation
    console.log(`Guild ${guildId} selected`);
    // Add your guild selection logic here
  }
}

// Initialize dashboard
const dashboard = new Dashboard();
