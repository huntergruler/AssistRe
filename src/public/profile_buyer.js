$(document).ready(function() {
    $('#editButton').click(function() {
        $('#profileForm input').prop('disabled', false);
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