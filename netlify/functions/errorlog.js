const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: "roblox-errors",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });

  if (event.httpMethod === 'POST') {
    const timestamp = new Date().toISOString();
    const errorData = JSON.parse(event.body);
    
    await store.setJSON(`error-${timestamp}`, {
      ...errorData,
      logId: `error-${timestamp}`
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Error logged successfully" })
  };
};
