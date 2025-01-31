const HOME_URL = '/';  // Redirect to the root (home) of your website
const tenMinutesInMs = 10 * 60 * 1000;  // 10 minutes in milliseconds

// Function to check and handle redirection
function checkRedirection() {
    const currentTime = new Date().getTime();
    const lastVisitTime = localStorage.getItem('lastVisitTime');

    if (lastVisitTime) {
        const timeElapsed = currentTime - lastVisitTime;

        if (timeElapsed >= tenMinutesInMs) {
            // Clear LocalStorage and Cookies on redirect
            clearLocalStorageAndCookies();
            
            // Redirect to the home page if 10 minutes have passed
            window.location.href = HOME_URL;
            return;
        }
    }

    // Update the last visit time
    localStorage.setItem('lastVisitTime', currentTime);
}

// Function to clear LocalStorage and cookies
function clearLocalStorageAndCookies() {
    // Clear LocalStorage
    localStorage.clear();

    // Clear Cookies
    document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
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

// VERIFY CHECK 

    if (sessionStorage.getItem('authenticated') !== 'true') {
        window.location.href = "Index.html";     
    }
    
    
    
    
       
      
