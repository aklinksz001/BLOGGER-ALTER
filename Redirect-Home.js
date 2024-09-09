const HOME_URL = '/';  
const fiveMinutesInMs = 5 * 60 * 1000;  
let warningShown = false;

// Function to reset inactivity timer
function resetInactivityTimer() {
    localStorage.setItem('lastVisitTime', new Date().getTime());
    warningShown = false;  // Reset warning flag
}

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
        } else if (timeElapsed >= fiveMinutesInMs - 30 * 1000 && !warningShown) {
            // Show warning 30 seconds before redirect
            alert('You will be redirected to the homepage in 30 seconds due to inactivity.');
            warningShown = true;
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

// Listen for user activity to reset the timer
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('keydown', resetInactivityTimer);

// Periodically check for inactivity every minute
setInterval(checkRedirection, 60 * 1000);  // 60 seconds
