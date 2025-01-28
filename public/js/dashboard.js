document.addEventListener('DOMContentLoaded', async () => {
    if (!document.cookie.includes('discord_token')) {
        window.location.href = '/.netlify/functions/auth';
        return;
    }

    try {
        const sessionCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('session='))
            ?.split('=')[1];

        if (sessionCookie) {
            const sessionData = JSON.parse(atob(sessionCookie));
            const guildData = await testServerFetch(sessionData.accessToken);
            console.log('Guild Data:', guildData);
            
            // Display results on page if you want to see them
            const resultsDiv = document.createElement('div');
            resultsDiv.innerHTML = `
                <h3>Test Results:</h3>
                <p>Total Guilds: ${guildData.totalGuilds}</p>
                <p>Manageable Guilds: ${guildData.managedGuilds}</p>
            `;
            document.body.appendChild(resultsDiv);
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
    }
});

async function testServerFetch(accessToken) {
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    const guilds = await guildsResponse.json();
    
    // Filter for guilds where user has MANAGE_GUILD permission (0x20)
    const managedGuilds = guilds.filter(guild => (guild.permissions & 0x20) === 0x20);
    
    const testResponse = await fetch('/.netlify/functions/test-guilds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            allGuilds: guilds,
            managedGuilds: managedGuilds 
        })
    });
    
    return await testResponse.json();
}
