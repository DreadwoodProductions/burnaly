exports.handler = async (event) => {
  const { method } = event;
  const db = require('./db'); // Using a simple JSON file for persistence
  
  if (method === 'GET') {
    const status = await db.getStatus();
    return {
      statusCode: 200,
      body: JSON.stringify({ status })
    };
  }
  
  if (method === 'POST') {
    const { status } = JSON.parse(event.body);
    await db.setStatus(status);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Status updated successfully' })
    };
  }
};
