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
      
      if (logEntry.method === 'POST' && logEntry.data) {
        const errorData = JSON.parse(logEntry.data);
        const formattedTime = new Date(logEntry.timestamp).toLocaleString();
        logs.push(`Time: ${formattedTime}\nPlayer: ${errorData.player}\nGame: ${errorData.game}\nScript: ${errorData.script}\nError: ${errorData.error}\n-------------------`);
      }
    }
    
    if (dateParam) {
      const [month, day, year] = dateParam.split('/');
      const searchDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      logs = logs.filter(log => log.includes(searchDate));
    }
    
    return {
      statusCode: 200,
      body: logs.join('\n')
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
};
