<script>
    function showUpload() {
        document.getElementById('uploadSection').classList.remove('hidden');
    }

    function hideUpload() {
        document.getElementById('uploadSection').classList.add('hidden');
    }

    document.getElementById('buyerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);
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
</script>
