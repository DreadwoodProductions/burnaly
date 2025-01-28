const fetch = require('node-fetch');

exports.handler = async (event) => {
    const sessionCookie = event.headers.cookie?.split(';')
        .find(c => c.trim().startsWith('session='))
        ?.split('=')[1];

    if (!sessionCookie) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        });

        if (response.status === 401) {
            // Token expired, refresh it
            const newTokens = await refreshToken(session.refreshToken);
            // Update session with new tokens
            // Return updated user data
        }

        const userData = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(userData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
