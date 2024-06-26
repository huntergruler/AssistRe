function populateUserZipCodes() {
    populateLevelOfService();
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

document.getElementById('zipSelect').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        console.log('Enter key pressed');
        event.preventDefault();
        addZipCode();
        // Optionally, trigger form submission if needed
        // submitForm();
    }
});

function addSelection(event) {
    event.preventDefault();
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    zipChanges = 1;
    if (selectedZipCodesContainer.textContent === 'No zip codes yet') {
        selectedZipCodesContainer.innerHTML = '';
    }
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
    const selected = document.querySelectorAll(".userZipCodes.selected");
    zipChanges = 1;
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
    if (!selectedZipCodesContainer) {
        selectedZipCodesContainer.innerHTML = 'No zip codes yet';
    }

};
