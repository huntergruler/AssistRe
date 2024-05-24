    function showUpload() {
        document.getElementById('uploadSection').classList.remove('hidden');
    }

    function hideUpload() {
        document.getElementById('uploadSection').classList.add('hidden');
    }

    function lookupBuyer() {
        let userid = request.query.userid;
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
      
    document.getElementById('buyerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const checkboxes = document.querySelectorAll('input[name="buyerType"]:checked');
        if (checkboxes.length === 0) {
            alert('Please select at least one buyer type.');
            return;
        }

        const formData = new FormData(this);
        fetch('/submit', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if(data.success) {
                alert('Form submitted successfully');
            } else {
                alert('Error submitting form');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });
