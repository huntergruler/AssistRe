
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
            newRow.insertCell(8).innerHTML = `<button onclick="deleteOffice('${data.agentofficeid}')">Delete</button>`;
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
    const licenseDate = document.getElementById('licenseExpirationDate').value;
    const date = licenseDate.split('-');
    const licenseExpirationDate = new Date(date[0], date[1] - 1, date[2]);

    // JavaScript Date months are 0-indexed, so subtract 1. 
    // HTML values are 1-indexed if filled as shown in previous messages.
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

document.addEventListener('blur', function (event) {
    if (event.target.id === 'licenseState') {
        const licenseState = document.getElementById('licenseState').value.trim();
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
    populateAgentZipCodes();
//    populateMonths();
//    populateYears();
//    updateDays();
//    populateStates();
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

// stateSelect.addEventListener('change', function () {
//     var selectedValue = this.value;
// });

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
        div.onclick = function () {
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
        div.onclick = function () {
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
                div.onclick = function () {
                    this.classList.toggle("selected");
                };
                availabeZipCodesContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error checking user:', error));
};

function populateAgentZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const ownedZipCodes = document.getElementById("ownedZipCodes");
    let htmlCodes = '';
    fetch(`/get-agentzipcodes`)
        .then(response => response.json())
        .then(data => {
            if (selectedZipCodesContainer) {
                selectedZipCodesContainer.innerHTML = '';
            }
            if (data.error) {
                const div = document.createElement("div");
                div.textContent = 'No zip codes selected';
                if (selectedZipCodesContainer) {
                    selectedZipCodesContainer.appendChild(div);
                }
                htmlCodes += `<p>No Zip Codes</p><br>`;
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "zipCodeSelected";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    if (selectedZipCodesContainer) {
                        selectedZipCodesContainer.appendChild(div);
                    }
                    htmlCodes += `<p>${code.zipCode} - ${code.city}, ${code.state}</p><br>`;
                });
            }
            if (ownedZipCodes) {
                ownedZipCodes.innerHTML = htmlCodes;
            }
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

var officeToggle = 1;
function showOffice() {
    const form = document.getElementById("officeForm");
    const table = document.getElementById('officeTable');
    const officeButton = document.getElementById('officeButton');
    var officeIDs = []
    console.log("officeToggle is " + officeToggle);
    if(officeToggle == 0){
        form.style.display = "none";
        const headerRow = table.querySelector('thead tr');
        const rows = table.querySelectorAll('tbody tr');

        // Check if there's more than one column to delete
        if (headerRow.children.length > 0) {
            // Remove the last header cell
            headerRow.removeChild(headerRow.lastElementChild);

            // Remove the last cell in each row
            rows.forEach((row) => {
                row.removeChild(row.lastElementChild);
            });
        }
        officeButton.innerHTML = "Edit";
        officeToggle = 1;
    }
    else {
        form.style.display = "grid";
        officeButton.innerHTML = "Done";
        console.log("officeToggle is 1");
        fetch('/api/profile_a')
            .then(response => response.json())
            .then(data => {
                if (data.hasOffices) {
                    data.offices.forEach(function (office) {
                        officeIDs.push(office.agentofficeid);
                    });
                    

                    const headerRow = table.querySelector('thead tr');
                    const newHeader = document.createElement('th');
                    newHeader.textContent = ``;
                    headerRow.appendChild(newHeader);
                
                    // Add cells to each row in the tbody
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        const newCell = document.createElement('td');
                        newCell.innerHTML = `<button type="button" onclick="deleteOffice(${officeIDs[index]})">Delete</button>`;
                        row.appendChild(newCell);
                    });
                    officeToggle = 0;
            }
        });
    }
    const overButton = document.getElementById('overviewButton');
    
    const licButton = document.getElementById('licenseButton');
    const zipButton = document.getElementById('zipCodeButton');
    const transButton = document.getElementById('transactionButton');
    const bioButton = document.getElementById('bioButton');

    overButton.classList.remove('selectedStyle');
    overButton.classList.add('hoverStyle');
    officeButton.classList.add('selectedStyle');
    officeButton.classList.remove('hoverStyle');
    licButton.classList.remove('selectedStyle');
    licButton.classList.add('hoverStyle');
    zipButton.classList.remove('selectedStyle');
    zipButton.classList.add('hoverStyle');
    transButton.classList.remove('selectedStyle');
    transButton.classList.add('hoverStyle');
    bioButton.classList.remove('selectedStyle');
    bioButton.classList.add('hoverStyle');
}

var licToggle = 1;
function showLicense() {
    const form = document.getElementById("licenseForm");
    const table = document.getElementById('licensesTable');
    const licenseButton = document.getElementById('licenseButton');
    var licenseIDs = []
    //console.log("licToggle is " + licToggle);

    if(licToggle == 0){
        form.style.display = "none";
        const headerRow = table.querySelector('thead tr');
        const rows = table.querySelectorAll('tbody tr');

        // Check if there's more than one column to delete
        if (headerRow.children.length > 0) {
            // Remove the last header cell
            headerRow.removeChild(headerRow.lastElementChild);

            // Remove the last cell in each row
            rows.forEach((row) => {
                row.removeChild(row.lastElementChild);
            });
        }
        licenseButton.innerHTML = "Edit";
        licToggle = 1;
    }
    else {
        form.style.display = "grid";
        licenseButton.innerHTML = "Done";
        fetch('/api/profile_a')
            .then(response => response.json())
            .then(data => {
                if (data.hasLicenses) {
                    data.licenses.forEach(function (license) {
                        licenseIDs.push(license.agentlicenseid);
                    });

                    const headerRow = table.querySelector('thead tr');
                    const newHeader = document.createElement('th');
                    newHeader.textContent = ``;
                    headerRow.appendChild(newHeader);
                
                    // Add cells to each row in the tbody
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        const newCell = document.createElement('td');
                        newCell.innerHTML = `<button type="button" onclick="deleteLicense(${licenseIDs[index]})">Delete</button>`;
                        row.appendChild(newCell);
                    });
                    licToggle = 0;
            }
        });
    }
};

