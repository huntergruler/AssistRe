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
    if (event.target.id === 'user') {
        const User = document.getElementById('user').value.trim();
        console.log(User);
        fetch(`/check-user?email=${encodeURIComponent(User)}`)
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
            document.getElementById('user').focus();
        }
        })
        .catch(error => console.error('Error checking user:', error));
    }
}, true); // Using capturing phase to handle the event as it propagates down

document.addEventListener('change', function(event) {
    if (event.target.id === 'userType') {
        document.getElementById('email').textContent = '';
        document.getElementById('userStatus').textContent = '';
    }
});