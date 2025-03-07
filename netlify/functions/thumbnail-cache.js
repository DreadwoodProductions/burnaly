const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "game-thumbnails",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    const placeId = event.queryStringParameters.placeId;
    if (!placeId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "Missing placeId parameter" })
      };
    }

    // Step 1: Get universeId from placeId
    const placeResponse = await fetch(
      `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NetlifyBot/1.0)'
        }
      }
    );
    
    const placeData = await placeResponse.json();
    console.log('Place Data:', placeData);
    
    // Verify we have the place data before proceeding
    if (!placeData || !placeData[0]) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "Game not found" })
      };
    }

    const universeId = placeData[0].universeId;
    console.log('Universe ID:', universeId);

    // Step 2: Now that we have the universeId, get the thumbnail
    const thumbnailResponse = await fetch(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NetlifyBot/1.0)'
        }
      }
    );
    
    const thumbnailData = await thumbnailResponse.json();
    console.log('Thumbnail Data:', thumbnailData);

    const imageUrl = thumbnailData.data[0].thumbnails[0].imageUrl;

    const result = { 
      imageUrl,
      name: placeData[0].name,
      description: placeData[0].description,
      builder: placeData[0].builder,
      placeId: parseInt(placeId),
      universeId,
      cached: new Date().toISOString()
    };
    
    await store.setJSON(`thumbnail-${placeId}`, result);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error:', error);
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
