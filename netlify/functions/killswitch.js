let killSwitchStatus = true;

exports.handler = async (event) => {
  const method = event.httpMethod;
  
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ status: killSwitchStatus })
    };
  }
  
  if (method === 'POST') {
    try {
      const { status } = JSON.parse(event.body);
      killSwitchStatus = status;
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Status updated successfully' })
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
