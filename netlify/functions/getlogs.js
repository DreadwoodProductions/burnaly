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
      const logEntry = JSON.parse(data);
      
      // Only include POST requests with actual error data
      if (logEntry.method === 'POST' && logEntry.data) {
        const errorData = JSON.parse(logEntry.data);
        logs.push({
          time: new Date(logEntry.timestamp).toLocaleString(),
          player: errorData.player,
          game: errorData.game,
          script: errorData.script,
          error: errorData.error
        });
      }
    }
    
    // Filter by date if provided
    if (dateParam) {
      const [month, day, year] = dateParam.split('/');
      const searchDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      logs = logs.filter(log => log.time.includes(searchDate));
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(logs, null, 2) // Pretty print JSON
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
