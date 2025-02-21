document.addEventListener('DOMContentLoaded', () => {
    const typingArea = document.getElementById('typing-area');
    const progressBar = document.getElementById('progress-bar');
    const speedDisplay = document.getElementById('speed');
    const accuracyDisplay = document.getElementById('accuracy');
    const wordList = ["apple", "banana", "orange", "grape", "pear", "peach", "plum", "mango", "strawberry", "blueberry"];
    let currentWordIndex = 0;
    let startTime;
    let correctChars = 0;
    let typedChars = 0;
    const getRandomWords = () => wordList.sort(() => Math.random() - 0.5).join(' ');
    const updateTypingStats = () => {
        const elapsedTime = (Date.now() - startTime) / 1000 / 60;
        const wordsTyped = typedChars / 5;
        const speed = Math.round(wordsTyped / elapsedTime);
        const accuracy = Math.round((correctChars / typedChars) * 100);
        speedDisplay.textContent = speed;
        accuracyDisplay.textContent = accuracy;
        const progress = (typedChars / typingArea.textContent.length) * 100;
        progressBar.style.width = `${progress}%`;
    };
    const startTyping = () => {
        typingArea.textContent = getRandomWords();
        startTime = Date.now();
        correctChars = 0;
        typedChars = 0;
        typingArea.addEventListener('input', handleTyping);
        typingArea.focus();
    };
    const handleTyping = (event) => {
        const currentChar = typingArea.textContent[typedChars];
        const inputChar = event.data || '';
        if (inputChar === currentChar) correctChars++;
        typedChars++;
        updateTypingStats();
        if (typedChars === typingArea.textContent.length) {
            typingArea.removeEventListener('input', handleTyping);
            setTimeout(startTyping, 1000);
        }
    };
    startTyping();
});
