const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const store = getStore('error-logs');
  const logData = JSON.parse(event.body);
  const timestamp = new Date().toISOString();
  const today = timestamp.split('T')[0];
  
  // Get existing logs for today
  let todayLogs = await store.get(`logs-${today}`, { type: 'json' }) || [];
  
  // Add new log entry
  todayLogs.push({
    timestamp,
    ...logData
  });
  
  // Store updated logs
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
