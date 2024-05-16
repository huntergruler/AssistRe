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
    console.log(licenseNumber, licenseState, licenseExpirationDate);
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
}

document.addEventListener('DOMContentLoaded', function () {
    populateMonths();
    populateYears();
    updateDays();
    populateStates();
});

function getSelectedZipCodes() {
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);
    console.log(selectedZipCodes); // Output to console or handle as needed
  }

function populateStates() {
    const stateSelect = document.getElementById('stateSelect');

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a State';
    defaultOption.value = '';
    stateSelect.appendChild(defaultOption);
    
    fetch(`/get-states`)
    .then(response => response.json())
    .then(data => {
        console.log('data',data);
        data.results.forEach(item => {
            let option = document.createElement('option');
            option.value = item.state;
            option.textContent = item.stateName;
            stateSelect.appendChild(option);
        });
    })
}

stateSelect.addEventListener('change', function() {
    var selectedValue = this.value;
    console.log(selectedValue);
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
}

function addSelection() {
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    console.log(selected);
    selected.forEach(node => {
          console.log(node);
          node.classList.remove("selected");
          const div = document.createElement("div");
          div.textContent = node.zipCode;
          div.className = "zipCodeSelected";
          div.onclick = function() {
            this.classList.toggle("selected");
          };
          selectedZipCodesContainer.appendChild(node);
    });
}

function removeSelection() {
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    console.log(selected);
    selected.forEach(node => {
          console.log(node);
          node.classList.remove("selected");
          selectedZipCodesContainer.appendChild(node);
    });
}

function populateZipCodes() {
    const stateSelect = document.getElementById('stateSelect').value;
    const citySelect = document.getElementById('citySelect').value;
    const container = document.getElementById("availabeZipCodesContainer");
    fetch(`/get-zipcodes?stateSelect=${encodeURIComponent(stateSelect)}&citySelect=${encodeURIComponent(citySelect)}`)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = '';
        data.results.forEach(code => {
            const div = document.createElement("div");
            div.textContent = code.zipCode;
            div.className = "zipCodeOption";
            div.onclick = function() {
              this.classList.toggle("selected");
            };
            container.appendChild(div);
          });
    })
    .catch(error => console.error('Error checking user:', error));
}


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
}

function populateYears() {
    const yearSelect = document.getElementById('yearSelect');
    const year = new Date().getFullYear();
    for (let i = year; i <= year + 10; i++) {
        let option = new Option(i, i);
        yearSelect.appendChild(option);
    }
}

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
}

