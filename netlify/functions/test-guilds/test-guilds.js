exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { guilds } = JSON.parse(event.body);
        
        // Process the guilds data
        const processedGuilds = guilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            isVerified: guild.verified || false,
            memberCount: guild.approximate_member_count || 'Unknown'
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Guilds processed successfully',
                data: processedGuilds
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing guilds',
                error: error.message
            })
        };
    }
};
