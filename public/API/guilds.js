fetch('/test-guilds', {
  method: 'GET', // Ensure this matches the allowed methods on the server
  headers: {
    'Content-Type': 'application/json'
  }
})
