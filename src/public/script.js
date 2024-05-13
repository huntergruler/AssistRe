        document.addEventListener('DOMContentLoaded', function() {
            const parent = document.getElementById('parentElement');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const token = document.getElementById('token');
            var loginContainer = document.getElementById('loginContainer');
            var resetContainer = document.getElementById('resetContainer');
            var registerContainer = document.getElementById('registerContainer');
            const params = new URLSearchParams(window.location.search);
            if (resetContainer) {    // Access the parent element by its ID
                document.body.addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent default form submission
                    if (event.target.id === 'resetForm') {
                    }
                    const password = document.getElementById('password').value.trim();
                    const confirm_password = document.getElementById('confirm_password').value.trim();
                    const email = document.getElementById('email').value.trim();
                    const token = document.getElementById('token').value.trim();
                
                    fetch('/reset', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ password: password, confirm_password: confirm_password, email: email, token: token})
                    })

                    })};
            if (loginContainer) {    // Access the parent element by its ID
                document.body.addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent default form submission
                    if (event.target.id === 'loginForm') {
                        const username = document.getElementById('username').value.trim();
                        const password = document.getElementById('password').value.trim();
                    
                        fetch('/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username: username, password: password })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            if (data.success === false) {
                                // Display message if login failed
                                document.getElementById('message').innerText = data.message;
                                document.getElementById('message').style.color = 'red'; // Optional: change text color
                                document.getElementById('username').value = '';
                                document.getElementById('password').value = '';
                                document.getElementById('username').focus();
                            } else {
                                // Redirect or handle successful login
                                window.location.href = '/dashboard';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            document.getElementById('message').innerText = 'An error occurred. Please try again.';
                            document.getElementById('message').style.color = 'red';
                        });
                    }
                    });
            }   
    });
        


