const { getStore } = require('@netlify/blobs');
const fetch = require('node-fetch');

async function getGameDetails(placeId) {
    const response = await fetch(`/.netlify/functions/getGameDetails?placeId=${placeId}`);
    const data = await response.json();
    return data;
}

exports.handler = async (event, context) => {
    try {
        const store = getStore({
            name: "roblox-errors",
            siteID: process.env.NETLIFY_SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN
        });

        if (event.httpMethod === 'POST' && event.body) {
            const timestamp = new Date().toISOString();
            const errorData = JSON.parse(event.body);
            
            let gameDetails = null;
            let thumbnailUrl = null;
            
            if (errorData.game?.id) {
                gameDetails = await getGameDetails(errorData.game.id);
                if (gameDetails[0]?.universeId) {
                    const thumbnailResponse = await fetch(`/.netlify/functions/getGameDetails/thumbnail?universeId=${gameDetails[0].universeId}`);
                    const thumbnailData = await thumbnailResponse.json();
                    thumbnailUrl = thumbnailData.data[0]?.thumbnails[0]?.imageUrl;
                }
            }

            const formattedData = {
                error: errorData.error,
                gameId: errorData.game?.id || 'Unknown',
                gameName: errorData.game?.name || 'Unknown Game',
                gameThumbnail: thumbnailUrl,
                universeId: gameDetails?.[0]?.universeId,
                player: {
                    name: errorData.player?.name || 'Unknown',
                    displayName: errorData.player?.displayName || 'Unknown',
                    userId: errorData.player?.userId || 'Unknown'
                },
                executor: {
                    name: errorData.executor?.name || 'Unknown',
                    supported: errorData.executor?.supported || false,
                    isMacsploit: errorData.executor?.isMacsploit || false
                },
                script: {
                    name: errorData.script?.name || 'Unknown',
                    version: errorData.script?.version || 'Unknown',
                    timestamp: errorData.script?.timestamp || timestamp
                },
                timestamp: timestamp
            };

            await store.setJSON(`error-${timestamp}`, formattedData);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Error logged successfully" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
