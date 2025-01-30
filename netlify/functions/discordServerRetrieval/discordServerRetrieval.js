const axios = require('axios');

/**
 * Retrieves Discord servers (guilds) for an authenticated user
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Array>} Array of user's Discord servers
 */
async function getUserDiscordServers(accessToken) {
    const DISCORD_API = 'https://discord.com/api/v10';
    
    if (!accessToken) {
        throw new Error('Access token is required');
    }

    try {
        const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions
        }));

    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    throw new Error('Invalid or expired access token');
                case 429:
                    throw new Error('Rate limit exceeded');
                default:
                    throw new Error(`Discord API error: ${error.response.status}`);
            }
        }
        throw new Error('Failed to fetch Discord servers');
    }
}

module.exports = {
    getUserDiscordServers
};
