const { getStore } = require('@netlify/blobs');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    if (event.httpMethod === 'POST' && event.body) {
      const timestamp = new Date().toISOString();
      const errorData = JSON.parse(event.body);
      
      // Structure the data consistently
      const formattedData = {
        error: errorData.error,
        gameId: errorData.game?.id || 'Unknown',
        gameName: errorData.game?.name || 'Unknown Game',
        player: {
          name: errorData.player?.name || 'Unknown',
          displayName: errorData.player?.displayName || 'Unknown',
          userId: errorData.player?.userId || 'Unknown'
        },
        executor: {
          name: errorData.executor?.name || 'Unknown',
          supported: errorData.executor?.supported || false,
          isMacsploit: errorData.executor?.isMacsploit || false
        },
        script: {
          name: errorData.script?.name || 'Unknown',
          version: errorData.script?.version || 'Unknown',
          timestamp: errorData.script?.timestamp || timestamp
        },
        timestamp: timestamp
      };

      await store.setJSON(`error-${timestamp}`, formattedData);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: "Error logged successfully" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
