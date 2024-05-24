$(document).ready(function() {
    $('#editButton').click(function() {
        $('#profileForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton').hide();
        $('#saveButton').show();
        $('#cancelButton').show();
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
            email: $('#email').val(),
            phoneNumber: $('#phoneNumber').val(),
            userid: $('#userid').val()
        };

        $.ajax({
            type: 'POST',
            url: '/profile_buyer',
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
                    document.getElementById('cityState').textContent = response.city + ', ' + response.state;
                } else {
                    document.getElementById('cityState').textContent = 'City and state not found';
                }
            }
        };
        xhr.send();
    }
  }
  