function addTransaction() {
    const transactionDate = document.getElementById('transactionDate').value;
    const transactionAmount = document.getElementById('transactionAmount').value;
    const propertyType = document.getElementById('propertyType').value;
    const levelOfService = document.getElementById('levelOfService').value; 
    const compensationType = document.getElementById('compensationType').value;    
    fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionDate, transactionAmount, propertyType, levelOfService, compensationType })
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow(table.rows.length);
        newRow.id = `transaction-${data.agenttransactionid}`;
        newRow.insertCell(0).textContent = transactionDate;
        newRow.insertCell(1).textContent = transactionAmount;
        newRow.insertCell(2).textContent = propertyType;
        newRow.insertCell(3).textContent = levelOfService;
        newRow.insertCell(4).textContent = compensationType;
        newRow.insertCell(5).innerHTML = '<button onclick="deleteTransaction(' + data.agenttransactionid + ')">Delete</button>';
        document.getElementById('transactionForm').reset();
    })
};

function deleteTransaction(id) {
    fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the row from the table
        document.getElementById(`transaction-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
};

function addOffice() {
    const officeName = document.getElementById('officeName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const officeLicenseNumber = document.getElementById('officeLicenseNumber').value;
    const officeLicenseState = document.getElementById('officeLicenseState').value;
    fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState })
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('officeTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow(table.rows.length);
        newRow.id = `office-${data.agentofficeid}`;
        newRow.insertCell(0).textContent = officeName;
        newRow.insertCell(1).textContent = address;
        newRow.insertCell(2).textContent = city;
        newRow.insertCell(3).textContent = state;
        newRow.insertCell(4).textContent = zip;
        newRow.insertCell(5).textContent = phoneNumber;
        newRow.insertCell(6).textContent = officeLicenseNumber;
        newRow.insertCell(7).textContent = officeLicenseState;
        newRow.insertCell(8).innerHTML = '<button onclick="deleteOffice(' + data.officeid + ')">Delete</button>';
        document.getElementById('officeForm').reset();
    })
};

function deleteOffice(id) {
    fetch(`/api/offices/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the row from the table
        document.getElementById(`office-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
};

function addLicense() {
    const licenseNumber = document.getElementById('licenseNumber').value;
    const licenseState = document.getElementById('licenseState').value;
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    const yearSelect = document.getElementById('yearSelect');

    // JavaScript Date months are 0-indexed, so subtract 1. 
    // HTML values are 1-indexed if filled as shown in previous messages.
    const month = parseInt(monthSelect.value) - 1;
    const day = parseInt(daySelect.value);
    const year = parseInt(yearSelect.value);

    const licenseExpirationDate = new Date(year, month, day);
    if (licenseExpirationDate < new Date()) {
        alert('Expiration date must be in the future');
        return;
    }
    fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber: licenseNumber, licenseState: licenseState, licenseExpirationDate: licenseExpirationDate })
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('licensesTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow(table.rows.length);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const expDate = licenseExpirationDate.toLocaleDateString('en-US', options);

        newRow.id = `license-${data.agentlicenseid}`;
        newRow.insertCell(0).textContent = licenseState;
        newRow.insertCell(1).textContent = licenseNumber;
        newRow.insertCell(2).textContent = expDate;
        newRow.insertCell(3).innerHTML = '<button onclick="deleteLicense(' + data.agentlicenseid + ')">Delete</button>';


//        row.innerHTML = `<tr id="license-${data.agentlicenseid}"> <td>${data.licenseNumber}</td><td>${data.licenseState}</td><td>${data.agentlicenseid}</td><td><button onclick="deleteLicense(${data.agentlicenseid})">Delete</button></td></tr>`;
        document.getElementById('licenseForm').reset();
    })
    .catch(error => console.error('Error:', error));
};

function deleteLicense(id) {
    fetch(`/api/licenses/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the row from the table
        document.getElementById(`license-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
};

function deleteOffice(id) {
    fetch(`/api/offices/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the row from the table
        document.getElementById(`office-${id}`).remove();
    })
    .catch(error => console.error('Error:', error));
};

document.addEventListener('blur', function(event) {
    if (event.target.id === 'licenseState') {
        const licenseState = document.getElementById ('licenseState').value.trim();
        if (licenseState.length !== 0) {
            fetch(`/check-license?licenseState=${encodeURIComponent(licenseState)}`)
            .then(response => response.json())
            .then(data => {
                if (data.stateResult === "Valid") {
                    // state is valid
                    document.getElementById('licStatus').textContent = '';
                    document.getElementById('licenseAdd').disabled = false;
                } else if (data.stateResult === "Used") {
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
    }
}, true); // Using capturing phase to handle the event as it propagates down

// datePickerScript.js

function zipUpdate() {
    const monthSelect = document.getElementById('monthSelect');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach((month, index) => {
        let option = new Option(month, index + 1);
        monthSelect.appendChild(option);
    });
};

document.addEventListener('DOMContentLoaded', function () {
    populateMonths();
    populateYears();
    updateDays();
    populateStates();
    populateUserZipCodes();
});

function getSelectedZipCodes() {
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);
  };

function populateStates() {
    const stateSelect = document.getElementById('stateSelect');

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a State';
    defaultOption.value = '';
    stateSelect.appendChild(defaultOption);
    
    fetch(`/get-states`)
    .then(response => response.json())
    .then(data => {
        data.results.forEach(item => {
            let option = document.createElement('option');
            option.value = item.state;
            option.textContent = item.stateName;
            stateSelect.appendChild(option);
        });
    })
};

stateSelect.addEventListener('change', function() {
    var selectedValue = this.value;
  });
  
  function populateCities() {
    const stateSelect = document.getElementById('stateSelect').value;
    const citySelect = document.getElementById('citySelect');
    
    fetch(`/get-cities?stateSelect=${encodeURIComponent(stateSelect)}`)
    .then(response => response.json())
    .then(data => {
        // Clear existing options in citySelect
        citySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a City';
        defaultOption.value = '';
        citySelect.appendChild(defaultOption);
             data.results.forEach(item => {
            let option = new Option(item.city, item.city);
            citySelect.appendChild(option);
        });    
         })
    .catch(error => console.error('Error checking user:', error));
};

function saveChanges() {
    const selected = document.querySelectorAll(".zipCodeSelected");

    // Prepare the array of selected zip codes
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);

    document.getElementById('saveChanges').disabled = true;
    // Prepare the data to be sent
    const data = {
        zipCodes: selectedZipCodes
    };

    // Send the data to the server using fetch
    fetch('/process-zip-codes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
   
    selected.forEach(node => {
        const data = {
            zipCode: node.textContent
        };
    });
};

function addSelection() {
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    selected.forEach(node => {
          node.classList.remove("selected");
          const div = document.createElement("div");
          div.textContent = node.textContent;
          div.className = "zipCodeSelected";
          div.onclick = function() {
            this.classList.toggle("selected");
          };
          selectedZipCodesContainer.appendChild(div);
          node.remove();
          document.getElementById('saveChanges').disabled = false;
    });
};

function removeSelection() {
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeSelected.selected");
    selected.forEach(node => {
          node.classList.remove("selected");
          const div = document.createElement("div");
          div.textContent = node.textContent;
          div.className = "zipCodeOption";
          div.onclick = function() {
            this.classList.toggle("selected");
          };
          availabeZipCodesContainer.appendChild(div);
          node.remove();
          document.getElementById('saveChanges').disabled = false;
    });
};

function populateZipCodes() {
    const stateSelect = document.getElementById('stateSelect').value;
    const citySelect = document.getElementById('citySelect').value;
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    fetch(`/get-zipcodes?stateSelect=${encodeURIComponent(stateSelect)}&citySelect=${encodeURIComponent(citySelect)}`)
    .then(response => response.json())
    .then(data => {
        availabeZipCodesContainer.innerHTML = '';
        data.results.forEach(code => {
            const div = document.createElement("div");
            div.textContent = code.zipCode;
            div.className = "zipCodeOption";
            div.onclick = function() {
              this.classList.toggle("selected");
            };
            availabeZipCodesContainer.appendChild(div);
          });
    })
    .catch(error => console.error('Error checking user:', error));
};

function populateUserZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    fetch(`/get-userzipcodes`)
    .then(response => response.json())
    .then(data => {
        selectedZipCodesContainer.innerHTML = '';
        if (data.results.length === 0) {
            const div = document.createElement("div");
            div.textContent = 'No zip codes selected';
            selectedZipCodesContainer.appendChild(div);
          }
        data.results.forEach(code => {
            const div = document.createElement("div");
            div.textContent = code.zipCode;
            div.className = "zipCodeSelected";
            div.onclick = function() {
              this.classList.toggle("selected");
            };
            selectedZipCodesContainer.appendChild(div);
          });
    })
    .catch(error => console.error('Error checking user:', error));
};

function populateMonths() {
    const monthSelect = document.getElementById('monthSelect');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach((month, index) => {
        let option = new Option(month, index + 1);
        monthSelect.appendChild(option);
    });
};

function populateYears() {
    const yearSelect = document.getElementById('yearSelect');
    const year = new Date().getFullYear();
    for (let i = year; i <= year + 10; i++) {
        let option = new Option(i, i);
        yearSelect.appendChild(option);
    }
};

function updateDays() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const daySelect = document.getElementById('daySelect');

    const month = monthSelect.value;
    const year = yearSelect.value;
    const daysInMonth = new Date(year, month, 0).getDate();

    daySelect.innerHTML = '';

    for (let i = 1; i <= daysInMonth; i++) {
        let option = new Option(i, i);
        daySelect.appendChild(option);
    }
};

function showOffice() {
    const contain = document.getElementById('profileContainer');
    const data = window.trans;
    if(data) {
        console.log("Has Offices");
    } else {
        console.log("No Offices");
    }
    contain.innerHTML = `<div id="officeContainer">
    <p><h1>Current Office(s)</h1></p>
<table id="officeTable">
    <thead>
        <tr>
            <th>Office Name</th>
            <th>Office License Number</th>
            <th>Office License State</th>
            <th>Office Address</th>
            <th>Office City</th>
            <th>Office State</th>
            <th>Office Zip</th>
            <th>Office Phone Number</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <% if (hasOffices) { %>
          <% offices.forEach(function(office) { %>
            <tr id="office-<%= office.agentofficeid %>">
                <td><%= office.officeName %></td>
                <td><%= office.officeLicenseNumber %></td>
                <td><%= office.officeLicenseState %></td>
                <td><%= office.address %></td>
                <td><%= office.city %></td>
                <td><%= office.state %></td>
                <td><%= office.zip %></td>
                <td><%= office.phoneNumber %></td>
                <td>
                    <button type="button" onclick="deleteOffice(<%= office.agentofficeid %>)">Delete</button>
                </td>
            </tr>
        <% }); %>
        <% } else { %>
            <tr>
                <td colspan="4">No offices found.</td>
            </tr>
        <% } %>
    </tbody>
</table>
<form id="officeForm">
    <input type="text" id="officeName" name="officeName" placeholder="Office Name" required>
    <input type="text" id="officeLicenseNumber" name="officeLicenseNumber" placeholder="Office License Number" required>
    <input type="text" id="officeLicenseState" name="officeLicenseState" placeholder="Office License State" maxlength="2" minlength="2" oninput="this.value = this.value.toUpperCase()" required pattern="[A-Z]{2}" title="Enter a valid US state abbreviation">
    <input type="text" id="address" name="address" placeholder="Office Address" required>
    <input type="text" id="city" name="city" placeholder="Office City" required>
    <input type="text" id="state" name="state" placeholder="Office State" maxlength="2" minlength="2" oninput="this.value = this.value.toUpperCase()" required pattern="[A-Z]{2}" title="Enter a valid US state abbreviation">
    <input type="text" id="zip" name="zip" placeholder="Office Zip" required>
    <input type="text" id="phoneNumber" name="phoneNumber" placeholder="Office Phone Number" required>
    <button type="button" id="transactionAdd" onclick="addOffice()">Add</button>
    <span id="offStatus"></span>
</div>`;
}