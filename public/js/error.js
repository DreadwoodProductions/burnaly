function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin';
        return false;
    }
    return true;
}

async function fetchErrorLogs() {
    if (!checkAuth()) return;

    try {
        const response = await fetch('/.netlify/functions/getlogs', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
            return;
        }

        const data = await response.json();
        const logs = Array.isArray(data) ? data : [];
        
        const template = document.getElementById('error-card-template');
        const container = document.getElementById('error-cards');
        container.innerHTML = '';
        
        logs.forEach((log, index) => {
            const card = template.content.cloneNode(true);
            
            const gameLink = card.querySelector('.game-link');
            gameLink.href = `https://www.roblox.com/games/${log.gameId}`;
            gameLink.textContent = log.gameName || 'Unnamed Game';
            
            card.querySelector('.game-id').textContent = `ID: ${log.gameId || 'N/A'}`;
            
            // Handle executor object properly
            const executorName = typeof log.executor === 'object' ? 
                (log.executor.name || 'Unknown') : 
                (log.executor || 'Unknown');
            
            card.querySelector('.executor-name').textContent = executorName;
            
            const statusSpan = card.querySelector('.executor-status');
            statusSpan.textContent = log.premium ? 'Premium' : 'Free';
            statusSpan.classList.add(log.premium ? 'bg-purple-600' : 'bg-blue-600');
            statusSpan.classList.add('text-white');
            
            card.querySelector('.error-message').textContent = log.error || 'No error message';
            
            // Ensure valid timestamp
            const timestamp = log.timestamp ? new Date(log.timestamp) : new Date();
            const formattedTime = timestamp.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            card.querySelector('.timestamp').textContent = formattedTime;
            
            const delay = index * 0.1;
            const cardElement = card.querySelector('.bg-gray-800');
            cardElement.style.animationDelay = `${delay}s`;
            
            container.appendChild(card);
        });
        
        document.getElementById('loading').style.display = 'none';
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-cards').innerHTML = 
            '<p class="text-red-500 text-center text-xl">Failed to load error logs. Please try again.</p>';
    }
}

// Check auth before initial load
if (checkAuth()) {
    fetchErrorLogs();
    // Refresh every 30 seconds if authenticated
    setInterval(fetchErrorLogs, 30000);
}
