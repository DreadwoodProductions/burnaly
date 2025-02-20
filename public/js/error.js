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
        
        for (const log of logs) {
            const card = template.content.cloneNode(true);
            
            // Fetch and set game thumbnail
            if (log.gameId && log.gameId !== 'Unknown') {
                try {
                    const gameResponse = await fetch(`/.netlify/functions/getGameDetails?placeId=${log.gameId}`);
                    const gameData = await gameResponse.json();
                    
                    if (gameData[0]?.universeId) {
                        const thumbnailResponse = await fetch(`/.netlify/functions/getGameDetails/thumbnail?universeId=${gameData[0].universeId}`);
                        const thumbnailData = await thumbnailResponse.json();
                        
                        const thumbnailUrl = thumbnailData.data?.[0]?.thumbnails?.[0]?.imageUrl;
                        if (thumbnailUrl) {
                            const gameThumb = card.querySelector('.game-thumbnail');
                            gameThumb.src = thumbnailUrl;
                            gameThumb.classList.remove('hidden');
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch game thumbnail:', error);
                }
            }
            
            const gameLink = card.querySelector('.game-link');
            gameLink.href = `https://www.roblox.com/games/${log.gameId}`;
            gameLink.textContent = log.gameName || 'Unnamed Game';
            
            card.querySelector('.game-id').textContent = `ID: ${log.gameId || 'N/A'}`;
            
            const executorName = typeof log.executor === 'object' ? 
                (log.executor.name || 'Unknown') : 
                (log.executor || 'Unknown');
            
            card.querySelector('.executor-name').textContent = executorName;
            
            const statusSpan = card.querySelector('.executor-status');
            if (log.executor?.supported === false) {
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
            
            card.querySelector('.error-message').textContent = log.error || 'No error message';
            
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