var zipToggle = 1;
function showZipCodes() {
    const form = document.getElementById("zipCodeForm");
    const disp = document.getElementById("ownedZipCodes");
    const zipButton = document.getElementById('zipCodeButton');
    //console.log("licToggle is " + licToggle);

    if(zipToggle == 0){
        form.style.display = "none";
        disp.style.display = "block";
        zipToggle = 1;
    }
    else {
        form.style.display = "block";
        disp.style.display = "none";
        zipToggle = 0;
    }
    /*const contain = document.getElementById('profileContainer');
    let htmlChange = `<h1>Zip Codes</h1>
    <p>Select Zip Codes in which you would like offers</p>
    <br>
    <label for="stateSelect">States:</label>
    <select id="stateSelect" onchange="populateCities();"></select>   
    <label for="citySelect">Cities:</label>
    <select id="citySelect" onchange="populateZipCodes();"></select>
    <div class="grid-container">
        <div class="grid-available">
            <p>Available Zip Codes</p>
            <div class="container">
                <div id="availabeZipCodesContainer" class="box1">
                    <!-- JavaScript will populate this container -->
                </div>
            </div>
        </div>
        <div class="grid-action">
            <button type="button" class="button" onclick="addSelection()">Add --> </button>
            <button type="button" class="button" onclick="removeSelection()"> <-- Remove</button>
        </div>
        <div class="grid-selected">
            <p>Selected Zip Codes</p>
            <div class="container">
                <div id="selectedZipCodesContainer" class="box2">
                    <!-- JavaScript will populate this container -->
                </div>
            </div>
        </div>
    </div>
    <button type="button" class="button" disabled id="saveChanges" onclick="saveChanges()">SAVE</button>`;
    contain.innerHTML = htmlChange;
    populateStates();
    populateAgentZipCodes();

    const overButton = document.getElementById('overviewButton');
    const officeButton = document.getElementById('officeButton');
    const licButton = document.getElementById('licenseButton');
    const zipButton = document.getElementById('zipCodeButton');
    const transButton = document.getElementById('transactionButton');
    const bioButton = document.getElementById('bioButton');

    overButton.classList.remove('selectedStyle');
    overButton.classList.add('hoverStyle');
    officeButton.classList.remove('selectedStyle');
    officeButton.classList.add('hoverStyle');
    licButton.classList.remove('selectedStyle');
    licButton.classList.add('hoverStyle');
    zipButton.classList.add('selectedStyle');
    zipButton.classList.remove('hoverStyle');
    transButton.classList.remove('selectedStyle');
    transButton.classList.add('hoverStyle');
    bioButton.classList.remove('selectedStyle');
    bioButton.classList.add('hoverStyle');*/
}

