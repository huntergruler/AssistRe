// Set the session timeout duration in milliseconds (e.g., 30 minutes)
const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes

let sessionTimer;

// Start the session timer
function startSessionTimer() {
    sessionTimer = setTimeout(sessionTimeout, sessionTimeoutDuration);
}

// Reset the session timer
function resetSessionTimer() {
    clearTimeout(sessionTimer);
    startSessionTimer();
}

// Handle session timeout
function sessionTimeout() {
    // Redirect the user to the login page
    alertmsg = sessionTimer+"Session timeout. Please login";
    alert(alertmsg);
    window.location.href = '/';
}

// Start the session timer when the user is authenticated or interacts with the application
startSessionTimer();

// Reset the session timer when the user interacts with the application
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('click', resetSessionTimer);