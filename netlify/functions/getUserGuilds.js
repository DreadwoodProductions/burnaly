const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  try {
    const { access_token } = JSON.parse(event.body);
    
    // Fetch user's guilds from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const guilds = await response.json();

    // Get additional guild data for each server
    const detailedGuilds = await Promise.all(
      guilds.map(async (guild) => {
        // Check if user has admin permissions
        const isAdmin = (guild.permissions & 0x8) === 0x8;
        
        // Get member count if user is admin
        let memberCount = null;
        if (isAdmin) {
          const guildDetails = await fetch(`https://discord.com/api/v10/guilds/${guild.id}`, {
            headers: { Authorization: `Bearer ${access_token}` }
          }).then(r => r.json());
          memberCount = guildDetails.approximate_member_count;
        }

        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : '/images/default-server-icon.png',
          features: guild.features,
          permissions: guild.permissions,
          isAdmin,
          memberCount,
          channels: isAdmin ? await fetch(`https://discord.com/api/v10/guilds/${guild.id}/channels`, {
            headers: { Authorization: `Bearer ${access_token}` }
          }).then(r => r.json()) : []
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        guilds: detailedGuilds,
        meta: {
          total: detailedGuilds.length,
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch guild data' })
    };
  }
};
