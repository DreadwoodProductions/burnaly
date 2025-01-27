const fetch = require('node-fetch');

const handler = async (event) => {
    const code = event.queryStringParameters.code;
    const clientId = '1333103933610135662';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = 'https://burnaly.com/.netlify/functions/callback';

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                scope: 'identify email guilds',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokens = await tokenResponse.json();

        return {
            statusCode: 302,
            headers: {
                'Set-Cookie': `discord_token=${tokens.access_token}; Path=/; HttpOnly; Secure`,
                Location: '/dashboard',
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to exchange code for token' }),
        };
    }
};

exports.handler = handler;