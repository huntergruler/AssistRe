document.addEventListener('DOMContentLoaded', function () {
    populateUserZipCodes();
    //    populateStates();
});

function populateUserZipCodes() {
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const ownedZipCodes = document.getElementById("ownedZipCodes");
    let htmlCodes = '';
    console.log('populateUserZipCodes');
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (selectedZipCodesContainer) {
                selectedZipCodesContainer.innerHTML = '';
            }
            if (data.error) {
                const div = document.createElement("div");
                div.className = "form-group row justify-content-center";
                div.textContent = 'No zip codes selected';
                if (selectedZipCodesContainer) {
                    selectedZipCodesContainer.appendChild(div);
                }
                htmlCodes += `<p>No Zip Codes</p><br>`;
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "form-group row justify-content-center";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    if (selectedZipCodesContainer) {
                        selectedZipCodesContainer.appendChild(div);
                    }
                    htmlCodes += `<p>${code.zipCode} - ${code.city}, ${code.state}</p><br>`;
                });
            }
            if (ownedZipCodes) {
                ownedZipCodes.innerHTML = htmlCodes;
            }
        })
        .catch(error => console.error('Error checking user:', error));
};
