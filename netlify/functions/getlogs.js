const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: 'error-logs',
    siteID: context.site.id,
    token: process.env.NETLIFY_BLOBS_TOKEN
  });

  const date = event.queryStringParameters?.date || new Date().toISOString().split('T')[0];
  const logs = await store.get(`logs-${date}`, { type: 'json' }) || [];
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(logs)
  };
};
