document.addEventListener('keyup', function(event) {
    if (event.target.id === 'password' || event.target.id === 'confirm_password') {
        const password = document.getElementById('password').value.trim();
        const error_message = document.getElementById('error_message');
        const confirm_password = document.getElementById('confirm_password').value.trim();
        const submitButton = document.getElementById('submit_button');
        const password_length = password.length;
        if (password === confirm_password) {
            submitButton.disabled = false;
            error_message.style.display = 'none';
        } else {
            submitButton.disabled = true;
            error_message.style.display = 'block';
        }
    }
});
