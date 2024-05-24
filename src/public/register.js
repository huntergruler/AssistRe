function lookupCityState() {
  let zipCode = document.getElementById('zipCode').value;
  if (zipCode) {
      // Create a new XMLHttpRequest object
      let xhr = new XMLHttpRequest();
      xhr.open('GET', '/get-city-state?zipCode=' + zipCode, true);
      xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
              let response = JSON.parse(xhr.responseText);
              if (response.city && response.state) {
                  document.getElementById('cityState').textContent = response.city + ', ' + response.state;
              } else {
                  document.getElementById('cityState').textContent = 'City and state not found';
              }
          }
      };
      xhr.send();
  }
}
//Test
document.addEventListener('keyup', function(event) {
    if (event.target.id === 'email') {
        const Email = document.getElementById('email').value.trim();
        if (!Email) {
            document.getElementById('userStatus').textContent = '';
            return;
        } else if (!Email.includes('@') || !Email.includes('.')) {
            document.getElementById('userStatus').textContent = 'Email is invalid.';
            document.getElementById('userStatus').style.color = 'red';
            document.getElementById('email').focus();
            return;
        } else {
        fetch(`/check-user?email=${encodeURIComponent(Email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.available) {
            // Email is available
            document.getElementById('userStatus').textContent = 'Email is available.';
            document.getElementById('userStatus').style.color = 'green';
          } else {
            // Email is not available
            document.getElementById('userStatus').textContent = 'Email is already registered.';
            document.getElementById('userStatus').style.color = 'red';
            document.getElementById('email').focus();
        }
        })
        .catch(error => console.error('Error checking email:', error));
    }
    }
}, true); // Using capturing phase to handle the event as it propagates down

document.querySelectorAll('input[name="userType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('#registerForm input, #registerForm button').forEach(field => {
            field.disabled = false;
        });
        document.getElementById('email').textContent = '';
        document.getElementById('userStatus').textContent = '';
    });
});
