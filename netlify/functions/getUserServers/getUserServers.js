# Retrieve User's Discord Servers

const axios = require('axios');

async function getUserDiscordServers(accessToken) {
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving Discord servers:', error);
        throw error;
    }
}
