const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const store = getStore({
    name: "killswitch",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });

  const method = event.httpMethod;
  
  if (method === 'GET') {
    const status = await store.get('status') || false;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ status })
    };
  }
  
  if (method === 'POST') {
    try {
      const currentStatus = await store.get('status') || false;
      const newStatus = !currentStatus;
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
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to update status' })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
