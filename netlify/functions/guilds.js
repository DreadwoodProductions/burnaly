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
          guilds: [
            {
              id: '123456789',
              name: 'Test Guild 1',
              memberCount: 100,
              icon: 'https://example.com/icon1.png',
              features: ['COMMUNITY', 'VERIFIED'],
              roles: ['admin', 'moderator', 'member'],
              channels: [
                { id: 'ch1', name: 'general', type: 'text' },
                { id: 'ch2', name: 'voice', type: 'voice' }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: '987654321',
              name: 'Test Guild 2',
              memberCount: 200,
              icon: 'https://example.com/icon2.png',
              features: ['PARTNERED'],
              roles: ['owner', 'member'],
              channels: [
                { id: 'ch3', name: 'announcements', type: 'text' },
                { id: 'ch4', name: 'gaming', type: 'voice' }
              ],
              createdAt: new Date().toISOString()
            }
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 10
          },
          meta: {
            lastUpdated: new Date().toISOString()
          }
        })
      }
    case 'POST':
      try {
        const data = JSON.parse(event.body)
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Guild created successfully',
            guild: {
              ...data,
              id: Date.now().toString(),
              createdAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid request body' })
        }
      }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      }
  }
}
