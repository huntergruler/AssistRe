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

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    console.log('params:',params);
    const myParam = params.get('emialverified');
    const deleteButtons = document.querySelectorAll('.delete-btn');
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
    console.log('myparam:',myParam);
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
});
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

// Get the modal
var modal = document.getElementById('licenseDialog');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
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
}

