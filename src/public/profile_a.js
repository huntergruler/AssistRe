
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

            const table = document.getElementById('transactionTable');
            const rows = table.querySelectorAll('tbody tr');

            if(rows.length === 0){
                const newRow = table.insertRow(table.rows.length);
                newRow.id = `noTransactionRow`;
                newRow.innerHTML = `<td colspan="4">No transactions found.</td>`;
            }
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
            console.log("addOffice :", data.agentofficeid)
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
            const table = document.getElementById('officeTable');
            const rows = table.querySelectorAll('tbody tr');

            if(rows.length === 0){
                const newRow = table.insertRow(table.rows.length);
                newRow.id = `noOfficeRow`;
                newRow.innerHTML = `<td colspan="9">No offices found.</td>`;
            }
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

            const table = document.getElementById('licensesTable');
            const rows = table.querySelectorAll('tbody tr');

            if(rows.length === 0){
                const newRow = table.insertRow(table.rows.length);
                newRow.id = `noLicenseRow`;
                newRow.innerHTML = `<td colspan="4">No licenses found.</td>`;
            }
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
    populateDisplayZipCodes()
    populateStates();
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

function populateLevelOfService() {
    const buyerLevelOfService = document.getElementById('buyerLevelOfService');
    const levelofservicevalue = document.getElementById('levelofserviceid').value;

    if (!levelofservicevalue) {
        const defaultOption = document.createElement('option');
        buyerLevelOfService.innerHTML = '';
        defaultOption.textContent = 'Select a Level of Service';
        defaultOption.value = '';
        buyerLevelOfService.appendChild(defaultOption);
    }

    fetch(`/get-levelofservice`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                option.value = item.levelofserviceid;
                option.textContent = item.levelOfService;
                option.selected = item.levelofserviceid == levelofservicevalue;
                buyerLevelOfService.appendChild(option);
            });
        })
};

