const dashboard = {
    init: async function () {
        console.log('Dashboard initializing...');
        
        // Get the code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // We have a fresh OAuth code, let's use it directly
            const userData = await this.getUserData(code);
            this.displayUserInfo(userData);
        } else {
            // No code, redirect to login
            window.location.href = '/.netlify/functions/auth';
        }
    },

    getUserData: async function (code) {
        const response = await fetch('/.netlify/functions/getUserProfile', {
            headers: {
                'Authorization': `Code ${code}`
            }
        });
        return await response.json();
    },

    displayUserInfo: function (userData) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
    }
};
