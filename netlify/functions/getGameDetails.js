const fetch = require('node-fetch');

exports.handler = async (event) => {
    const placeId = event.queryStringParameters.placeId;
    
    const response = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`, {
        headers: {
            'Accept': 'application/json'
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
};
