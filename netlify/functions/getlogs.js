const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    const { blobs } = await store.list();
    const logs = [];
    
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      logs.push(data);
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
