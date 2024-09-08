const HOME_URL = '/';  // Redirect to the root (home) of your website
const fiveMinutesInMs = 5 * 60 * 1000;  // 5 minutes in milliseconds

function checkRedirection() {
    const currentTime = new Date().getTime();
    const lastVisitTime = localStorage.getItem('lastVisitTime');

    if (lastVisitTime) {
        const timeElapsed = currentTime - lastVisitTime;

        if (timeElapsed >= fiveMinutesInMs) {
            // Redirect to the home page if 5 minutes have passed
            window.location.href = HOME_URL;
        }
    }

    // Update the last visit time
    localStorage.setItem('lastVisitTime', currentTime);
}

// Run the checkRedirection function when the page loads
checkRedirection();
