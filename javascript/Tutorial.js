// Get elements
const openTutorialModalBtn = document.querySelector('.open-tutorial-modal-btn');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialModalBtn = document.querySelector('.close-tutorial-modal-btn');
const youtubeTutorial = document.getElementById('youtubeTutorial');

// Function to open tutorial modal
openTutorialModalBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'flex';
    // Play video
    youtubeTutorial.src += "&autoplay=1"; // Autoplay when tutorial modal opens
});

// Function to close tutorial modal
closeTutorialModalBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
    // Stop video
    youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); // Stop autoplay
});

// Close tutorial modal if clicking outside content
window.addEventListener('click', (e) => {
    if (e.target == tutorialModal) {
        tutorialModal.style.display = 'none';
        youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); // Stop autoplay
    }
});
