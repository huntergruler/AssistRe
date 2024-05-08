

function lookupCityState() {
    console.log('lookupCityState');
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

function addLicense() {
    const licensenumber = document.getElementById('licensenumber').value;
    const licensestate = document.getElementById('licensestate').value;
    console.log(licensenumber, licensestate);
    fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensenumber: licensenumber, licensestate: licensestate })
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('licensesTable').getElementsByTagName('tbody')[0];
        const row = table.insertRow();
        row.innerHTML = `<td>${data.licensenumber}</td><td>${data.licensestate}</td><td><button onclick="editLicense(${data.id})">Edit</button><button onclick="deleteLicense(${data.id})">Delete</button></td>`;
        document.getElementById('licenseForm').reset();
    })
    .catch(error => console.error('Error:', error));
}
function deleteLicense(id) {
    fetch(`/api/licenses/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the row from the table
        document.getElementById(`license-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
}

function editLicense(id) {
    const licenseRow = document.getElementById(`license-${id}`);
    const cells = licenseRow.querySelectorAll('.editable');

    cells.forEach(cell => {
        const inputType = cell.dataset.editable === 'licensestate' ? 'text' : 'text'; // You can adjust input types
        const currentValue = cell.innerText;
        cell.innerHTML = `<input type='text' value='${currentValue}' data-original='${currentValue}' />`;
    });

    // Change buttons for update actions
    const actionsCell = licenseRow.getElementsByTagName('td')[2];
    actionsCell.innerHTML = `<button onclick="saveLicense(${id})">Save</button>
                             <button onclick="cancelEdit(${id})">Cancel</button>`;
}

function saveLicense(id) {
    const licenseRow = document.getElementById(`license-${id}`);
    const numberInput = licenseRow.querySelector('[data-editable="licensenumber"] input');
    const stateInput = licenseRow.querySelector('[data-editable="licensestate"] input');

    fetch(`/api/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensenumber: numberInput.value, licensestate: stateInput.value })
    })
    .then(response => response.json())
    .then(data => {
        numberInput.parentElement.innerHTML = numberInput.value;
        stateInput.parentElement.innerHTML = stateInput.value;
        // Reset actions to original
        const actionsCell = licenseRow.getElementsByTagName('td')[2];
        actionsCell.innerHTML = `<button onclick="editLicense(${data.id})">Edit</button>
                                 <button onclick="deleteLicense(${data.id})">Delete</button>`;
    })
    .catch(error => console.error('Error:', error));
}

function comparePasswords(text) {
    // Handle the blur event for the 'confirm_password' element
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    confirmPasswordInput.onkeyup = function() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match.');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    };
}

function cancelEdit(id) {
    const licenseRow = document.getElementById(`license-${id}`);
    licenseRow.querySelectorAll('.editable').forEach(cell => {
        const originalValue = cell.querySelector('input').dataset.original;
        cell.innerHTML = originalValue;
    });
    const actionsCell = licenseRow.getElementsByTagName('td')[2];
    actionsCell.innerHTML = `<button onclick="editLicense(${id})">Edit</button>
                             <button onclick="deleteLicense(${id})">Delete</button>`;
}

function showMessage(text) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.classList.add('show');
    setTimeout(() => messageDiv.classList.remove('show'), 5000); // Fade out after 5 seconds
}

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
   
    document.addEventListener('DOMContentLoaded', function() {
        // Access the parent element by its ID
        const parent = document.getElementById('parentElement');
    
        parent.addEventListener('click', function(event) {
            const deleteButtons = document.querySelectorAll('.delete-btn');
            if (event.target.id === 'licensesTable') {
                let modal = document.getElementById('licenseDialog');
                let btn = document.getElementById("myBtn");
                let span = document.getElementsByClassName("close")[0];
                btn.onclick = function() {
                    modal.style.display = "block";
                }
            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
                modal.style.display = "none";
             }
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
                    if (event.target.id === 'button') {
                        if (deleteButtons.length > 0) {
                            deleteButtons.forEach(button => {
                                button.addEventListener('click', function() {
                                    const licenseId = this.getAttribute('data-id');
                                    deleteLicense(licenseId);
                                });
                            });
                        } else {
                        console.log("No delete buttons to attach listeners to.");
                    }
                    }
                }
            }
        });
        parent.addEventListener('blur', function(event) {
            if (event.target.id === 'user') {
                // Handle the blur event for the 'user' element
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
        });

        document.addEventListener('DOMContentLoaded', function() {
            var loginContainer = document.getElementById('loginContainer');
            var resetContainer = document.getElementById('resetContainer');
            var registerContainer = document.getElementById('registerContainer');
            const params = new URLSearchParams(window.location.search);
            if (loginContainer) {    // Access the parent element by its ID
                const messagein = document.getElementById('message').textContent;
                if (params.get('emailverified') === 'false') {
                    const messageDiv = document.getElementById('verifyMessage');
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
/*            if (resetContainer || registerContainer) {    // Access the parent element by its ID
                if (params.get('passwordchanged') === 'true') {
                    const messageDiv = document.getElementById('passwordChangedMessage');
                    messageDiv.innerHTML = 'Pasword changed successfully!';
                    // Add any styles or animations you want
                    messageDiv.style.color = 'green';
                }
                    }
                */
                     });
        


