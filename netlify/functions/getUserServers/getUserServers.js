const fetch = require('node-fetch');

exports.handler = async (event) => {
    const token = event.headers.authorization.split(' ')[1];

    const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type'
        },
        body: JSON.stringify(data)
    };
};
