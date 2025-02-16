const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: "roblox-errors",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });
    
  const timestamp = new Date().toISOString();
  const key = `error-${timestamp}`;
    
  // Store raw data directly
  await store.setJSON(key, {
    data: JSON.parse(event.body),
    timestamp
  });
    
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Error logged successfully" })
  };
};
