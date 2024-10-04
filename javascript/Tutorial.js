// Get elements
const openTutorialModalText = document.querySelector('.open-tutorial-modal-text');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialModalBtn = document.querySelector('.close-tutorial-modal-btn');
const youtubeTutorial = document.getElementById('youtubeTutorial');

// Function to open tutorial modal and play video after 3 seconds
openTutorialModalText.addEventListener('click', () => {
    tutorialModal.style.display = 'flex';

    // Delay autoplay by 3 seconds
    setTimeout(() => {
        youtubeTutorial.src += "&autoplay=1"; // Autoplay video after 3 seconds
    }, 3000); // 3000ms = 3 seconds
});

// Function to close tutorial modal
closeTutorialModalBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
    // Stop video by removing autoplay
    youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); 
});

// Close tutorial modal if clicking outside content
window.addEventListener('click', (e) => {
    if (e.target == tutorialModal) {
        tutorialModal.style.display = 'none';
        youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); // Stop autoplay
    }
});
