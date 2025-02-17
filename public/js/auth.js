const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Add error logging
  console.log('Auth function called', event.httpMethod);
  
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing environment variables' })
    };
  }

  if (event.httpMethod === 'GET') {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds`;
    
    return {
      statusCode: 302,
      headers: {
        'Location': authUrl
      },
      body: ''
    };
  }
};
