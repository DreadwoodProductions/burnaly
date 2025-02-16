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
      const data = await store.get(blob.key);
      const parsedData = JSON.parse(data);
      
      if (parsedData.Body) {
        const errorData = JSON.parse(parsedData.Body);
        logs.push({
          timestamp: errorData.script.timestamp,
          error: errorData.error,
          game: errorData.game,
          player: errorData.player,
          script: errorData.script
        });
      }
    }
    
    // Filter by date if provided
    if (dateParam) {
      const [month, day, year] = dateParam.split('/');
      const searchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      logs = logs.filter(log => log.timestamp.includes(searchDate));
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
