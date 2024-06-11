// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewRequests();
    populateLevelOfService();
    populateOfferTypes();
    populateCompensationTypes();
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'none';
    document.querySelector('#newRequestDetail').innerHTML = '<c><br><strong> <--- Select a buyer request to view details </strong><br><br></c>';
    // var time_zone_offset = new Date().getTimezoneOffset(); // in minutes
    // var time_zone = Date().time_zone;
    // SELECT DATE_FORMAT(CONVERT_TZ(your_timestamp_column, '+00:00', @user_time_zone), '%m/%d/%Y %h:%i:%s %p') AS formatted_timestamp
    // FROM your_table_name;
});

let selectedBuyerId = null;
function getNewRequests() {
    const newRequests = document.getElementById('newRequests');
    newRequests.innerHTML = '';
    fetch(`/getNewRequests`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                const div = document.createElement("div");
                div.textContent = 'No new requests';
                newRequests.appendChild(div);
            }
            else {

                data.forEach(request => {
                    const div = document.createElement("div");
                    div.innerHTML = `${request.buyerType}<br>
                    $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timeline: ${request.timeFrame}`;
                    div.addEventListener('click', () => selectItem(request.buyerid, request.buyerrequestid));
                    div.className = "form-row container-left";
                    div.id = "buyerid" + request.buyerid;
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    // newRequests.appendChild(input);
                    newRequests.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function selectItem(buyerid, buyerrequestid) {
    if (selectedBuyerId === buyerid) return; // If already selected, do nothing
    var selectedBuyerId = 'buyerid' + buyerid;
    const rows = document.querySelectorAll('#newRequests .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    newRequestDetail(buyerid, buyerrequestid);
}

function newRequestDetail(buyerid, buyerrequestid) {
    const detailColumn = document.getElementById('newRequestDetail');
    const detailButtons = document.getElementById('detailButtons');
    document.getElementById('buyerid').value = buyerid;
    document.getElementById('buyerrequestid').value = buyerrequestid;

    detailColumn.innerHTML = "";
    detailButtons.innerHTML = "";
    // detailColumn.innerHTML = `<p><strong>ID:</strong>${buyerid}</p><p><strong>Name:`;
    fetch(`/getNewRequests?buyerid=${encodeURIComponent(buyerid)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                const div = document.createElement("div");
                div.innerHTML = `${request.buyerType}<br>
                    Price Range: $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timeline: ${request.timeFrame}<br>
                    Property Type: ${request.propertyType}<br>
                    Minimum Bedrooms: ${request.bedrooms_min}<br>
                    Minimum Bathrooms: ${request.bathrooms_min}<br>
                    Square Footage Range: ${request.squareFootage_min} to ${request.squareFootage_max}<br>
                    Preferred Language: ${request.preferredLanguages}<br>
                    User Zip Codes: ${request.zipCodes}<br>
                    Entered on ${request.entrytimestamp}<br>
                    `;
                div.className = "form-row container-right";
                div.id = "buyerid" + request.buyerid;
                detailColumn.appendChild(div);

                // Create a container div to hold the buttons
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "form-row"; // Apply any additional styling if needed
                buttonContainer.style.border ="none";

                // Create each button and append them to the container
                const buttons = [
                    { id: "makeOffer", text: "Make Offer", onclick: `makeOffer(${request.buyerid})` },
                    { id: "rejectRequest", text: "Reject Request", onclick: `rejectRequest(${request.buyerid})` },
                    { id: "ignoreRequest", text: "Ignore for Now", onclick: `ignoreRequest(${request.buyerid})` }
                ];

                buttons.forEach(button => {
                    const buttonElement = document.createElement("button");
                    buttonElement.id = button.id;
                    buttonElement.textContent = button.text;
                    buttonElement.style.border = "1px solid black";
                    buttonElement.style.borderRadius = "5px";
                    buttonElement.style.padding = "2px";
                    buttonElement.style.margin = "2px";
                    buttonElement.setAttribute("onclick", button.onclick);
                    buttonContainer.appendChild(buttonElement);
                });

                // Append the container to the detailButtons element
                detailButtons.appendChild(buttonContainer);
            });
        })
        .catch(error => console.error('Error checking user:', error));
}

function makeOffer(buyerid) {
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'block';
}

function populateLevelOfService() {
    const levelOfService = document.getElementById('levelOfService');
    const defaultOption = document.createElement('option');
    levelOfService.innerHTML = '';
    defaultOption.textContent = 'Select a Level of Service';
    defaultOption.value = '';
    levelOfService.appendChild(defaultOption);

    fetch(`/get-levelofservice`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                // if (levelOfServiceDisplay.replace("Service Level: ", "") == item.levelOfService) {
                //     option.selected = true;
                // }
                option.value = item.levelOfService;
                option.textContent = item.levelOfService;
                levelOfService.appendChild(option);
            });
        })
};

function populateOfferTypes() {
    const offerType = document.getElementById('offerType');
    const defaultOption = document.createElement('option');
    offerType.innerHTML = '';
    defaultOption.textContent = 'Select an Offer Type';
    defaultOption.value = '';
    offerType.appendChild(defaultOption);

    fetch(`/get-offertypes`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                // if (offerTypeDisplay.replace("Offer Type: ", "") == item.offerType) {
                //     option.selected = true;
                // }
                option.value = item.offerType;
                option.textContent = item.offerType;
                offerType.appendChild(option);
            });
        })
}

function populateCompensationTypes() {
    const compensationType = document.getElementById('compensationType');
    const defaultOption = document.createElement('option');
    compensationType.innerHTML = '';
    defaultOption.textContent = 'Select a Compensation Type';
    defaultOption.value = '';
    compensationType.appendChild(defaultOption);

    fetch(`/get-compensationtypes`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                // if (compensationTypeDisplay.replace("Compensation Type: ", "") == item.compensationType) {
                //     option.selected = true;
                // }
                option.value = item.compensationType;
                option.textContent = item.compensationType;
                compensationType.appendChild(option);
            });
        })
}

function updateCountdown() {
    const maxLength = 500;
    const currentLength = document.getElementById('offerDesc').value.length;
    const remaining = maxLength - currentLength;
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = `${remaining} characters remaining`;
}

function showHelp() {
    document.getElementById('help-dialog').style.display = 'block';
}

function hideHelp() {
    document.getElementById('help-dialog').style.display = 'none';
}

function cancel() {
    const makeoffercontainer = document.getElementById('offerForm');
    makeoffercontainer.style.display = 'none';
    clearForm()
}

function clearForm() {
    document.getElementById('offerForm').reset();
}

function saveOffer(event) {
    event.preventDefault();
    // Get values from input fields
    const offerType = document.getElementById('offerType').value;
    const levelOfService = document.getElementById('levelOfService').value;
    const compensationType = document.getElementById('compensationType').value;
    const compensationAmount = document.getElementById('compensationAmount').value;
    const retainerFee = document.getElementById('retainerFee').value;
    const lengthOfService = document.getElementById('lengthOfService').value;
    const expirationCompTimeFrame = document.getElementById('expirationCompTimeFrame').value;
    const expirationCompensation = document.getElementById('expirationCompensation').value;
    const offerDesc = document.getElementById('offerDesc').value;
    const radioButtons = document.querySelectorAll('input[name="retainerCredited"]');
    const buyerrequestid = document.getElementById('buyerrequestid').value;
    const buyerid = document.getElementById('buyerid').value;

    // Loop through each radio button in the group
    let retainerCredited = null;
    radioButtons.forEach(radioButton => {
        if (radioButton.checked) {
            // This radio button is selected
            retainerCredited = radioButton.value;
        }
    });
   
    // Create an object with the gathered data
    const offerData = {
        buyerid: buyerid,
        buyerrequestid: buyerrequestid,
        offerType: offerType,
        levelOfService: levelOfService,
        compensationType: compensationType,
        compensationAmount: compensationAmount,
        retainerFee: retainerFee,
        retainerCredited: retainerCredited,
        lengthOfService: lengthOfService,
        expirationCompTimeFrame: expirationCompTimeFrame,
        expirationCompensation: expirationCompensation,
        offerDesc: offerDesc
    };

    // Send the data to your backend for saving it into a database
    fetch('/saveoffer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(offerData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
        const offerForm = document.getElementById('offerForm');
        alert('Offer saved successfully');
        const newRequestDetail = document.getElementById('newRequestDetail');
        const detailButtons = document.getElementById('detailButtons');

        newRequestDetail.innerHTML = '';
        detailButtons.innerHTML = '';
        offerForm.style.display = 'none';
        newRequestDetail.display = 'none';
        detailButtons.display = 'none';
        clearForm();

        getNewRequests();
        // Optionally, perform any actions here after successful submission
    })
    .catch(error => {
        console.error('Error:', error);
        // Optionally, display an error message to the user
    });
}