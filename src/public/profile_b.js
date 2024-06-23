// $(document).ready(function () {
//     $('#editButton').click(function () {
//         $('#profileForm input').prop('disabled', false).removeClass('view-mode');
//         $('#editButton').hide();
//         $('#saveButton').show();
//         $('#cancelButton').show();
//         $('#state').prop('disabled', true).addClass('view-mode');
//         $('#city').prop('disabled', true).addClass('view-mode');
//     });

//     $('#cancelButton').click(function () {
//         location.reload();
//     });

//     $('#saveButton').click(function () {
//         const formData = {
//             firstName: $('#firstName').val(),
//             lastName: $('#lastName').val(),
//             address: $('#address').val(),
//             city: $('#city').val(),
//             state: $('#state').val(),
//             zip: $('#zip').val(),
//             phoneNumber: $('#phoneNumber').val(),
//             userid: $('#userid').val()
//         };

//         $.ajax({
//             type: 'POST',
//             url: '/profile_b',
//             data: formData,
//             success: function (response) {
//                 if (response.success) {
//                     alert('Profile updated successfully!');
//                     location.reload();
//                 } else {
//                     alert('Error updating profile.');
//                 }
//             },
//             error: function () {
//                 alert('Error updating profile.');
//             }
//         });
//     });
// });

// $(document).ready(function () {
//     $('#editButton2').click(function () {
//         $('#propertyForm input').prop('disabled', false).removeClass('view-mode');
//         $('#editButton2').hide();
//         $('#saveButton2').show();
//         $('#cancelButton2').show();
//     });

//     $('#cancelButton2').click(function () {
//         location.reload();
//     });

//     $('#saveButton2').click(function () {
//         const formData = {
//             propertyType: $('#propertyType').val(),
//             bedrooms_min: $('#bedrooms_min').val(),
//             bedrooms_max: $('#bedrooms_max').val(),
//             bathrooms_min: $('#bathrooms_min').val(),
//             bathrooms_max: $('#bathrooms_max').val(),
//             squareFootage_min: $('#squareFootage_min').val(),
//             squareFootage_max: $('#squareFootage_max').val(),
//             price_min: $('#price_min').val(),
//             price_max: $('#price_max').val(),
//             timeFrame: $('#timeFrame').val(),
//             prequalifiedY: $('#prequalifiedY').is(':checked'),
//             prequalifiedN: $('#prequalifiedN').is(':checked'),
//             preferredLanguages: $('#preferredLanguages').val(),
//             userid: $('#userid').val()
//         };
//         if (formData.prequalifiedY) {
//             formData.prequalified = 'Yes';
//         } else {
//             formData.prequalified = 'No';
//         }
//         $.ajax({
//             type: 'POST',
//             url: '/profile_b_property',
//             data: formData,
//             success: function (response) {
//                 if (response.success) {
//                     alert('Profile updated successfully!');
//                     location.reload();
//                 } else {
//                     alert('Error updating profile.');
//                 }
//             },
//             error: function () {
//                 alert('Error updating profile.');
//             }
//         });
//     });
// });

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

// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    populateDisplayZipCodes();
    populateLevelOfService();
    populateSearchInfoDisplay();
    getBuyerTypes();
    populateStates();
    // var levelOfService = document.getElementById('levelOfService').value;
    $('#myModal').on('hide.bs.modal', function (e) {
        if (zipChanges === 1) {
            handleUnsavedChanges(e);
        }
    });
    // var prequalified = document.getElementById('prequalified').value;
    // if (prequalified === 'Y') {
    //     document.getElementById('prequalifiedY').checked = true;
    //     toggleFileUpload(true);
    // } else {
    //     document.getElementById('prequalifiedN').checked = true;
    //     toggleFileUpload(false);
    // }
});

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

