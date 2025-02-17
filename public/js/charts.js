export function initializeCharts() {
    setupMemberGrowthChart();
    setupCommandUsageChart();
}

function setupMemberGrowthChart() {
    const ctx = document.getElementById('memberGrowthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Members',
                data: [0, 20, 40, 80, 120, 180],
                borderColor: '#7289da',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function setupCommandUsageChart() {
    const ctx = document.getElementById('commandUsageChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Commands Used',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: '#7289da'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
