const fetch = require('node-fetch');

exports.handler = async (event) => {
    const token = event.headers.authorization.split(' ')[1];

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const userData = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(userData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch user profile' })
        };
    }
};