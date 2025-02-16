const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'status.json');

const getStatus = async () => {
  if (!fs.existsSync(dbPath)) {
    await setStatus(true);
  }
  const data = JSON.parse(fs.readFileSync(dbPath));
  return data.status;
};

const setStatus = async (status) => {
  fs.writeFileSync(dbPath, JSON.stringify({ status }));
};

exports.handler = async (event) => {
  const { method } = event;
  
  if (method === 'GET') {
    const status = await getStatus();
    return {
      statusCode: 200,
      body: JSON.stringify({ status })
    };
  }
  
  if (method === 'POST') {
    const { status } = JSON.parse(event.body);
    await setStatus(status);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Status updated successfully' })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
};