function populateCitiesCounties() {
    const stateSelect = document.getElementById('stateSelect').value;
    const countymessage = document.getElementById('countymessage');
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    // const countycityContainer = document.getElementById("countyCityContainer");
    if (stateSelect === '') {
        citySelect.disabled = true;
        countySelect.disabled = true;
        availabeZipCodesContainer.innerHTML = '';
        countymessage.style.display = 'none';
        return;
    } else {
        const citySelect = document.getElementById('citySelect');
        citySelect.disabled = false;
        countySelect.disabled = false;
        countymessage.style.display = 'block';

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
        fetch(`/get-counties?stateSelect=${encodeURIComponent(stateSelect)}`)
            .then(response => response.json())
            .then(data => {
                // Clear existing options in countySelect
                countySelect.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.textContent = 'Select a County';
                defaultOption.value = '';
                countySelect.appendChild(defaultOption);
                data.results.forEach(item => {
                    let option = new Option(item.county, item.county);
                    countySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function populateCountyZipCodes() {
    const countySelect = document.getElementById('countySelect').value;
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    if (countySelect === '') {
        citySelect.disabled = false;
        availabeZipCodesContainer.innerHTML = '';
        return;
    } else {
        const stateSelect = document.getElementById('stateSelect').value;
        const citySelect = document.getElementById('citySelect');
        citySelect.disabled = true;

        // const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
        fetch(`/get-countyzipcodes?stateSelect=${encodeURIComponent(stateSelect)}&countySelect=${encodeURIComponent(countySelect)}`)
            .then(response => response.json())
            .then(data => {
                availabeZipCodesContainer.innerHTML = '';
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "cityZipCodes zipCodeOption justify-content-center";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    availabeZipCodesContainer.appendChild(div);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function populateCityZipCodes() {
    const citySelect = document.getElementById('citySelect').value;
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    if (citySelect === '') {
        countySelect.disabled = false;
        availabeZipCodesContainer.innerHTML = '';
        return;
    } else {
        const stateSelect = document.getElementById('stateSelect').value;
        const countySelect = document.getElementById('countySelect');
        countySelect.disabled = true;
        // const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
        fetch(`/get-zipcodes?stateSelect=${encodeURIComponent(stateSelect)}&citySelect=${encodeURIComponent(citySelect)}`)
            .then(response => response.json())
            .then(data => {
                availabeZipCodesContainer.innerHTML = '';
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "cityZipCodes zipCodeOption justify-content-center";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    availabeZipCodesContainer.appendChild(div);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function populateUserZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const userZipCodes = document.getElementById("userZipCodes");
    const stateSelect = document.getElementById("stateSelect");
    const citySelect = document.getElementById("citySelect");
    const countySelect = document.getElementById("countySelect");
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    let htmlCodes = '';
    selectedZipCodesContainer.innerHTML = '';
    availabeZipCodesContainer.innerHTML = '';
    citySelect.innerHTML = '';
    countySelect.innerHTML = '';
    stateSelect.selectedIndex = 0;
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            if (!data.results) {
                const div = document.createElement("div");
                div.className = "userZipCodes justify-content-center";
                div.textContent = 'No zip codes yet';
                if (selectedZipCodesContainer) {
                    selectedZipCodesContainer.appendChild(div);
                }
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.className = "userZipCodes align-items-center";
                    div.textContent = code.zipCode;
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    if (selectedZipCodesContainer) {
                        selectedZipCodesContainer.appendChild(div);
                    }
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function populateDisplayZipCodes() {
    const displayZipCodes = document.getElementById("displayZipCodes");
    let htmlCodes = '';
    displayZipCodes.innerHTML = '';
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            if (!data.results) {
                const div = document.createElement("div");
                div.className = "userZipCodes justify-content-center";
                div.textContent = 'Currently no zip codes yet';
                displayZipCodes.appendChild(div);
                htmlCodes += `<p>Currently no zip codes selected</p>`;
                displayZipCodes.innerHTML = htmlCodes;
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "userZipCodes align-items-center";
                    if (displayZipCodes) {
                        displayZipCodes.appendChild(div);
                    }
                    htmlCodes += `${code.zipCode} - ${code.city}, ${code.state}<br>`;
                });
            }
            if (displayZipCodes) {
                displayZipCodes.innerHTML = htmlCodes;
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function saveZipChanges() {
    const selected = document.querySelectorAll(".zipCodeSelected");
    const selected2 = document.querySelectorAll(".userZipCodes");

    // Prepare the array of selected zip codes
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);
    const selectedZipCodes2 = Array.from(selected2).map(node => node.textContent);

    //document.getElementById('saveChanges').disabled = true;
    // Prepare the data to be sent
    const userZipCodes = selectedZipCodes.concat(selectedZipCodes2);
    const data = {
        zipCodes: userZipCodes
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

    populateDisplayZipCodes();
    selected.forEach(node => {
        const data = {
            zipCode: node.textContent
        };
    });
};

let zipChanges = 0;
function addZipCode() {
    const zipSelect = document.getElementById("zipSelect");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    zipChanges = 1;
    if (zipSelect.value.length === 5) {
        fetch(`/check-zipcode?stateSelect=${encodeURIComponent(zipSelect.value)}`)
            .then(response => response.json())
            .then(data => {
                if (data.zipCodeResult === 'Valid') {
                    if (selectedZipCodesContainer.textContent === 'No zip codes yet') {
                        selectedZipCodesContainer.innerHTML = '';
                    }
                    const div = document.createElement("div");
                    div.textContent = zipSelect.value;
                    div.className = "zipCodeSelected";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    selectedZipCodesContainer.appendChild(div);
                    zipSelect.value = '';
                }
                else if (data.zipCodeResult === 'Invalid') {
                    alert('Zip code not found');
                    zipSelect.value = '';
                }
                else if (data.zipCodeResult === 'Selected') {
                    alert('Zip code already selected');
                    zipSelect.value = '';
                }
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function addSelection(event) {
    event.preventDefault();
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
        //document.getElementById('saveChanges').disabled = false;
    });
};

function removeSelection(event) {
    event.preventDefault();
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
        //document.getElementById('saveChanges').disabled = false;
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

function savePersonalChanges() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const bio = document.getElementById('bio').value;
    const languages = document.getElementById('languages').value;
    const userid = document.getElementById('personalagentid').value;
    const data = {
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        languages: languages,
        userid: userid
    };
    console.log("savePersonalChanges data: ", data);
    // Send the data to the server using fetch
    fetch('/profile_a', {
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
            window.location.reload();
        })
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

var officeToggle = 1;
function showOffice() {
    const form = document.getElementById("officeForm");
    const table = document.getElementById('officeTable');
    const officeButton = document.getElementById('officeButton');
    const addOfficeButton = document.getElementById('officeAdd');
    var officeIDs = []
    var htmlChange = '';

    addOfficeButton.onclick = function () {
        const noOffices = document.getElementById('noOfficeRow');
        if(noOffices){
            noOffices.remove();
        }
        addOffice();
    }

    if (officeToggle == 0) {
        form.style.display = "none";
        const headerRow = table.querySelector('thead tr');
        const rows = table.querySelectorAll('tbody tr');

        // Check if there's more than one column to delete
        if (headerRow.children.length > 0) {
            // Remove the last header cell
            headerRow.removeChild(headerRow.lastElementChild);

            // Remove the last cell in each row
            rows.forEach((row) => {
                console.log(row);
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
                }
                const headerRow = table.querySelector('thead tr');
                    const newHeader = document.createElement('th');
                    newHeader.textContent = ``;
                    headerRow.appendChild(newHeader);

                    // Add cells to each row in the tbody
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        const newCell = document.createElement('td');
                        console.log("Office Index: " + officeIDs[index]);
                        htmlChange = '';
                        if (data.hasOffices) {
                            htmlChange = `<button type="button" onclick="deleteOffice(${officeIDs[index]})">Delete</button>`;
                        }
                        newCell.innerHTML = htmlChange;
                        row.appendChild(newCell);
                    });
                officeToggle = 0;
            });
    }
}

var licToggle = 1;
function showLicense() {
    const form = document.getElementById("licenseForm");
    const table = document.getElementById('licensesTable');
    const licenseButton = document.getElementById('licenseButton');
    const addLicenseButton = document.getElementById('licenseAdd');
    var licenseIDs = []
    var htmlChange = '';
    //console.log("licToggle is " + licToggle);

    addLicenseButton.onclick = function () {
        const noLicences = document.getElementById('noLicenseRow');
        if(noLicences){
            noLicences.remove();
        }
        addLicense();
    }

    if (licToggle == 0) {
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
                }
                const headerRow = table.querySelector('thead tr');
                const newHeader = document.createElement('th');
                newHeader.textContent = ``;
                headerRow.appendChild(newHeader);

                // Add cells to each row in the tbody
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach((row, index) => {
                    const newCell = document.createElement('td');
                    htmlChange = '';
                    if (data.hasLicenses) {
                        htmlChange = `<button type="button" onclick="deleteLicense(${licenseIDs[index]})">Delete</button>`;
                    }
                    newCell.innerHTML = htmlChange;
                    row.appendChild(newCell);
                });
                licToggle = 0;
            });
    }
};

var zipToggle = 1;
function showZipCodes() {
    const form = document.getElementById("zipCodeForm");
    const disp = document.getElementById("ownedZipCodes");
    const zipButton = document.getElementById('zipCodeButton');

    if (zipToggle == 0) {
        form.style.display = "none";
        disp.style.display = "block";
        zipButton.innerHTML = "Edit";
        zipToggle = 1;
        
        saveChanges();
        populateAgentZipCodes();
    }
    else {
        form.style.display = "block";
        disp.style.display = "none";
        zipButton.innerHTML = "Done";
        populateStates();
        populateAgentZipCodes();
        zipToggle = 0;
    }
};

var transToggle = 1;
function showTransactions() {
    const form = document.getElementById("transactionForm");
    const table = document.getElementById('transactionTable');
    const transactionButton = document.getElementById('transactionButton');
    const addTransactionButton = document.getElementById('transactionAdd');
    var transIDs = []

    addTransactionButton.onclick = function () {
        const noTransaction = document.getElementById('noTransactionRow');
        if(noTransaction){
            noTransaction.remove();
        }
        addTransaction();
    }

    if (transToggle == 0) {
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
        transactionButton.innerHTML = "Edit";
        transToggle = 1;
    }
    else {
        form.style.display = "grid";
        transactionButton.innerHTML = "Done";
        var htmlChange = '';
        fetch('/api/profile_a')
            .then(response => response.json())
            .then(data => {
                if (data.hasTransactions) {
                    data.transactions.forEach(function (transaction) {
                        transIDs.push(transaction.agenttransactionid);
                    });
                }
                const headerRow = table.querySelector('thead tr');
                const newHeader = document.createElement('th');
                newHeader.textContent = ``;
                headerRow.appendChild(newHeader);

                // Add cells to each row in the tbody
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach((row, index) => {
                    const newCell = document.createElement('td');
                    htmlChange = '';
                    if (data.hasTransactions) {
                        htmlChange = `<button type="button" onclick="deleteTransaction(${transIDs[index]})">Delete</button>`;
                    }
                    newCell.innerHTML = htmlChange;
                    row.appendChild(newCell);
                });
                transToggle = 0;
            });
    }
};

var bioToggle = 1;
function showBio() {
    // const contain = document.getElementById('profileContainer');
    // let htmlChange = `<h1>Biography</h1>
    // <textarea id="bio" name="bio" rows="4" cols="50" placeholder="Enter your biography here" required></textarea>
    // <br>
    // <textarea id="langauges" name="languages" rows="4" cols="50" placeholder="Enter the languages you speak here" required></textarea>
    // <button type="button" id="bioAdd" onclick="addBio()">Add</button>
    // <span id="bioStatus"></span>`;
    // contain.innerHTML = htmlChange;

    const bioText = document.getElementById('bioText');
    const langText = document.getElementById('languagesText');
    const bio = document.getElementById('bio');
    const lang = document.getElementById('languages');
    const form = document.getElementById("bioForm");
    const text = document.getElementById("bioDiv");
    const bioButton = document.getElementById('bioButton');

    if (bioToggle == 0) {
        form.style.display = "none";
        text.style.display = "block";
        bioButton.innerHTML = "Edit";
        if(bio.value == "") {
            bioText.innerHTML = "No Biography";
        }
        else {
            bioText.innerHTML = bio.value;
        }
        if(lang.value == "") {
            langText.innerHTML = "No Languages";
        }
        else {
            langText.innerHTML = lang.value;
        }
        bioToggle = 1;
        //addBio()
    }
    else {
        form.style.display = "block";
        text.style.display = "none";
        bioButton.innerHTML = "Done";

        if(bioText.textContent != "No Biography"){
            bio.value = bioText.textContent;
        }
        if(langText.textContent != "No Languages"){
            lang.value = langText.textContent;
        }
        bioToggle = 0;
    }
}