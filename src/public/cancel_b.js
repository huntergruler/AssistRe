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
let buyerid = null;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/session-data')
        .then(response => response.json())
        .then(sessionData => {
            buyerid = sessionData.userid;
            paymentSuccessful = sessionData.paymentSuccessful;
            setPaymentStatus();
        })
        .catch(error => console.error('Error fetching session data:', error));
});

setPaymentStatus = () => {
    console.log('inside setpaymentstatus',buyerid);
    const data = {
        buyerid: buyerid,
        userType: 'Buyer',
        paymentSuccessful: paymentSuccessful
    };
    fetch('/setPaymentStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


