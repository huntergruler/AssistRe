$(document).ready(function () {
    $('#editButton').click(function () {
        $('#profileForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton').hide();
        $('#saveButton').show();
        $('#cancelButton').show();
        $('#state').prop('disabled', true).addClass('view-mode');
        $('#city').prop('disabled', true).addClass('view-mode');
    });

    $('#cancelButton').click(function () {
        location.reload();
    });

    $('#saveButton').click(function () {
        const formData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            address: $('#address').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            zip: $('#zip').val(),
            phoneNumber: $('#phoneNumber').val(),
            userid: $('#userid').val()
        };

        $.ajax({
            type: 'POST',
            url: '/profile_b',
            data: formData,
            success: function (response) {
                if (response.success) {
                    alert('Profile updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating profile.');
                }
            },
            error: function () {
                alert('Error updating profile.');
            }
        });
    });
});

$(document).ready(function () {
    $('#editButton2').click(function () {
        $('#propertyForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton2').hide();
        $('#saveButton2').show();
        $('#cancelButton2').show();
    });

    $('#cancelButton2').click(function () {
        location.reload();
    });

    $('#saveButton2').click(function () {
        const formData = {
            propertyType: $('#propertyType').val(),
            bedrooms_min: $('#bedrooms_min').val(),
            bedrooms_max: $('#bedrooms_max').val(),
            bathrooms_min: $('#bathrooms_min').val(),
            bathrooms_max: $('#bathrooms_max').val(),
            squareFootage_min: $('#squareFootage_min').val(),
            squareFootage_max: $('#squareFootage_max').val(),
            price_min: $('#price_min').val(),
            price_max: $('#price_max').val(),
            timeFrame: $('#timeFrame').val(),
            prequalifiedY: $('#prequalifiedY').is(':checked'),
            prequalifiedN: $('#prequalifiedN').is(':checked'),
            preferredLanguages: $('#preferredLanguages').val(),
            userid: $('#userid').val()
        };
        if (formData.prequalifiedY) {
            formData.prequalified = 'Y';
        } else {
            formData.prequalified = 'N';
        }
        $.ajax({
            type: 'POST',
            url: '/profile_b_property',
            data: formData,
            success: function (response) {
                if (response.success) {
                    alert('Profile updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating profile.');
                }
            },
            error: function () {
                alert('Error updating profile.');
            }
        });
    });
});

function lookupCityState() {
    let zipCode = document.getElementById('zip').value;
    if (zipCode) {
        // Create a new XMLHttpRequest object
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/get-city-state?zipCode=' + zipCode, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.city && response.state) {
                    document.getElementById('cityState').textContent = '';
                    document.getElementById('city').value = response.city;
                    document.getElementById('state').value = response.state;
                } else {
                    document.getElementById('cityState').textContent = 'Zip Code not found';
                }
            }
        };
        xhr.send();
    }
}

function showZipCodes() {
    var zipToggle = 1;
    const form = document.getElementById("zipCodeForm");
    const disp = document.getElementById("ownedZipCodes");
    const zipButton = document.getElementById('zipCodeButton');

    if (zipToggle == 0) {
        form.style.display = "none";
        disp.style.display = "block";
        zipButton.innerHTML = "Edit";
        zipToggle = 1;

        saveChanges();
        populateUserZipCodes();
    }
    else {
        form.style.display = "block";
        disp.style.display = "none";
        zipButton.innerHTML = "Done";
        populateStates();
        populateUserZipCodes();
        zipToggle = 0;
    }
};

// // Function to toggle the file upload input based on the selected radio button
// function toggleFileUpload(show) {
//     var fileUploadDiv = document.getElementById('fileUploadDiv');
//     if (show) {
//         fileUploadDiv.style.display = 'flex'; // Change to 'block' if 'flex' does not suit your layout
//     } else {
//         fileUploadDiv.style.display = 'none';
//     }
// }

// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    populateBuyerZipCodes();
    // var prequalified = document.getElementById('prequalified').value;
    // if (prequalified === 'Y') {
    //     document.getElementById('prequalifiedY').checked = true;
    //     toggleFileUpload(true);
    // } else {
    //     document.getElementById('prequalifiedN').checked = true;
    //     toggleFileUpload(false);
    // }
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

function saveChanges() {
    const selected = document.querySelectorAll(".zipCodeSelected");

    // Prepare the array of selected zip codes
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);

    //document.getElementById('saveChanges').disabled = true;
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
        //document.getElementById('saveChanges').disabled = false;
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

function populateUserZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const ownedZipCodes = document.getElementById("ownedZipCodes");
    let htmlCodes = '';
    console.log('populateUserZipCodes');
    fetch(`/get-agentzipcodes`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
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

