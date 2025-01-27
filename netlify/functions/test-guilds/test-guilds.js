exports.handler = async (event) => {
    try {
        const data = JSON.parse(event.body);
        
        console.log('All Guilds Count:', data.allGuilds.length);
        console.log('Managed Guilds Count:', data.managedGuilds.length);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Guild data processed successfully',
                totalGuilds: data.allGuilds.length,
                managedGuilds: data.managedGuilds.length,
                allGuilds: data.allGuilds,
                managedGuildsData: data.managedGuilds
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing guild data',
                error: error.message
            })
        };
    }
};
