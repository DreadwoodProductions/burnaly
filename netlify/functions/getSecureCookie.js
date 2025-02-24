const crypto = require('crypto');

// Rate limiting implementation using memory store
const rateLimit = new Map();

function handleRateLimit(clientId) {
    const now = Date.now();
    const limit = 100; // requests
    const window = 60000; // 1 minute in milliseconds
    
    if (!rateLimit.has(clientId)) {
        rateLimit.set(clientId, {
            count: 1,
            firstRequest: now
        });
        return true;
    }
    
    const client = rateLimit.get(clientId);
    
    if (now - client.firstRequest > window) {
        client.count = 1;
        client.firstRequest = now;
        return true;
    }
    
    if (client.count >= limit) {
        return false;
    }
    
    client.count++;
    return true;
}

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

    // Return the cookie
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        },
        body: JSON.stringify({ cookie: process.env.ROBLOX_COOKIE })
    };
};
