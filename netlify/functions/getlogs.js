const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    // First, let's see what blobs we have
    const { blobs } = await store.list();
    console.log('Found blobs:', blobs);
    
    let logs = [];
    
    for (const blob of blobs) {
      const rawData = await store.get(blob.key);
      console.log('Raw data for', blob.key, ':', rawData);
      
      const errorData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      logs.push(errorData);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        totalBlobs: blobs.length,
        rawLogs: logs
      }, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};
