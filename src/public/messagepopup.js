// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block"; // Change this line if needed to match your CSS display type
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.classList.add('fadeOut');
    setTimeout(function() {
        modal.style.display = 'none';
        modal.classList.remove('fadeOut');
    }, 500); // Ensure this time matches your fadeOut animation duration
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
