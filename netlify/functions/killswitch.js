const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const store = getStore();
  const method = event.httpMethod || 'GET';
  
  if (method === 'GET') {
    let status = await store.get('killswitch');
    if (status === null) {
      status = true;
      await store.set('killswitch', true);
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
    await store.set('killswitch', status);
    
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
