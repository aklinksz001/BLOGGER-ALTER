// Get elements
const openTutorialModelLink = document.querySelector('.open-tutorial-model');
const tutorialModel = document.getElementById('tutorialModel');
const closeTutorialModel = document.querySelector('.close-tutorial-model');
const videoContainer = document.getElementById('videoContainer');

// Function to open the tutorial model
openTutorialModelLink.addEventListener('click', () => {
    tutorialModel.style.display = 'flex'; // Show the tutorial model

    // Clear any previous video (in case of re-opening)
    videoContainer.innerHTML = "";

    // After 3 seconds, inject the iframe with autoplay enabled
    setTimeout(() => {
        videoContainer.innerHTML = `
            <iframe width="343" height="193" 
                src="https://www.youtube.com/embed/qRa8WCkigmk?autoplay=1" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
        `;
    }, 1000); // 1-second delay
});

// Function to close the tutorial model
closeTutorialModel.addEventListener('click', () => {
    tutorialModel.style.display = 'none'; // Hide the tutorial model
    videoContainer.innerHTML = ""; // Clear the video to stop playback
});

// Close the tutorial model if clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target == tutorialModel) {
        tutorialModel.style.display = 'none';
        videoContainer.innerHTML = ""; // Clear the video to stop playback
    }
});
