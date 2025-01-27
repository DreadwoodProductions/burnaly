const fetch = require('node-fetch');

exports.handler = async (event) => {
    const token = event.headers.authorization.split(' ')[1];

    try {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const serversData = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(serversData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch user servers' })
        };
    }
};