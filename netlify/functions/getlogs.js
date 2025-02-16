const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    // Get date from query parameter
    const dateParam = event.queryStringParameters?.date;
    const logs = [];
    
    if (dateParam) {
      // Parse date in MM/DD/YY format
      const [month, day, year] = dateParam.split('/');
      const searchDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const { blobs } = await store.list();
      
      for (const blob of blobs) {
        const data = await store.get(blob.key);
        const parsedData = JSON.parse(data);
        
        // Check if log is from requested date
        if (parsedData.timestamp.startsWith(searchDate)) {
          logs.push(parsedData);
        }
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(logs)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
