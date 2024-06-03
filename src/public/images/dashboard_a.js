// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewAgent();
    populateStates();
    $('#myModal').on('hide.bs.modal', function (e) {
        if (zipChanges === 1) {
            handleUnsavedChanges(e);
        }
    });
    // var prequalified = document.getElementById('prequalified').value;
    // if (prequalified === 'Y') {
    //     document.getElementById('prequalifiedY').checked = true;
    //     toggleFileUpload(true);
    // } else {
    //     document.getElementById('prequalifiedN').checked = true;
    //     toggleFileUpload(false);
    // }
});
