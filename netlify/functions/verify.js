const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  // Check if Authorization header exists
  if (!event.headers.authorization?.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  const token = event.headers.authorization.split(' ')[1];

  try {
    // Verify the token using your secret key
    jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ valid: true })
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};
