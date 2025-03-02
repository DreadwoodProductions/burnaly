const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const saveData = JSON.parse(event.body);
        const userId = saveData.player.userId;
        const timestamp = Date.now();
        const fileName = `${userId}_${timestamp}.json`;
        
        // Store in a dedicated directory for each user
        const userDir = path.join('userData', userId.toString());
        await fs.mkdir(userDir, { recursive: true });
        
        await fs.writeFile(
            path.join(userDir, fileName),
            JSON.stringify(saveData, null, 2)
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Data saved successfully',
                userId: userId,
                timestamp: timestamp,
                fileName: fileName
            })
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
