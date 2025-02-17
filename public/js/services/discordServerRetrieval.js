export async function setupServerList() {
    try {
        const response = await fetch('/.netlify/functions/getGuilds');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const guilds = await response.json();
        
        if (!Array.isArray(guilds)) {
            throw new Error('Expected array of guilds');
        }

        const serversList = document.getElementById('servers-list');
        if (!serversList) {
            throw new Error('Servers list element not found');
        }

        serversList.innerHTML = '';

        guilds.forEach(guild => {
            const serverCard = createServerCard(guild);
            serversList.appendChild(serverCard);
        });
    } catch (error) {
        console.error('Failed to fetch servers:', error);
        // Add visual feedback
        const serversList = document.getElementById('servers-list');
        if (serversList) {
            serversList.innerHTML = '<div class="error-message">Failed to load servers. Please try again.</div>';
        }
    }
}
