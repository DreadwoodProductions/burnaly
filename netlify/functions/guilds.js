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
          guilds: [
            {
              id: '123456789',
              name: 'Test Guild 1',
              memberCount: 100,
              icon: 'https://example.com/icon1.png'
            },
            {
              id: '987654321',
              name: 'Test Guild 2',
              memberCount: 200,
              icon: 'https://example.com/icon2.png'
            }
          ]
        })
      }
    case 'POST':
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Guild created successfully'
        })
      }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      }
  }
}
