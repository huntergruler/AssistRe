// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewAgent();
    populateStates();
    $('#myModal').on('hide.bs.modal', function (e) {
        if (zipChanges === 1) {
            handleUnsavedChanges(e);
        }
    });
});

