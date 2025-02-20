const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        if (event.path === '/.netlify/functions/getGameDetails') {
            const placeId = event.queryStringParameters.placeId;
            const response = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cookie': `.ROBLOSECURITY=${process.env.ROBLOX_COOKIE}`
                }
            });
            const data = await response.json();
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(data)
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
