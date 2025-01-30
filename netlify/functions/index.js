exports.handler = async (event, context) => {
  switch (event.httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          status: 'online',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          endpoints: [
            '/guilds',
            '/users',
            '/status',
            '/settings',
            '/presence'
          ],
          features: {
            auth: true,
            realtime: true,
            notifications: true
          }
        })
      }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      }
  }
}
