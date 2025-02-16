const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      data: event.body,
      path: event.path,
      method: event.httpMethod
    };
    
    await store.setJSON(`error-${timestamp}`, logEntry);
    
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
