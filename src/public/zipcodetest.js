document.addEventListener('DOMContentLoaded', function () {
    populateUserZipCodes();
    populateStates();
    //    populateStates();
});

function populateUserZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const ownedZipCodes = document.getElementById("ownedZipCodes");
    let htmlCodes = '';
    console.log('populateUserZipCodes');
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (selectedZipCodesContainer) {
                selectedZipCodesContainer.innerHTML = '';
            }
            if (data.error) {
                const div = document.createElement("div");
                div.className = "ownedZipCodes zipcoderow justify-content-center";
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
                    div.className = "ownedZipCodes zipcoderow justify-content-center";
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

