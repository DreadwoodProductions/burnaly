// Add this function to handle guild requests
export const fetchTestGuilds = async () => {
  const response = await fetch('/test-guilds', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
