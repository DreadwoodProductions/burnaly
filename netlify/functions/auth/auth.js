const fetch = require('node-fetch');

exports.handler = async (event) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    
    // Enhanced scope for full Discord integration
    const scope = 'identify email guilds guilds.join guilds.members.read';
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    
    return {
        statusCode: 302,
        headers: {
            'Location': authUrl,
            'Cache-Control': 'no-cache'
        }
    };
};
