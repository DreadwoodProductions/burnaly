const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Check for valid authentication
  if (!event.headers.authorization?.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // Ensure method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const store = getStore({
      name: "killswitch",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    // Get current status
    const currentStatus = await store.get('status') || false;
    
    // Toggle the status
    const newStatus = !currentStatus;
    
    // Set the new toggled status
    await store.set('status', newStatus);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ status: newStatus })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
