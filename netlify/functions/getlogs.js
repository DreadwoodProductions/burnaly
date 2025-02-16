const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "roblox-errors",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    const { blobs } = await store.list();
    const logs = [];

    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: 'json' });
        if (data && data.error) logs.push(data);
      } catch (e) {
        continue;
      }
    }

    logs.sort((a, b) => new Date(b.script.timestamp) - new Date(a.script.timestamp));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(logs)
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify([])
    };
  }
};
