export async function setupServerList() {
    try {
        const response = await fetch('/.netlify/functions/get-guilds', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const guilds = await response.json();
        const serversList = document.getElementById('servers-list');
        serversList.innerHTML = '';

        guilds.forEach(guild => {
            const serverCard = createServerCard(guild);
            serversList.appendChild(serverCard);
        });

        const serverStatNumber = document.querySelector('.stat-card:nth-child(2) .stat-number');
        if (serverStatNumber) {
            serverStatNumber.textContent = guilds.length;
        }
    } catch (error) {
        console.log('Server data:', error);
        document.getElementById('servers-list').innerHTML = '<div class="error-message">Loading servers...</div>';
    }
}

function createServerCard(guild) {
    const card = document.createElement('div');
    card.className = 'server-card';
    
    const iconUrl = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : '/images/default-server-icon.png';

    card.innerHTML = `
        <img src="${iconUrl}" alt="${guild.name}" class="server-icon">
        <div class="server-info">
            <h4>${guild.name}</h4>
            <div class="server-features">
                ${guild.features.includes('VERIFIED') ? '<span class="badge verified">Verified</span>' : ''}
                ${guild.features.includes('COMMUNITY') ? '<span class="badge community">Community</span>' : ''}
            </div>
        </div>
        <button class="manage-btn" data-server-id="${guild.id}">Manage</button>
    `;

    const manageBtn = card.querySelector('.manage-btn');
    manageBtn.addEventListener('click', () => {
        window.location.href = `/dashboard/server/${guild.id}`;
    });

    return card;
}
