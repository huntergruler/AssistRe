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
            bedrooms: $('#bedrooms').val(),
            bathrooms: $('#bathrooms').val(),
            squareFootage: $('#squareFootage').val(),
            priceRange: $('#priceRange').val(),
            timeFrame: $('#timeFrame').val(),
            prequalified: $('#prequalified').val(),
            preferredLanguages: $('#preferredLanguages').val(),
            userid: $('#userid').val()
        };

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
  