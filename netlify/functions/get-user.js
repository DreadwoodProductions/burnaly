import fetch from 'node-fetch';

export const handler = async (event, context) => {
  const token = event.headers.cookie?.split(';')
    .find(c => c.trim().startsWith('discord_token='))
    ?.split('=')[1];

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch user data' }),
    };
  }
};
