let charts = null;

// Initialize Charts
function initializeCharts() {
    // Error Frequency Chart
    const errorCtx = document.getElementById('errorChart').getContext('2d');
    const errorChart = new Chart(errorCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Errors',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(156, 163, 175)'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.2)' }
                },
                x: {
                    ticks: { color: 'rgb(156, 163, 175)' },
                    grid: { color: 'rgba(75, 85, 99, 0.2)' }
                }
            }
        }
    });

    // Executor Distribution Chart
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
                    'rgb(248, 113, 113)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgb(156, 163, 175)'
                    }
                }
            }
        }
    });

    return { errorChart, executorChart };
}

async function checkKillswitchStatus() {
    try {
        const response = await fetch('/.netlify/functions/getstatus', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }

        const { status } = await response.json();
        const statusElement = document.getElementById('killswitchStatus');
        const indicator = document.getElementById('statusIndicator');
        
        statusElement.textContent = status ? 'Enabled' : 'Disabled';
        indicator.className = `w-3 h-3 rounded-full mr-2 ${status ? 'bg-green-500' : 'bg-red-500'}`;
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
        
    } catch (error) {
        console.error('Failed to fetch killswitch status:', error);
    }
}

async function updateDashboard() {
    try {
        const response = await fetch('/.netlify/functions/getlogs', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const logs = await response.json();
        
        // Process data for dashboard
        const last24h = logs.filter(log => {
            return new Date(log.timestamp) > new Date(Date.now() - 24*60*60*1000);
        });

        // Update stat cards
        document.getElementById('totalErrors').textContent = last24h.length;
        
        // Most common error
        const errorTypes = {};
        last24h.forEach(log => {
            errorTypes[log.error] = (errorTypes[log.error] || 0) + 1;
        });
        const commonError = Object.entries(errorTypes)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('commonError').textContent = 
            commonError ? commonError[0].slice(0, 30) + '...' : 'None';

        // Most affected game
        const games = {};
        last24h.forEach(log => {
            games[log.gameName] = (games[log.gameName] || 0) + 1;
        });
        const topGame = Object.entries(games)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('affectedGame').textContent = 
            topGame ? topGame[0] : 'None';

        // Update charts
        updateCharts(logs);
        
        // Update timeline
        updateTimeline(last24h.slice(0, 5));

    } catch (error) {
        console.error('Failed to update dashboard:', error);
    }
}

function updateCharts(logs) {
    if (!charts) {
        charts = initializeCharts();
    }

    // Error frequency data
    const hourlyData = new Array(24).fill(0);
    logs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        hourlyData[hour]++;
    });

    charts.errorChart.data.labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    charts.errorChart.data.datasets[0].data = hourlyData;
    charts.errorChart.update();

    // Executor distribution data
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
}

function updateTimeline(recentLogs) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = recentLogs.map(log => `
        <div class="flex items-center space-x-4">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
                <p class="text-white">${log.error}</p>
                <p class="text-sm text-gray-400">${new Date(log.timestamp).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

// Authentication functions
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
        return false;
    }
    showAdminPanel();
    return true;
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
            initDashboard();
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
    setTimeout(hideNotification, 3000);
}

function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

function initDashboard() {
    charts = initializeCharts();
    updateDashboard();
    checkKillswitchStatus();
    // Update every 30 seconds
    setInterval(() => {
        updateDashboard();
        checkKillswitchStatus();
    }, 30000);
}

// Initialize on load
checkAuth();
