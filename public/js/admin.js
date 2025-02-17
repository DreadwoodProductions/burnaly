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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/.netlify/functions/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('adminToken', data.token);
            showAdminPanel();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        alert('Login failed');
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    showLoginForm();
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

async function setStatus(status) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/killswitch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert(`Script ${status ? 'enabled' : 'disabled'} successfully`);
        } else if (response.status === 401) {
            localStorage.removeItem('adminToken');
            showLoginForm();
        } else {
            alert('Operation failed');
        }
    } catch (error) {
        alert('Operation failed');
    }
}
