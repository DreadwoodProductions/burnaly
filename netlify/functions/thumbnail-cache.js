const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const store = await getStore('game-thumbnails', {
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_AUTH_TOKEN
  });
  
  const placeId = event.queryStringParameters.placeId;
  
  try {
    // Check if thumbnail exists in cache
    const cachedThumbnail = await store.get(`thumbnail-${placeId}`);
    if (cachedThumbnail) {
      return {
        statusCode: 200,
        body: cachedThumbnail
      };
    }

    // Fetch from Roblox APIs if not cached
    const placeInfo = await fetch(
      `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`
    ).then(r => r.json());

    const universeId = placeInfo[0].universeId;
    const thumbnailData = await fetch(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`
    ).then(r => r.json());

    const imageUrl = thumbnailData.data[0].thumbnails[0].imageUrl;

    // Cache the result
    await store.setJSON(`thumbnail-${placeId}`, {
      imageUrl,
      cached: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
