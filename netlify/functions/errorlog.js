const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: "roblox-errors",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });

  // Handle GET requests differently from POST
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "Ready to receive error logs" })
    };
  }

  // For POST requests, process the error data
  const timestamp = new Date().toISOString();
  const key = `error-${timestamp}`;
  
  try {
    const errorData = event.body ? JSON.parse(event.body) : { error: "No data provided" };
    await store.setJSON(key, {
      data: errorData,
      timestamp,
      method: event.httpMethod
    });
  } catch (error) {
    await store.setJSON(key, {
      data: { error: "Invalid JSON data", raw: event.body },
      timestamp,
      method: event.httpMethod
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Data processed successfully" })
  };
};
