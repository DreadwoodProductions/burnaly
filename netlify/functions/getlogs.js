const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: "roblox-errors",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });

  try {
    const { blobs } = await store.list();
    const logs = [];

    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: 'json' });
        if (data) logs.push(data);
      } catch (error) {
        continue; // Skip invalid entries
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(logs, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ logs: [], message: "No logs found" })
    };
  }
};
