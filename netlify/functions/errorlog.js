const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const store = getStore({
    name: 'error-logs',
    siteID: context.site.id,
    token: process.env.NETLIFY_BLOBS_TOKEN
  });

  const logData = JSON.parse(event.body);
  const timestamp = new Date().toISOString();
  const today = timestamp.split('T')[0];
  
  let todayLogs = await store.get(`logs-${today}`, { type: 'json' }) || [];
  todayLogs.push({
    timestamp,
    ...logData
  });
  
  await store.setJSON(`logs-${today}`, todayLogs);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ message: 'Error logged successfully' })
  };
};
