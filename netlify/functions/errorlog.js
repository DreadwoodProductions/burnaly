const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // For GET requests, return current logs status
  if (event.httpMethod === 'GET') {
    const store = getStore('error-logs');
    const today = new Date().toISOString().split('T')[0];
    const logs = await store.get(`logs-${today}`, { type: 'json' }) || [];
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(logs)
    };
  }

  // Handle POST requests for new logs
  if (event.httpMethod === 'POST') {
    const store = getStore('error-logs');
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
      body: JSON.stringify({ message: 'Log stored successfully' })
    };
  }
};
