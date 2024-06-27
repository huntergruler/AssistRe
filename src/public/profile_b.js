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
                    document.getElementById('cityState').textContent = response.cityState;
                    document.getElementById('city').textContent = response.city;
                    document.getElementById('state').textContent = response.state;
                } else {
                    document.getElementById('cityState').textContent = 'Zip Code not found';
                    document.getElementById('city').textContent = '';
                    document.getElementById('state').textContent = '';
                    document.getElementById('zip').focus();
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

function savePersonalChanges() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const zip = document.getElementById('zip').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const userid = document.getElementById('userid').value;
    const data = {
        firstName: firstName,
        lastName: lastName,
        address: address,
        zip: zip,
        phoneNumber: phoneNumber,
        userid: userid
    };
    // Send the data to the server using fetch
    fetch('/savePersonalChanges', {
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
            buyerTypeCheckbox.innerHTML = '';
            data.buyerTypes.forEach(item => {
                if (buyerTypesData) {
                    if (buyerTypesData.includes(item.buyertypeid)) {
                        checked = 'checked';
                    }
                    else {
                        checked = null;
                    }
                }
                buyerTypeCheckbox.innerHTML += `
                <div class="form-check-inline">
                    <input class="form-check-input" type="checkbox" ${checked} name="buyerType" value="${item.buyertypeid}" id="${item.buyertypeid}">
                    <label class="form-check-label" for="${item.buyertypeid}">${item.buyerType}</label>
                    </div>`;
            }
            );
        })
}
