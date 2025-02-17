const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, password } = JSON.parse(event.body);
        
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        const token = jwt.sign(
            { email: process.env.ADMIN_EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
