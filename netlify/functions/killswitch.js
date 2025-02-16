const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = getStore({
    name: 'killswitch-store',
    siteID: context.site.id,
    token: process.env.NETLIFY_BLOBS_TOKEN
  });
  
  const method = event.httpMethod || 'GET';
  
  if (method === 'GET') {
    let status = await store.get('status');
    if (status === null) {
      status = true;
      await store.set('status', true);
    }
    
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
    const { status } = JSON.parse(event.body);
    await store.set('status', status);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Status updated successfully' })
    };
  }
};
