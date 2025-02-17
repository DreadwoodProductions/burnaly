checkAuth();

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
    } else {
        showAdminPanel();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    document.getElementById('loading').style.display = 'flex';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/.netlify/functions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('adminToken', data.token);
            showAdminPanel();
            showNotification('Login successful');
        } else {
            showNotification('Invalid credentials');
        }
    } catch (error) {
        showNotification('Login failed');
    }
    
    document.getElementById('loading').style.display = 'none';
}

function logout() {
    localStorage.removeItem('adminToken');
    showLoginForm();
    showNotification('Logged out successfully');
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notification-message').textContent = message;
    notification.style.display = 'flex';
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

async function setStatus(status) {
    document.getElementById('loading').style.display = 'flex';
    try {
        const response = await fetch('/.netlify/functions/killswitch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Script ${status ? 'enabled' : 'disabled'} successfully`);
        } else if (response.status === 401) {
            localStorage.removeItem('adminToken');
            showLoginForm();
            showNotification('Session expired. Please login again');
        } else {
            showNotification('Operation failed');
        }
    } catch (error) {
        showNotification('Operation failed');
    }
    document.getElementById('loading').style.display = 'none';
}
