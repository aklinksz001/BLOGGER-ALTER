// Get elements
const openTutorialModalText = document.querySelector('.open-tutorial-modal-text');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialModalBtn = document.querySelector('.close-tutorial-modal-btn');
const videoContainer = document.getElementById('videoContainer');

// Function to open tutorial modal
openTutorialModalText.addEventListener('click', () => {
    tutorialModal.style.display = 'flex';

    // Clear existing iframe if any
    videoContainer.innerHTML = "";

    // Delay the video load and autoplay by 3 seconds
    setTimeout(() => {
        // Dynamically create and add the iframe with autoplay enabled
        videoContainer.innerHTML = `
            <iframe id="youtubeTutorial" width="560" height="315" 
                    src="https://www.youtube.com/embed/qRa8WCkigmk?autoplay=1"
                    title="YouTube tutorial video player" frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
        `;
    }, 3000); // 3000ms = 3 seconds
});

// Function to close tutorial modal
closeTutorialModalBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
    videoContainer.innerHTML = ""; // Remove the video when modal is closed
});

// Close modal if clicking outside content
window.addEventListener('click', (e) => {
    if (e.target == tutorialModal) {
        tutorialModal.style.display = 'none';
        videoContainer.innerHTML = ""; // Remove the video when clicking outside
    }
});
