const handler = async () => {
    const clientId = '1333103933610135662';
    const redirectUri = 'https://burnaly.com/.netlify/functions/callback';
    const scopes = ['identify', 'guilds', 'email'];

    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('+')}`;

    return {
        statusCode: 302,
        headers: {
            Location: authUrl,
        },
    };
};

exports.handler = handler;  