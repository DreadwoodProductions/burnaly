exports.handler = async (event) => {
    const fs = require('fs').promises;
    const path = require('path');

    // Add check for userId
    if (!event.queryStringParameters || !event.queryStringParameters.userId) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ data: [], message: 'UserId is required' })
        };
    }

    try {
        const userId = event.queryStringParameters.userId;
        const userDir = path.join(__dirname, '../userData', userId);
        
        // Check if directory exists
        try {
            await fs.access(userDir);
        } catch {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ data: [], message: 'No data found for this user' })
            };
        }

        const files = await fs.readdir(userDir);
        const saveData = [];

        for (const file of files) {
            const data = await fs.readFile(path.join(userDir, file), 'utf8');
            saveData.push(JSON.parse(data));
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ data: saveData })
        };
    } catch (error) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ data: [], message: error.message })
        };
    }
};
