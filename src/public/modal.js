// Show the modal on page load
window.onload = function () {
    document.getElementById('modal-overlay').style.display = 'flex';
};

// Close the modal
document.getElementById('modal-close').onclick = function () {
    document.getElementById('modal-overlay').style.display = 'none';
};

document.getElementById('modal-close-footer').onclick = function () {
    document.getElementById('modal-overlay').style.display = 'none';
};