function saveZipChanges(event) {
    event.preventDefault();
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

function savePersonalChanges() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const userid = document.getElementById('userid').value;
    const data = {
        firstName: firstName,
        lastName: lastName,
        address: address,
        city: city,
        state: state,
        zip: zip,
        phoneNumber: phoneNumber,
        userid: userid
    };
    // Send the data to the server using fetch
    fetch('/profile_b', {
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

function savePropertyChanges(event) {
    event.preventDefault()
    const propertyType = document.getElementById('propertyType').value;
    const bedrooms_min = document.getElementById('bedrooms_min').value;
    const bathrooms_min = document.getElementById('bathrooms_min').value;
    const squareFootage_min = document.getElementById('squareFootage_min').value;
    const squareFootage_max = document.getElementById('squareFootage_max').value;
    const price_min = document.getElementById('price_min').value;
    const price_max = document.getElementById('price_max').value;
    const timeFrame = document.getElementById('timeFrame').value;
    const timeframeUnit = document.getElementById('timeframeUnit').value;
    const prequalifiedY = document.getElementById('prequalifiedY').checked;
    const prequalifiedN = document.getElementById('prequalifiedN').checked;
    const prequalifiedAmount = document.getElementById('prequalifiedAmount').value;
    const preferredLanguages = document.getElementById('preferredLanguages').value;
    const levelofserviceid = document.getElementById('buyerLevelOfService').value;
    const userid = document.getElementById('userid').value;
    const buyerTypeCheckbox = document.querySelectorAll('input[name="buyerType"]:checked');
    const buyerTypeArray = Array.from(buyerTypeCheckbox).map(buyerType => buyerType.value);
    const buyerType = buyerTypeArray.join(',');

    if (prequalifiedY) {
        var prequalified = 'Yes';
        // if (prequalifiedAmount === '' || prequalifiedAmount === null || prequalifiedAmount === undefined || prequalifiedAmount === '0') {
        //     // showModal('Please enter a prequalified amount or select No');
        //     document.getElementById('prequalifiedY').focus();
        //     return;
        // }
    } else {
        var prequalified = 'No';
    }
    const data = {
        propertyType: propertyType,
        bedrooms_min: bedrooms_min,
        bathrooms_min: bathrooms_min,
        squareFootage_min: squareFootage_min,
        squareFootage_max: squareFootage_max,
        buyerType: buyerType,
        price_min: price_min,
        price_max: price_max,
        timeFrame: timeFrame + ' ' + timeframeUnit,
        prequalified: prequalified,
        prequalifiedAmount: prequalifiedAmount,
        levelofserviceid: levelofserviceid,
        preferredLanguages: preferredLanguages,
        userid: userid
    };

    // Send the data to the server using fetch
    fetch('/savePropertyChanges', {
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

function populateSearchInfoDisplay() {
    const populateSearchInfoDisplay = document.getElementById('searchInfoDisplay');
    fetch(`/populateSearchInfoDisplay`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching search info:', data.error);
                return;
            }
            data.results.forEach(item => {
                populateSearchInfoDisplay.innerHTML = item.searchInfoDisplay;
            });
        })

}

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

function getBuyerTypes() {
    buyerTypeCheckbox = document.getElementById('buyerTypeCheckbox');
    buyerTypesData = [];

    fetch(`getBuyerTypes`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching buyer types:', data.error);
                return;
            }
            data.buyerTypeResults.forEach(buyerTypeItem => {
                buyerTypesData = buyerTypeItem.buyerType;
            })
            data.buyerTypes.forEach(item => {
                // Create a label element
                const label = document.createElement('label');
                label.htmlFor = item.buyertypeid;
                label.innerHTML = '&nbsp;' + item.buyerType + '&nbsp;';

                // Create a checkbox element
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'buyerType';
                checkbox.value = item.buyertypeid;
                checkbox.id = item.buyertypeid;
                // Check the checkbox if the buyer type is in the buyerTypesData array
                if (buyerTypesData) {
                    checkbox.checked = buyerTypesData.includes(item.buyertypeid);
                }
                // Append the checkbox and label to the div
                buyerTypeCheckbox.appendChild(label);
                buyerTypeCheckbox.appendChild(checkbox);
            });
        })
}
