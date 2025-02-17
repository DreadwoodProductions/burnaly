async function fetchErrorLogs() {
    try {
        const response = await fetch('/.netlify/functions/getlogs');
        const data = await response.json();
        const logs = Array.isArray(data) ? data : [];
        
        const template = document.getElementById('error-card-template');
        const container = document.getElementById('error-cards');
        container.innerHTML = '';
        
        logs.forEach((log, index) => {
            const card = template.content.cloneNode(true);
            
            const gameLink = card.querySelector('.game-link');
            gameLink.href = `https://www.roblox.com/games/${log.gameId}`;
            gameLink.textContent = log.gameName || 'Unknown Game';
            
            card.querySelector('.game-id').textContent = `ID: ${log.gameId}`;
            card.querySelector('.executor-name').textContent = log.executor || 'Unknown';
            
            const statusSpan = card.querySelector('.executor-status');
            statusSpan.textContent = log.premium ? 'Premium' : 'Free';
            statusSpan.classList.add(log.premium ? 'bg-purple-600' : 'bg-blue-600');
            statusSpan.classList.add('text-white');
            
            card.querySelector('.error-message').textContent = log.error;
            
            const timestamp = new Date(log.timestamp).toLocaleString();
            card.querySelector('.timestamp').textContent = timestamp;
            
            // Add stagger effect to cards
            const delay = index * 0.1;
            const cardElement = card.querySelector('.bg-gray-800');
            cardElement.style.animationDelay = `${delay}s`;
            
            container.appendChild(card);
        });
        
        // Hide loader after data is loaded
        document.getElementById('loading').style.display = 'none';
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-cards').innerHTML = 
            '<p class="text-red-500 text-center text-xl">Failed to load error logs. Please try again.</p>';
    }
}

// Initial load
fetchErrorLogs();
