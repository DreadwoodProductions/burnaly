const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  // Verify JWT from the request
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Missing authentication' })
    };
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Only return admin token if JWT is valid
    return {
      statusCode: 200,
      body: JSON.stringify({
        token: process.env.ADMIN_TOKEN
      })
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};
