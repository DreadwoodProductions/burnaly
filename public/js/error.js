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

        const logs = await response.json();
        const template = document.getElementById('error-card-template');
        const container = document.getElementById('error-cards');
        container.innerHTML = '';
        
        for (const log of logs) {
            const card = template.content.cloneNode(true);
            
            // Set game thumbnail if available
            if (log.game?.thumbnail) {
                const gameThumb = card.querySelector('.game-thumbnail');
                gameThumb.src = log.game.thumbnail;
                gameThumb.classList.remove('hidden');
            }
            
            // Set game information
            const gameLink = card.querySelector('.game-link');
            gameLink.href = `https://www.roblox.com/games/${log.game?.id}`;
            gameLink.textContent = log.game?.name || 'Unnamed Game';
            card.querySelector('.game-id').textContent = `ID: ${log.game?.id || 'N/A'}`;
            
            // Set executor information
            const executorName = log.executor?.name || 'Unknown';
            card.querySelector('.executor-name').textContent = executorName;
            
            // Set executor status
            const statusSpan = card.querySelector('.executor-status');
            if (!log.executor?.supported) {
                statusSpan.textContent = 'Unsupported';
                statusSpan.classList.add('bg-red-600');
            } else if (log.executor?.isMacsploit) {
                statusSpan.textContent = 'Macsploit';
                statusSpan.classList.add('bg-purple-600');
            } else {
                statusSpan.textContent = 'Supported';
                statusSpan.classList.add('bg-green-600');
            }
            statusSpan.classList.add('text-white');
            
            // Set error message and timestamp
            card.querySelector('.error-message').textContent = log.error || 'No error message';
            
            const timestamp = new Date(log.timestamp);
            const formattedTime = timestamp.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            card.querySelector('.timestamp').textContent = formattedTime;
            
            container.appendChild(card);
        }
        
        document.getElementById('loading').style.display = 'none';
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-cards').innerHTML = 
            '<p class="text-red-500 text-center text-xl">Failed to load error logs. Please try again.</p>';
    }
}

if (checkAuth()) {
    fetchErrorLogs();
    setInterval(fetchErrorLogs, 30000);
}
