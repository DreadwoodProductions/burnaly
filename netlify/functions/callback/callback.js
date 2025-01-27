const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Get the authorization code from Discord
    const code = event.queryStringParameters.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    // Exchange the code for access token
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

    // Set secure cookie with the access token
    const cookieString = `discord_token=${tokens.access_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`;

    // Clean redirect to dashboard
    return {
        statusCode: 302,
        headers: {
            'Set-Cookie': cookieString,
            'Cache-Control': 'no-cache',
            'Location': '/dashboard.html'
        }
    };
};
