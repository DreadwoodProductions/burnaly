// Check if user is authenticated and handle OAuth flow
export async function checkAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = localStorage.getItem('discord_access_token');
    
    if (code) {
        await handleOAuthCallback(code);
    }

    updateNavigation(token);
    return !!token;
}

// Update navigation based on auth status
function updateNavigation(token) {
    const navAuth = document.querySelector('.nav-auth');
    const heroButtons = document.querySelector('.hero-cta');
    
    if (token) {
        navAuth.innerHTML = `
            <button class="dashboard-btn glass-card" onclick="window.location.href='/dashboard'">
                <i class="fas fa-columns"></i> Dashboard
            </button>
            <button class="profile-btn glass-card" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        
        if (heroButtons) {
            heroButtons.innerHTML = `
                <button class="primary-btn pulse glass-card" onclick="window.location.href='/dashboard'">
                    Open Dashboard
                </button>
                <button class="secondary-btn glass-card">
                    Watch Demo
                </button>
            `;
        }
        
        setupLogoutHandler();
        fetchUserProfile(token);
    } else {
        navAuth.innerHTML = `
            <button class="login-btn glass-card" onclick="window.location.href='/.netlify/functions/auth'">
                <i class="fab fa-discord"></i> Login With Discord
            </button>
        `;
    }
}

// Handle OAuth callback
async function handleOAuthCallback(code) {
    try {
        const response = await fetch('/.netlify/functions/callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.access_token) {
            localStorage.setItem('discord_access_token', data.access_token);
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = '/?error=auth_failed';
    }
}

// Fetch user profile from Discord
async function fetchUserProfile(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const userData = await response.json();
        localStorage.setItem('discord_user_data', JSON.stringify(userData));
        
        updateUserDisplay(userData);
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
    }
}

// Update UI with user data
function updateUserDisplay(userData) {
    const profileButton = document.querySelector('.profile-btn');
    if (profileButton && userData.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        profileButton.innerHTML = `<img src="${avatarUrl}" alt="${userData.username}" class="user-avatar">`;
    }
}

// Setup logout functionality
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('discord_access_token');
            localStorage.removeItem('discord_user_data');
            window.location.href = '/';
        });
    }
}

// Initialize authentication check
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Export necessary functions
export { handleOAuthCallback, updateNavigation };
