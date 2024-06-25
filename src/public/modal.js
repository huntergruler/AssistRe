window.onload = function() {
    document.getElementById('messageModal').style.display = 'flex';
};

// Close the modal when the header close button is clicked
document.getElementById('modal-close').onclick = function() {
    document.getElementById('messageModal').style.display = 'none';
};

// Close the modal when the footer close button is clicked
document.getElementById('modal-close-footer').onclick = function() {
    document.getElementById('messageModal').style.display = 'none';
};

// Close the modal when clicking outside the modal content
window.onclick = function(event) {
    const modalOverlay = document.getElementById('messageModal');
    if (event.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
};
