exports.handler = async (event, context) => {
  // Handle different HTTP methods
  switch (event.httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'online',
          version: '1.0.0',
          endpoints: [
            '/guilds',
            '/users',
            '/status'
          ]
        })
      }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      }
  }
}
