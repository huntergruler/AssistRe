// Function to populate states
function populateStates() {
    fetch('/get-states')
    .then(response => response.json())
    .then(data => {
        const stateSelect = document.getElementById('stateSelect');
        data.forEach(state => {
            const option = new Option(state.name, state.id);
            stateSelect.appendChild(option);
        });
    });
}

// Function to update cities based on selected state
function updateCities(stateId) {
    fetch(`/get-cities/${stateId}`)
    .then(response => response.json())
    .then(data => {
        const citySelect = document.getElementById('citySelect');
        citySelect.innerHTML = ''; // Clear existing options
        data.forEach(city => {
            const option = new Option(city.name, city.id);
            citySelect.appendChild(option);
        });
    });
}

// Function to update zip codes based on selected city
function updateZipCodes(cityId) {
    fetch(`/get-zipcodes/${cityId}`)
    .then(response => response.json())
    .then(data => {
        const zipSelect = document.getElementById('zipSelect');
        zipSelect.innerHTML = ''; // Clear existing options
        data.forEach(zip => {
            const option = new Option(zip.code, zip.code);
            zipSelect.appendChild(option);
        });
    });
}

// Function to add selected zip code to user's list
function addZipCode() {
    const zipCode = document.getElementById('zipSelect').value;
    fetch('/add-zipcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode })
    })
    .then(() => {
        const selectedZipCodes = document.getElementById('selectedZipCodes');
        selectedZipCodes.innerHTML += `<p>${zipCode}</p>`; // Update UI
    });
}

// Initial population of states
document.addEventListener('DOMContentLoaded', populateStates);
