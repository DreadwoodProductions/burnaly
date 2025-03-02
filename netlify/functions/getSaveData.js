exports.handler = async (event) => {
    const fs = require('fs').promises;
    const path = require('path');

    try {
        const userId = event.queryStringParameters.userId;
        const userDir = path.join('userData', userId.toString());
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
            body: JSON.stringify(saveData)
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
