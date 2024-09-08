const HOME_URL = '/';  // Redirect to the root (home) of your website
const fiveMinutesInMs = 5 * 60 * 1000;  // 5 minutes in milliseconds

// Function to check and handle redirection
function checkRedirection() {
    const currentTime = new Date().getTime();
    const lastVisitTime = localStorage.getItem('lastVisitTime');

    if (lastVisitTime) {
        const timeElapsed = currentTime - lastVisitTime;

        if (timeElapsed >= fiveMinutesInMs) {
            // Redirect to the home page if 5 minutes have passed
            window.location.href = HOME_URL;
            return;
        }
    }

    // Update the last visit time
    localStorage.setItem('lastVisitTime', currentTime);
}

// Run the checkRedirection function when the page loads
checkRedirection();

// Listen for changes in localStorage to sync across multiple tabs
window.addEventListener('storage', function(event) {
    if (event.key === 'lastVisitTime') {
        checkRedirection(); // Re-check redirection when lastVisitTime changes
    }
});

// Periodically check for inactivity every minute
setInterval(checkRedirection, 60 * 1000); // 60 seconds
