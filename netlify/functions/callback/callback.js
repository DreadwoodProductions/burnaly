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
    
    // Combine multiple cookies into a single string with comma separation
    const cookieString = [
        `discord_token=${tokens.access_token}; Path=/; Secure; SameSite=Lax`,
        `discord_refresh_token=${tokens.refresh_token}; Path=/; Secure; SameSite=Lax`
    ].join(', ');

    return {
        statusCode: 302,
        headers: {
            'Set-Cookie': cookieString,
            'Cache-Control': 'no-cache',
            'Location': '/dashboard.html'
        }
    };
};
