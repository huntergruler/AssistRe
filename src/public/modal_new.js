        var modal = document.getElementById("messageModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];
        
        // Get the close button inside the modal
        var closeModalButton = document.getElementById("modalCloseButton");
        
        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";
        }
        
        // When the user clicks the close button inside the modal, close the modal
        closeModalButton.onclick = function () {
            modal.style.display = "none";
        }
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        
        // Function to show the modal with a message
        function showModal(message) {
            document.getElementById('modalMessage').textContent = message;
            modal.style.display = "flex";
        }
        