export async function setupServerList() {
    try {
        const response = await fetch('/.netlify/functions/get-guilds', {
            credentials: 'include'
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
    } catch (error) {
        console.error('Failed to fetch servers:', error);
        const serversList = document.getElementById('servers-list');
        serversList.innerHTML = '<div class="error-message">Failed to load servers. Please try again.</div>';
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
            <p>${guild.approximate_member_count || 'N/A'} members</p>
        </div>
        <button class="manage-btn">Manage</button>
    `;

    return card;
}
