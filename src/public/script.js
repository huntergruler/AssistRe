        document.addEventListener('DOMContentLoaded', function() {
            const parent = document.getElementById('parentElement');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const token = document.getElementById('token');
            var loginContainer = document.getElementById('loginContainer');
            var resetContainer = document.getElementById('resetContainer');
            var registerContainer = document.getElementById('registerContainer');
            const params = new URLSearchParams(window.location.search);
            if (loginContainer) {    // Access the parent element by its ID
                const messagein = document.getElementById('message').textContent;
                if (params.get('emailverified') === 'false') {
                    const messageDiv = document.getElementById('message');
                    messageDiv.innerHTML = 'Please verify your email and try again.';
                    // Add any styles or animations you want
                    messageDiv.style.color = 'red';
                }
                if (params.get('loggedOut') === 'true') {
                    const messageDiv = document.getElementById('logoutMessage');
                    messageDiv.innerHTML = 'You are logged out.';
                    console.log('User LOGGGED OUT');
                    // Add any styles or animations you want
                    messageDiv.style.color = 'green';
                }
            }   
    });
        


