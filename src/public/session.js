// Set the session timeout duration in milliseconds (e.g., 30 minutes)
const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes

let sessionTimer;
let sessionStartTime;

// Start the session timer
function startSessionTimer() {
    sessionStartTime = new Date(); // Capture the start time
    sessionTimer = setTimeout(sessionTimeout, sessionTimeoutDuration);
}

// Reset the session timer
function resetSessionTimer() {
    clearTimeout(sessionTimer);
    startSessionTimer();
}

// Handle session timeout
function sessionTimeout() {
    const currentTime = new Date();
    const elapsedTime = currentTime - sessionStartTime; // Time elapsed in milliseconds
    const elapsedSeconds = Math.floor(elapsedTime / 1000); // Convert to seconds

    const alertMsg = `${elapsedSeconds} seconds have passed. Session timeout. Please login.`;
    alert(alertMsg);
    window.location.href = '/';
}

// Start the session timer when the user is authenticated or interacts with the application
startSessionTimer();

// Reset the session timer when the user interacts with the application
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('click', resetSessionTimer);