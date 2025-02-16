const { getStore } = require('@netlify/blobs');

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
      
      await store.setJSON(`error-${timestamp}`, errorData);
    }

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
