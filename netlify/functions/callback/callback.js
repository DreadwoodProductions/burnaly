const fetch = require('node-fetch');

exports.handler = async (event) => {
    const code = event.queryStringParameters.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    try {
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
        const userData = await getUserData(tokens.access_token);
        const sessionData = Buffer.from(JSON.stringify(userData)).toString('base64');

        // Combine multiple cookies into a single string
        const cookieString = [
            `session=${sessionData}; Path=/; Secure; HttpOnly; SameSite=Lax`,
            `discord_token=${tokens.access_token}; Path=/; Secure; HttpOnly; SameSite=Lax`
        ].join(', ');

        return {
            statusCode: 302,
            headers: {
                'Set-Cookie': cookieString,
                'Cache-Control': 'no-cache',
                'Location': '/dashboard.html'
            }
        };
    } catch (error) {
        console.error('Auth Error:', error);
        return {
            statusCode: 302,
            headers: {
                'Location': '/?error=auth_failed'
            }
        };
    }
};

async function getUserData(token) {
    const [userResponse, guildsResponse] = await Promise.all([
        fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${token}` }
        })
    ]);

    const userData = await userResponse.json();
    const guildsData = await guildsResponse.json();

    return {
        userId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        guilds: guildsData
    };
}
