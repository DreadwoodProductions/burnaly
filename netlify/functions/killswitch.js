const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY;

function verifyTimestamp(timestamp) {
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.abs(currentTime - timestamp) < 30;
}

function generateServerSignature(nonce, timestamp) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${nonce}${timestamp}`)
    .digest('hex');
}

exports.handler = async (event) => {
  const store = getStore({
    name: "killswitch",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });
  
  const method = event.httpMethod;

  if (method === 'GET') {
    const { nonce, timestamp } = event.queryStringParameters;
    const clientSignature = event.headers['x-client-signature'];

    // Verify security parameters
    if (!nonce || !timestamp || !clientSignature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid security parameters' })
      };
    }

    // Verify timestamp
    if (!verifyTimestamp(timestamp)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid timestamp' })
      };
    }

    let status = await store.get('status');
    if (status === null || status === undefined) {
      status = true; // Set default to true
      await store.set('status', true);
    }

    const serverSignature = generateServerSignature(nonce, timestamp);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        status,
        timestamp: Math.floor(Date.now() / 1000),
        nonce,
        serverSignature
      })
    };
  }

  if (method === 'POST') {
    // Verify admin authentication here
    const authToken = event.headers['x-admin-token'];
    if (authToken !== process.env.ADMIN_TOKEN) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    try {
      const { status } = JSON.parse(event.body);
      await store.set('status', status);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({ 
          status,
          timestamp: Math.floor(Date.now() / 1000)
        })
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
