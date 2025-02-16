const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: "roblox-errors",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });
    
  const { blobs } = await store.list();
  const logs = [];
    
  for (const blob of blobs) {
    const data = await store.get(blob.key, { type: 'json' });
    if (data) logs.push(data);
  }
    
  return {
    statusCode: 200,
    body: JSON.stringify(logs, null, 2)
  };
};
