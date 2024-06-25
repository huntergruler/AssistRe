// Modal functions
$(document).ready(function () {
    $('#messageModal').modal('show');
});

// Show the modal on page load
window.onload = function () {
    document.getElementById('messageModal').style.display = 'flex';
};

// Close the modal
document.getElementById('modal-close').onclick = function () {
    document.getElementById('messageModal').style.display = 'none';
};

document.getElementById('modal-close-footer').onclick = function () {
    document.getElementById('messageModal').style.display = 'none';
};
