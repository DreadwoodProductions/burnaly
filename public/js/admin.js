// Debug configuration
const DEBUG = {
    enabled: false,
    log: function(component, message, data = null) {
        if (this.enabled) {
            console.log(`[${component}] ${message}`, data || '');
        }
    },
    error: function(component, message, error = null) {
        if (this.enabled) {
            console.error(`[${component}] ${message}`, error || '');
        }
    }
};

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
        return false;
    }
    return true;
}

let charts = null;

document.addEventListener('DOMContentLoaded', initializeAdmin);

async function initializeAdmin() {
    DEBUG.log('Init', 'Starting admin initialization');
    const token = localStorage.getItem('adminToken');
    if (!token) {
        DEBUG.log('Auth', 'No token found, showing login form');
        showLoginForm();
        return;
    }
    try {
        const response = await fetch('/.netlify/functions/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            DEBUG.error('Auth', 'Token verification failed');
            logout();
            return;
        }
        DEBUG.log('Auth', 'Token verified successfully');
        showAdminPanel();
        initDashboard();
    } catch (error) {
        DEBUG.error('Auth', 'Session verification failed', error);
        logout();
    }
}

function initializeCharts() {
    DEBUG.log('Charts', 'Initializing charts');
    const errorCtx = document.getElementById('errorChart').getContext('2d');
    const errorChart = new Chart(errorCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Errors',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(156, 163, 175)',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: 'rgb(156, 163, 175)',
                        font: {
                            size: 12
                        }
                    },
                    grid: { 
                        color: 'rgba(75, 85, 99, 0.2)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        color: 'rgb(156, 163, 175)',
                        font: {
                            size: 12
                        }
                    },
                    grid: { 
                        color: 'rgba(75, 85, 99, 0.2)',
                        drawBorder: false
                    }
                }
            }
        }
    });

    const executorCtx = document.getElementById('executorChart').getContext('2d');
    const executorChart = new Chart(executorCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(248, 113, 113)',
                    'rgb(34, 197, 94)',
                    'rgb(234, 179, 8)'
                ],
                borderWidth: 2,
                borderColor: 'rgb(17, 24, 39)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgb(156, 163, 175)',
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                }
            }
        }
    });
    DEBUG.log('Charts', 'Charts initialized successfully');
    return { errorChart, executorChart };
}

async function checkKillswitchStatus() {
    DEBUG.log('Killswitch', 'Checking status');
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = generateNonce();
        
        const response = await fetch(`/.netlify/functions/killswitch?nonce=${nonce}&timestamp=${timestamp}`, {
            method: 'GET',
            headers: {
                'x-client-signature': localStorage.getItem('adminToken'),
                'x-admin-token': localStorage.getItem('adminToken')
            }
        });
        
        if (response.status === 401) {
            DEBUG.error('Killswitch', 'Unauthorized access');
            logout();
            return;
        }

        const data = await response.json();
        const status = data.status === true || data.status === 'true';
        
        const statusElement = document.getElementById('killswitchStatus');
        const indicator = document.getElementById('statusIndicator');
        
        indicator.className = `w-4 h-4 rounded-full mr-3 ${status ? 'bg-green-500' : 'bg-red-500'}`;
        statusElement.textContent = status ? 'Enabled' : 'Disabled';
        
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
        DEBUG.log('Killswitch', 'Status updated successfully', { status });
        
        return status;
    } catch (error) {
        DEBUG.error('Killswitch', 'Failed to check status', error);
        return null;
    }
}

