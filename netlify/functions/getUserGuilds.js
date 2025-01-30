const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { access_token } = JSON.parse(event.body);
  
  const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });

  const guilds = await response.json();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      guilds: guilds.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : '/images/default-server-icon.png',
        features: guild.features,
        permissions: guild.permissions
      }))
    })
  };
};
