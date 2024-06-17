document.addEventListener('DOMContentLoaded', function () {
    const parent = document.getElementById('parentElement');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const token = document.getElementById('token');
    var loginContainer = document.getElementById('loginContainer');
    var resetContainer = document.getElementById('resetContainer');
    var registerContainer = document.getElementById('registerContainer');
    const params = new URLSearchParams(window.location.search);
    /*            if (resetContainer) {    // Access the parent element by its ID
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
                        */
    // if (document.getElementById('message').innerText == '')
    //     document.getElementById('message').style.display = 'none';
    if (loginContainer) {    // Access the parent element by its ID
        document.body.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission
            if (event.target.id === 'loginForm') {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();
                const userType = document.getElementById('userType').value.trim();
                if (!email || !password) {
                    document.getElementById('message').style.display = 'block';
                    document.getElementById('message').innerText = 'Email and password are required.';
                    document.getElementById('message').style.color = 'red';
                    return;
                }
                // console.log(email, password, userType);
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email, password: password, userType: userType })
                })
                    .then(response => response.json())
                    .then(data => {
                        // console.log('Success:', data);
                        if (data.success === false) {
                            // Display message if login failed
                            document.getElementById('message').style.display = 'block';
                            document.getElementById('message').innerText = data.message;
                            document.getElementById('message').style.color = 'red'; // Optional: change text color
                            document.getElementById('email').value = '';
                            document.getElementById('password').value = '';
                            document.getElementById('email').focus();
                        } else {
                            // Redirect or handle successful login
                            // console.log('login successful', data);
                            if (userType === 'Agent') {
                                window.location.href = '/dashboard_a';
                            }
                            else if (userType === 'Buyer') {
                                window.location.href = '/dashboard_b';
                            }
                        }
                    })
                    .catch(error => {
//                        console.error('Error:', error);
//                        document.getElementById('message').style.display = 'block';
                        document.getElementById('message').innerText = 'An error occurred. Please try again.';
                        document.getElementById('message').style.color = 'red';
                    });
            }
        });
    }
});

document.querySelectorAll('input[name="userType"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.querySelectorAll('#loginForm input, #loginForm button').forEach(field => {
            field.disabled = false;
        });
    });
});