async function setStatus(enabled) {
    DEBUG.log('Killswitch', 'Setting status', { enabled });
    document.getElementById('loading').style.display = 'flex';
    
    try {
        const response = await fetch('/.netlify/functions/killswitch', {
            method: 'POST',
            headers: {
                'x-admin-token': localStorage.getItem('adminToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: enabled })
        });
        
        if (response.ok) {
            const data = await response.json();
            const statusElement = document.getElementById('killswitchStatus');
            const indicator = document.getElementById('statusIndicator');
            
            indicator.className = `w-4 h-4 rounded-full mr-3 ${enabled ? 'bg-green-500' : 'bg-red-500'}`;
            statusElement.textContent = enabled ? 'Enabled' : 'Disabled';
            
            showNotification(`Script has been successfully ${enabled ? 'enabled' : 'disabled'}`);
            document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
            DEBUG.log('Killswitch', 'Status set successfully', { enabled });
        }
    } catch (error) {
        DEBUG.error('Killswitch', 'Failed to set status', error);
        showNotification('Failed to update status');
    }
    
    document.getElementById('loading').style.display = 'none';
}

function generateNonce() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
        nonce += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return nonce;
}

async function updateDashboard() {
    DEBUG.log('Dashboard', 'Starting dashboard update');
    try {
        const response = await fetch('/.netlify/functions/getlogs', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (response.status === 401) {
            DEBUG.error('Dashboard', 'Unauthorized access');
            logout();
            return;
        }
        const logs = await response.json();
        
        const last24h = logs.filter(log => {
            return new Date(log.timestamp) > new Date(Date.now() - 24*60*60*1000);
        });
        document.getElementById('totalErrors').textContent = last24h.length;
        
        const errorTypes = {};
        last24h.forEach(log => {
            errorTypes[log.error] = (errorTypes[log.error] || 0) + 1;
        });
        const commonError = Object.entries(errorTypes)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('commonError').textContent = 
            commonError ? commonError[0].slice(0, 30) + '...' : 'None';

        const games = {};
        last24h.forEach(log => {
            const gameName = log.game?.name || 'Unknown Game';
            games[gameName] = (games[gameName] || 0) + 1;
        });
        const topGame = Object.entries(games)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('affectedGame').textContent = 
            topGame ? topGame[0] : 'None';

        updateCharts(logs);
        updateTimeline(last24h.slice(0, 5));
        DEBUG.log('Dashboard', 'Dashboard updated successfully');
    } catch (error) {
        DEBUG.error('Dashboard', 'Failed to update dashboard', error);
    }
}

function updateCharts(logs) {
    DEBUG.log('Charts', 'Updating charts');
    if (!charts) {
        charts = initializeCharts();
    }

    const hourlyData = new Array(24).fill(0);
    logs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        hourlyData[hour]++;
    });
    charts.errorChart.data.labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    charts.errorChart.data.datasets[0].data = hourlyData;
    charts.errorChart.update();

    const executorCounts = {};
    logs.forEach(log => {
        const executorName = typeof log.executor === 'object' ? 
            (log.executor.name || 'Unknown') : 
            (log.executor || 'Unknown');
        executorCounts[executorName] = (executorCounts[executorName] || 0) + 1;
    });
    charts.executorChart.data.labels = Object.keys(executorCounts);
    charts.executorChart.data.datasets[0].data = Object.values(executorCounts);
    charts.executorChart.update();
    DEBUG.log('Charts', 'Charts updated successfully');
}

function updateTimeline(recentLogs) {
    DEBUG.log('Timeline', 'Updating timeline');
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = recentLogs.map(log => `
        <div class="flex items-center space-x-4 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
                <p class="text-white text-lg">${log.error}</p>
                <div class="flex items-center gap-4 mt-2">
                    <p class="text-sm text-gray-400">${new Date(log.timestamp).toLocaleString()}</p>
                    <p class="text-sm text-blue-400">${log.game?.name || 'Unknown Game'}</p>
                </div>
            </div>
        </div>
    `).join('');
    DEBUG.log('Timeline', 'Timeline updated successfully');
}

async function handleLogin(event) {
    event.preventDefault();
    DEBUG.log('Auth', 'Processing login');
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
            initDashboard();
            DEBUG.log('Auth', 'Login successful');
        } else {
            DEBUG.error('Auth', 'Invalid credentials');
            showNotification('Invalid credentials');
        }
    } catch (error) {
        DEBUG.error('Auth', 'Login failed', error);
        showNotification('Login failed');
    }
    
    document.getElementById('loading').style.display = 'none';
}

function logout() {
    DEBUG.log('Auth', 'Logging out');
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
    setTimeout(hideNotification, 3000);
}

function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

function initDashboard() {
    DEBUG.log('Dashboard', 'Initializing dashboard');
    charts = initializeCharts();
    updateDashboard();
    checkKillswitchStatus();
    
    // Set up auto-refresh interval
    setInterval(() => {
        updateDashboard();
        checkKillswitchStatus();
    }, 30000);
}

// Toggle debug mode function
function toggleDebug() {
    DEBUG.enabled = !DEBUG.enabled;
    console.log(`Debug mode ${DEBUG.enabled ? 'enabled' : 'disabled'}`);
}

// Initial setup
checkAuth();
