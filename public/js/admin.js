let charts = null;

function initializeCharts() {
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

    return { errorChart, executorChart };
}

async function checkKillswitchStatus() {
    console.log('Starting checkKillswitchStatus function');
    try {
        console.log('Fetching status from killswitch endpoint');
        const response = await fetch('/.netlify/functions/killswitch', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
            console.log('Unauthorized access, logging out');
            logout();
            return;
        }

        const data = await response.json();
        console.log('Received data from server:', data);
        
        const statusElement = document.getElementById('killswitchStatus');
        const indicator = document.getElementById('statusIndicator');
        
        console.log('Current status value:', data.status);
        console.log('Current DOM status text:', statusElement.textContent);
        console.log('Current indicator classes:', indicator.className);
        
        // Update UI
        indicator.className = `w-4 h-4 rounded-full mr-3 ${data.status ? 'bg-green-500' : 'bg-red-500'}`;
        statusElement.textContent = data.status ? 'Enabled' : 'Disabled';
        
        console.log('Updated indicator classes:', indicator.className);
        console.log('Updated status text:', statusElement.textContent);
        
        const timestamp = new Date().toLocaleTimeString();
        document.getElementById('lastUpdated').textContent = timestamp;
        console.log('Updated timestamp:', timestamp);
        
        return data.status;
    } catch (error) {
        console.error('Error in checkKillswitchStatus:', error);
        return null;
    }
}

async function setStatus(enabled) {
    console.log('Starting setStatus function with enabled:', enabled);
    document.getElementById('loading').style.display = 'flex';
    
    try {
        console.log('Sending POST request to update status');
        const response = await fetch('/.netlify/functions/killswitch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: enabled })
        });
        
        console.log('POST response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Received response data:', data);
            
            const message = `Script has been successfully ${enabled ? 'enabled' : 'disabled'}`;
            console.log('Showing notification:', message);
            showNotification(message);
            
            console.log('Refreshing status display');
            await checkKillswitchStatus();
        } else {
            console.log('Failed to update status');
            showNotification('Failed to update status');
        }
    } catch (error) {
        console.error('Error in setStatus:', error);
        showNotification('Failed to update status');
    }
    
    console.log('Hiding loading indicator');
    document.getElementById('loading').style.display = 'none';
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

    } catch (error) {
        console.error('Failed to update dashboard:', error);
    }
}

function updateCharts(logs) {
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
}

function updateTimeline(recentLogs) {
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
}

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
    setInterval(() => {
        updateDashboard();
        checkKillswitchStatus();
    }, 30000);
}

checkAuth();
