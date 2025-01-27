const fetch = require('node-fetch');

exports.handler = async (event) => {
    const code = event.queryStringParameters.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    // Get Discord tokens
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

    // Get user data immediately to verify token
    const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`
        }
    });

    const userData = await userResponse.json();

    // Set both tokens as cookies
    const cookieStrings = [
        `discord_token=${tokens.access_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`,
        `discord_refresh_token=${tokens.refresh_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`
    ];

    return {
        statusCode: 302,
        headers: {
            'Set-Cookie': cookieStrings,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Location': '/dashboard.html'
        }
    };
};
