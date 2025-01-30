exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      totalMembers: 12345,
      activeServers: 48,
      commandsUsed: 89742,
      uptime: 99.9,
      memberGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [0, 20, 40, 80, 120, 180]
      },
      commandUsage: {
        labels: ['Help', 'Play', 'Skip', 'Queue', 'Stop'],
        data: [300, 250, 200, 150, 100]
      }
    })
  }
}
