const fetch = require('node-fetch');

exports.handler = async (event) => {
    const code = event.queryStringParameters.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    const tokens = await tokenResponse.json();

    // Get user data
    const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
        },
    });
    const userData = await userResponse.json();

    // Create session data
    const sessionData = {
        userId: userData.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
    };

    return {
        statusCode: 302,
        headers: {
            'Set-Cookie': `session=${Buffer.from(JSON.stringify(sessionData)).toString('base64')}; Path=/; Secure; HttpOnly; SameSite=Lax`,
            'Cache-Control': 'no-cache',
            'Location': '/dashboard'
        }
    };
};
