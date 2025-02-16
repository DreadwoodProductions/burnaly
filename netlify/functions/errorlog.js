const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const store = getStore('error-logs');
  const today = new Date().toISOString().split('T')[0];
  
  if (event.httpMethod === 'POST') {
    const logData = {
      timestamp: new Date().toISOString(),
      ...JSON.parse(event.body)
    };
    
    let todayLogs = await store.get(`logs-${today}`, { type: 'json' }) || [];
    todayLogs.push(logData);
    
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
