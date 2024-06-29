function lookupCityState() {
    let zipCode = document.getElementById('zipCode');
    let zipCodeValue = zipCode.value.trim();
    const cityState = document.getElementById('cityState');
    if (zipCodeValue) {
        // Create a new XMLHttpRequest object
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/get-city-state?zipCode=' + zipCodeValue, true);
        xhr.onreadystatechange = function () {
            console.log('ReadyState:', xhr.readyState, 'Status:', xhr.status);
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 404)) {
                let response = JSON.parse(xhr.responseText);
                if (response.city && response.state) {
                    cityState.textContent = response.city + ', ' + response.state;
                    cityState.style.color = 'black';
                } else {
                    cityState.textContent = 'Invalid zip code';
                    cityState.style.color = 'red';
                    zipCode.focus();
                }
            }
        };
        xhr.send();
    }
}

function checkEmail() {
    let userStatus = document.getElementById('userStatus').textContent;
    if (userStatus !== 'Email is available') {
        document.getElementById('email').focus();
    }
}

document.addEventListener('keyup', function (event) {
    if (event.target.id === 'email') {
        const Email = document.getElementById('email').value.trim();
        const selectedUserType = document.querySelector('input[name="userType"]:checked');
        console.log('Email:', Email, 'User Type:', selectedUserType.value);
        if (!Email) {
            document.getElementById('userStatus').textContent = '';
            return;
        } else if (!Email.includes('@') || !Email.includes('.')) {
            document.getElementById('userStatus').textContent = 'Email is invalid.';
            document.getElementById('userStatus').style.color = 'red';
            document.getElementById('email').focus();
            return;
        } else {
            fetch(`/check-user?email=${encodeURIComponent(Email)}&usertype=${selectedUserType.value}`)
                .then(response => response.json())
                .then(data => {
                    if (data.available) {
                        // Email is available
                        document.getElementById('userStatus').textContent = 'Email is available';
                        document.getElementById('userStatus').style.color = 'green';
                    } else {
                        // Email is not available
                        document.getElementById('userStatus').textContent = 'Email already exists';
                        document.getElementById('userStatus').style.color = 'red';
                        document.getElementById('email').focus();
                    }
                })
                .catch(error => console.error('Error checking email:', error));
        }
    }
}, true); // Using capturing phase to handle the event as it propagates down

document.querySelectorAll('input[name="userType"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const submitButton = document.getElementById('submit_button');
        document.querySelectorAll('#registerContainer input').forEach(field => {
            field.disabled = false;
        });
        document.getElementById('email').value = '';
        document.getElementById('userStatus').textContent = '';
    });
});
