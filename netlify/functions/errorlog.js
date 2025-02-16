const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    // Generate a unique key for each error
    const timestamp = new Date().toISOString();
    const key = `error-${timestamp}`;
    
    // Store the error data
    await store.set(key, event.body);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Error logged successfully" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
