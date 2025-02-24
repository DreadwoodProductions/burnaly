const { getStore } = require('@netlify/blobs');
const fetch = require('node-fetch');

async function getGameDetails(placeId) {
    const response = await fetch(`https://burnaly.com/.netlify/functions/getGameDetails?placeId=${placeId}`);
    return await response.json();
}

async function getGameThumbnail(universeId) {
    const response = await fetch(`https://burnaly.com/.netlify/functions/getGameDetails/thumbnail?universeId=${universeId}`);
    return await response.json();
}

exports.handler = async (event, context) => {
    const store = getStore({
        name: "roblox-errors",
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN
    });

    if (event.httpMethod === 'POST' && event.body) {
        const timestamp = new Date().toISOString();
        const errorData = JSON.parse(event.body);
        
        const gameDetails = await getGameDetails(errorData.game?.id);
        let thumbnailData = null;
        
        if (gameDetails[0]?.universeId) {
            thumbnailData = await getGameThumbnail(gameDetails[0].universeId);
        }

        const formattedError = {
            error: errorData.error,
            game: {
                id: gameDetails[0]?.placeId || errorData.game?.id,
                name: gameDetails[0]?.name || 'Unknown Game',
                url: gameDetails[0]?.url,
                universeId: gameDetails[0]?.universeId,
                thumbnail: thumbnailData?.data[0]?.thumbnails[0]?.imageUrl
            },
            player: errorData.player,
            executor: errorData.executor,
            script: {
                ...errorData.script,
                timestamp
            },
            timestamp
        };

        await store.setJSON(`error-${timestamp}`, formattedError);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true })
        };
    }
};
