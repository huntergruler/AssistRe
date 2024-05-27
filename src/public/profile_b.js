$(document).ready(function() {
    $('#editButton').click(function() {
        $('#profileForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton').hide();
        $('#saveButton').show();
        $('#cancelButton').show();
        $('#state').prop('disabled', true).addClass('view-mode');
        $('#city').prop('disabled', true).addClass('view-mode');
    });

    $('#cancelButton').click(function() {
        location.reload();
    });

    $('#saveButton').click(function() {
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
            success: function(response) {
                if (response.success) {
                    alert('Profile updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating profile.');
                }
            },
            error: function() {
                alert('Error updating profile.');
            }
        });
    });
});

$(document).ready(function() {
    $('#editButton2').click(function() {
        $('#propertyForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton2').hide();
        $('#saveButton2').show();
        $('#cancelButton2').show();
    });

    $('#cancelButton2').click(function() {
        location.reload();
    });

    $('#saveButton2').click(function() {
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
            success: function(response) {
                if (response.success) {
                    alert('Profile updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating profile.');
                }
            },
            error: function() {
                alert('Error updating profile.');
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    prequalified = document.getElementById('prequalified').value;
    if (prequalified === 'Y') {
        document.getElementById('prequalifiedY').checked = true;
        console.log(prequalified);
    } else {
        document.getElementById('prequalifiedN').checked = true;
    }
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
