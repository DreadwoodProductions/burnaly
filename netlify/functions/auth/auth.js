export const handler = async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'identify guilds guilds.members.read';

    return {
        statusCode: 302,
        headers: {
            Location: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`,
        },
    };
};