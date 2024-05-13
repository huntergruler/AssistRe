document.addEventListener('keyup', function(event) {
    if (event.target.id === 'user') {
        const User = document.getElementById('user').value.trim();
        fetch(`/check-user?username=${encodeURIComponent(User)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
          if (data.available) {
            // Email is available
            document.getElementById('userStatus').textContent = 'Username is available.';
            document.getElementById('userStatus').style.color = 'green';
          } else {
            // Email is not available
            document.getElementById('userStatus').textContent = 'Username is already registered.';
            document.getElementById('userStatus').style.color = 'red';
            document.getElementById('user').focus();
        }
        })
        .catch(error => console.error('Error checking user:', error));
    }
}, true); // Using capturing phase to handle the event as it propagates down

