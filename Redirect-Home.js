const HOME_URL = 'index.html'; // Change this to your home page URL

function checkRedirection() {
    const currentTime = new Date().getTime();
    const lastVisitTime = localStorage.getItem('lastVisitTime');

    if (lastVisitTime) {
        const timeElapsed = currentTime - lastVisitTime;
        const oneHourInMs = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

        if (timeElapsed >= oneHourInMs) {
            // Redirect to the home page if 1 hour has passed
            window.location.href = HOME_URL;
        }
    }

    // Update the last visit time
    localStorage.setItem('lastVisitTime', currentTime);
}

// Run the checkRedirection function when the page loads
checkRedirection();
