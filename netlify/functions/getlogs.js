const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    const dateParam = event.queryStringParameters?.date;
    let logs = [];
    
    const { blobs } = await store.list();
    
    for (const blob of blobs) {
      const rawData = await store.get(blob.key);
      try {
        const errorData = JSON.parse(rawData);
        logs.push({
          time: errorData.script.timestamp,
          game: {
            name: errorData.game.name,
            id: errorData.game.id
          },
          player: {
            name: errorData.player.name,
            displayName: errorData.player.displayName,
            userId: errorData.player.userId
          },
          error: errorData.error,
          script: errorData.script.name
        });
      } catch (e) {
        // Skip invalid entries
        continue;
      }
    }
    
    // Filter by date if provided
    if (dateParam) {
      const [month, day, year] = dateParam.split('/');
      const searchDate = `20${year}-${month}-${day}`;
      logs = logs.filter(log => log.time.includes(searchDate));
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(logs, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
