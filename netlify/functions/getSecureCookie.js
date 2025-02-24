const crypto = require('crypto');

exports.handler = async (event) => {
    // Validate request headers
    if (!event.headers['x-game-id'] || !event.headers['x-client-id']) {
        return { statusCode: 400 };
    }

    // Rate limiting per client
    const clientId = event.headers['x-client-id'];
    if (!handleRateLimit(clientId)) {
        return { statusCode: 429 };
    }

    // Encrypt response with rotating keys
    const encryptedCookie = encryptWithRotatingKey(process.env.ROBLOX_COOKIE);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        },
        body: JSON.stringify({ cookie: encryptedCookie })
    };
};
