const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: "game-thumbnails",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    const placeId = event.queryStringParameters.placeId;
    
    // Step 1: Get universeId from placeId
    const placeResponse = await fetch(
      `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`
    );
    
    const placeInfo = await placeResponse.json();
    const universeId = placeInfo[0].universeId;

    // Step 2: Get thumbnail using universeId
    const thumbnailResponse = await fetch(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`
    );
    
    const thumbnailData = await thumbnailResponse.json();
    const imageUrl = thumbnailData.data[0].thumbnails[0].imageUrl;

    const result = { 
      imageUrl,
      name: placeInfo[0].name,
      description: placeInfo[0].description,
      builder: placeInfo[0].builder,
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
