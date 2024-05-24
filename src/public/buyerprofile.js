    function showUpload() {
        document.getElementById('uploadSection').classList.remove('hidden');
    }

    function hideUpload() {
        document.getElementById('uploadSection').classList.add('hidden');
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
