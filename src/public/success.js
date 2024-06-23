// Set the delay time in milliseconds (e.g., 3000 milliseconds = 3 seconds)
const delayTime = 3000; // 3 seconds

// Set the URL to redirect to
const redirectUrl = 'http://3.129.42.126:3000/dashboard_b'; // Change this to your desired URL

// Function to handle the redirect
function redirectToPage() {
    window.location.href = redirectUrl;
}

// Set a timeout to execute the redirect function after the specified delay time
setTimeout(redirectToPage, delayTime);

let userid = null;
let paymentSuccessful = null;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/session-data')
        .then(response => response.json())
        .then(sessionData => {
            userid = sessionData.userid;
            paymentSuccessful = sessionData.paymentSuccessful;
        })
        .catch(error => console.error('Error fetching session data:', error));
 setPaymentStatus();
    });
    
setPaymentStatus = () => {
    req.session.paymentSuccessful = 1;
}


