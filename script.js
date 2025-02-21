document.addEventListener('DOMContentLoaded', () => {
    const typingArea = document.getElementById('typing-area');
    const progressBar = document.getElementById('progress-bar');
    const speedDisplay = document.getElementById('speed');
    const accuracyDisplay = document.getElementById('accuracy');

    fetch('https://api.typing.com/words')
        .then(response => response.json())
        .then(data => {
            typingArea.textContent = data.words.join(' ');
        });

  
    function updateTypingStats(speed, accuracy, progress) {
        speedDisplay.textContent = speed;
        accuracyDisplay.textContent = accuracy;
        progressBar.style.width = `${progress}%`;
    }

    
});
