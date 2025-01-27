const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log('Auth Function Started');
    console.log('Headers:', event.headers);
    
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds`;
    
    console.log('Generated Auth URL:', authUrl);
    
    return {
        statusCode: 302,
        headers: {
            Location: authUrl
        }
    };
};
