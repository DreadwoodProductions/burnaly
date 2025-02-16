const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const store = getStore('error-logs');
  const date = event.queryStringParameters.date || new Date().toISOString().split('T')[0];
  
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
