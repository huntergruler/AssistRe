function addLicense() {
    const licenseNumber = document.getElementById('licenseNumber').value;
    const licenseState = document.getElementById('licenseState').value;
    console.log(licenseNumber, licenseState);
    fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber: licenseNumber, licenseState: licenseState })
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('licensesTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow(table.rows.length);
        console.log(data);
        newRow.id = `license-${data.agentlicenseid}`;
        newRow.insertCell(0).textContent = data.licenseState;
        newRow.insertCell(1).textContent = data.licenseNumber;
        newRow.insertCell(2).innerHTML = '<button onclick="deleteLicense(' + data.agentlicenseid + ')">Delete</button>';


//        row.innerHTML = `<tr id="license-${data.agentlicenseid}"> <td>${data.licenseNumber}</td><td>${data.licenseState}</td><td>${data.agentlicenseid}</td><td><button onclick="deleteLicense(${data.agentlicenseid})">Delete</button></td></tr>`;
        console.log(newRow);
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
        console.log(`license-${id}`);
        document.getElementById(`license-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('blur', function(event) {
    if (event.target.id === 'licenseState') {
        const licenseState = document.getElementById ('licenseState').value.trim();
        fetch(`/check-license?licenseState=${encodeURIComponent(licenseState)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.validstate === "Invalid") {
                // state is valid
                document.getElementById('licStatus').textContent = '';
                document.getElementById('licenseAdd').disabled = false;
              } else if (data.validstate === "Used") {
                // state has been used
                document.getElementById('licStatus').textContent = 'License for this state exists';
                document.getElementById('licStatus').style.color = 'red';
                document.getElementById('licenseAdd').disabled = true;
                document.getElementById('licenseState').focus();
              } else {
                // state is not valid
                document.getElementById('licStatus').textContent = 'Invalid State';
                document.getElementById('licStatus').style.color = 'red';
                document.getElementById('licenseAdd').disabled = true;
                document.getElementById('licenseState').focus();
                }
            })
        .catch(error => console.error('Error checking user:', error));
    }
}, true); // Using capturing phase to handle the event as it propagates down

