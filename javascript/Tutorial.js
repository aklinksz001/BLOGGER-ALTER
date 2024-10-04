// Get elements
const openTutorialModalText = document.querySelector('.open-tutorial-modal-text');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialModalBtn = document.querySelector('.close-tutorial-modal-btn');
const youtubeTutorial = document.getElementById('youtubeTutorial');

// Function to open tutorial modal
openTutorialModalText.addEventListener('click', () => {
    tutorialModal.style.display = 'flex';
    
    // Reset the iframe src before setting the autoplay (in case it was opened and closed before)
    youtubeTutorial.src = "https://www.youtube.com/embed/qRa8WCkigmk?enablejsapi=1";

    // Delay autoplay by 3 seconds
    setTimeout(() => {
        youtubeTutorial.src += "&autoplay=1"; // Autoplay video after 3 seconds
    }, 3000); // 3000ms = 3 seconds
});

// Function to close tutorial modal
closeTutorialModalBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
    // Reset iframe src to stop the video
    youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); 
});

// Close modal if clicking outside content
window.addEventListener('click', (e) => {
    if (e.target == tutorialModal) {
        tutorialModal.style.display = 'none';
        youtubeTutorial.src = youtubeTutorial.src.replace("&autoplay=1", ""); // Stop autoplay
    }
});
