import fetch from 'node-fetch';

export const handler = async (event, context) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = 'https://burnaly.com/.netlify/functions/auth';

  if (event.queryStringParameters.code) {
    const code = event.queryStringParameters.code;
    
    try {
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          scope: 'identify guilds guilds.members.read',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const tokenData = await tokenResponse.json();
      
      // Set cookie and redirect to dashboard
      return {
        statusCode: 302,
        headers: {
          'Set-Cookie': `discord_token=${tokenData.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
          'Location': '/dashboard',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    } catch (error) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/?error=auth_failed'
        },
        body: ''
      };
    }
  }

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
  
  return {
    statusCode: 302,
    headers: {
      'Location': authUrl,
      'Cache-Control': 'no-cache'
    },
    body: ''
  };
};