function showOverview() {
    location.reload();
}

function showTransactions() {
    const contain = document.getElementById('profileContainer');
    let htmlChange = `<p><h1>Current Transaction(s)</h1></p>
    <table id="transactionTable">
        <thead>
            <tr>
                <th>Transaction Date</th>
                <th>Transaction Amount</th>
                <th>Transaction Property Type</th>
                <th>Transaction Level Of Service</th>
                <th>Transaction Compensation Type</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    fetch('/api/profile_a')
        .then(response => response.json())
        .then(data => {
            if (data.hasTransactions) {
                data.transactions.forEach(function (transaction) {
                    htmlChange += `<tr id="transaction-${transaction.agenttransactionid}">
                    <td>${transaction.transactionDate}</td>
                    <td>${transaction.transactionAmount}</td>
                    <td>${transaction.PropertyType}</td>
                    <td>${transaction.LevelOfService}</td>
                    <td>${transaction.CompensationType}</td>
                    <td>
                        <button type="button" onclick="deleteTransaction(${transaction.agenttransactionid})">Delete</button>
                    </td>
                    </tr>`;
                });
            } else {
                htmlChange += `<tr>
                <td colspan="4">No transactions found.</td>
                </tr>`;
            }
            htmlChange += `</tbody>
    </table>
    <form id="transactionForm">
        <input type="date" id="transactionDate" name="transactionDate" placeholder="Transaction Date" required>
        <input type="number" id="transactionAmount" name="transactionAmount" placeholder="Transaction Amount" required>
        <input type="text" id="propertyType" name="PropertyType" placeholder="Transaction Property Type" required>
        <input type="text" id="levelOfService" name="LevelOfService" placeholder="Transaction Level Of Service" required>
        <input type="text" id="compensationType" name="CompensationType" placeholder="Transaction Compensation Type" required>
        <button type="button" id="transactionAdd" onclick="addTransaction()">Add</button>
    </form>`;
            contain.innerHTML = htmlChange;
        });

    const overButton = document.getElementById('overviewButton');
    const officeButton = document.getElementById('officeButton');
    const licButton = document.getElementById('licenseButton');
    const zipButton = document.getElementById('zipCodeButton');
    const transButton = document.getElementById('transactionButton');
    const bioButton = document.getElementById('bioButton');

    overButton.classList.remove('selectedStyle');
    overButton.classList.add('hoverStyle');
    officeButton.classList.remove('selectedStyle');
    officeButton.classList.add('hoverStyle');
    licButton.classList.remove('selectedStyle');
    licButton.classList.add('hoverStyle');
    zipButton.classList.remove('selectedStyle');
    zipButton.classList.add('hoverStyle');
    transButton.classList.add('selectedStyle');
    transButton.classList.remove('hoverStyle');
    bioButton.classList.remove('selectedStyle');
    bioButton.classList.add('hoverStyle');
}


function showBio() {
    const contain = document.getElementById('profileContainer');
    let htmlChange = `<h1>Biography</h1>
    <textarea id="bio" name="bio" rows="4" cols="50" placeholder="Enter your biography here" required></textarea>
    <br>
    <textarea id="langauges" name="languages" rows="4" cols="50" placeholder="Enter the languages you speak here" required></textarea>
    <button type="button" id="bioAdd" onclick="addBio()">Add</button>
    <span id="bioStatus"></span>`;
    contain.innerHTML = htmlChange;

    const overButton = document.getElementById('overviewButton');
    const officeButton = document.getElementById('officeButton');
    const licButton = document.getElementById('licenseButton');
    const zipButton = document.getElementById('zipCodeButton');
    const transButton = document.getElementById('transactionButton');
    const bioButton = document.getElementById('bioButton');

    overButton.classList.remove('selectedStyle');
    overButton.classList.add('hoverStyle');
    officeButton.classList.remove('selectedStyle');
    officeButton.classList.add('hoverStyle');
    licButton.classList.remove('selectedStyle');
    licButton.classList.add('hoverStyle');
    zipButton.classList.remove('selectedStyle');
    zipButton.classList.add('hoverStyle');
    transButton.classList.remove('selectedStyle');
    transButton.classList.add('hoverStyle');
    bioButton.classList.add('selectedStyle');
    bioButton.classList.remove('hoverStyle');
}