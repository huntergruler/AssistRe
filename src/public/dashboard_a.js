const { dot } = require("node:test/reporters");

// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    populateLevelOfService();
    populateOfferTypes();
    populateCompensationTypes();
    getRequestCounts();    
    // getRequests()
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'none';
    document.querySelector('#requestDetail').innerHTML = '<c><br><strong> <--- Select a buyer request to view details </strong><br><br></c>';

    // Disable all input fields and select elements
    const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
    const selectFields = document.querySelectorAll('#offerFormContainer select');
    inputFields.forEach(input => input.setAttribute('readonly', 'true'));
    selectFields.forEach(select => select.setAttribute('disabled', 'true'));

    // var time_zone_offset = new Date().getTimezoneOffset(); // in minutes
    // var time_zone = Date().time_zone;
    // SELECT DATE_FORMAT(CONVERT_TZ(your_timestamp_column, '+00:00', @user_time_zone), '%m/%d/%Y %h:%i:%s %p') AS formatted_timestamp
    // FROM your_table_name;
});

let selectedBuyerId = null;
function getRequests(datatype, element) {
    const requests = document.getElementById('requests');
    const requestDetail = document.getElementById('requestDetail');
    const detailButtons = document.getElementById('detailButtons');
    const offerForm = document.getElementById('offerForm');

    const detailCont = document.getElementById('requestDetailContainer');
    detailCont.style.border = '0';
    const detailsCont = document.getElementById('requestDetails');
    detailsCont.style.border = '0';

    const buttons = document.querySelectorAll('.tablinks');
    buttons.forEach(button => {
        button.setAttribute('id', '');
    });
    if (element) 
        element.setAttribute('id', 'tabSelected');

    detailButtons.innerHTML = '';
    requestDetail.innerHTML = '';
    requests.innerHTML = '';
    offerForm.style.display = 'none';

    // requestDetail.style.display = 'none';
    // detailButtons.style.display = 'none';

    document.getElementById('datatype').value = datatype;
    const getRequests = document.getElementById('getRequests');
    getRequests.style.display = 'block';
    requests.innerHTML = '';
    fetch(`/getRequests?datatype=${datatype}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                const div = document.createElement("div");
                if (datatype == "New") {
                    div.textContent = 'No new requests';
                }
                if (datatype == "Read") {
                    div.textContent = 'No read requests';
                }
                if (datatype == "Offered") {
                    div.textContent = 'No offered requests';
                }
                requests.appendChild(div);
            }
            else {
                data.forEach(request => {
                    const div = document.createElement("div");
                    if(request.matchStatus == "New") {
                        div.innerHTML = ``
                    }
                    div.innerHTML += `<div class="newDot">&#x2022;</div><div class="flex-fill">${request.buyerType}<br>
                    $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timeline: ${request.timeFrame}<br></div>`;
                    div.addEventListener('click', () => selectRequest(request.buyerid, request.buyerrequestid, this));
                    div.className = "form-row container-left col-md-9 align-self-end d-flex flex-row";
                    div.id = "buyerid" + request.buyerid;
                    if (request.matchStatus == "New") {
                        div.classList.add("new");
                    }
                    if (request.matchStatus == "Read") {
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    if(request.matchStatus == "Offered") {
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    // requests.appendChild(input);
                    requests.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function selectRequest(buyerid, buyerrequestid, element) {
    const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
    const selectFields = document.querySelectorAll('#offerFormContainer select');
    const offerButton = document.getElementById('offerButton');
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'none';
    const datatype = document.getElementById('datatype').value;

    if (selectedBuyerId === buyerid) return; // If already selected, do nothing
    var selectedBuyerId = 'buyerid' + buyerid;
    const rows = document.querySelectorAll('#requests .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    requestDetail(buyerid, buyerrequestid);
    console.log('datatype:', datatype);
    if (datatype == "New") {
        const detailButtons = document.getElementById('detailButtons');
        detailButtons.style.display = 'block';
        inputFields.forEach(input => input.removeAttribute('readonly'));
        selectFields.forEach(select => select.removeAttribute('disabled'));
        setStatus(buyerid, 'Read');
    }
    if (datatype == "Offered") {
        populateOfferDetail(buyerid);
        const offerForm = document.getElementById('offerForm');
        const detailButtons = document.getElementById('detailButtons');
        const detailsCont = document.getElementById('requestDetails');
        detailsCont.style.border = '1px solid black';

        offerForm.style.display = 'block';
        inputFields.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.setAttribute('disabled', 'true')
        });
        selectFields.forEach(select => select.setAttribute('disabled', 'true'));
        detailButtons.style.display = 'none';
        offerButton.innerHTML = '';

        // create a button to modify the offer
        var buttonElement = document.createElement("button");
        buttonElement.className = "col-md-5";
        buttonElement.textContent = 'Modify Offer';
        buttonElement.style.border = "1px solid black";
        buttonElement.style.borderRadius = "5px";
        buttonElement.style.padding = "2px";
        buttonElement.style.margin = "2px";
        buttonElement.setAttribute("onclick", `modifyOffer(event)`);
        offerButton.appendChild(buttonElement);
        buttonElement = document.createElement("button");
        buttonElement.className = "col-md-5";
        buttonElement.textContent = 'Remove Offer';
        buttonElement.style.border = "1px solid black";
        buttonElement.style.borderRadius = "5px";
        buttonElement.style.padding = "2px";
        buttonElement.style.margin = "2px";
        buttonElement.setAttribute("onclick", `removeOffer(event)`);
        offerButton.appendChild(buttonElement);
    }
}

function requestDetail(buyerid, buyerrequestid) {
    const detailColumn = document.getElementById('requestDetail');
    const detailButtons = document.getElementById('detailButtons');
    const datatype = document.getElementById('datatype').value;
    const detailCont = document.getElementById('requestDetailContainer');
    document.getElementById('buyerid').value = buyerid;
    document.getElementById('buyerrequestid').value = buyerrequestid;
    detailCont.style.border = '0';

    const detailsCont = document.getElementById('requestDetails');
    detailsCont.style.border = '0';

    detailColumn.innerHTML = "";
    detailButtons.innerHTML = "";
    // detailColumn.innerHTML = `<p><strong>ID:</strong>${buyerid}</p><p><strong>Name:`;
    fetch(`/getRequests?buyerid=${encodeURIComponent(buyerid)} &buyerrequestid=${encodeURIComponent(buyerrequestid)} &datatype=${encodeURIComponent(datatype)}`)
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


                detailCont.style.border = '1px solid black';

                // Create a container div to hold the buttons
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "form-row"; // Apply any additional styling if needed
                buttonContainer.style.border = "none";

                // Create each button and append them to the container
                const buttons = [
                    { id: "makeOffer", text: "Make Offer", onclick: `makeOffer(${request.buyerid})` },
                    { id: "declinerequest", text: "Decline Request", onclick: `declineRequest(${request.buyerid})` },
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
    populateOfferDefaults();
    const offerForm = document.getElementById('offerForm');
    const offerButton = document.getElementById('offerButton');
    offerButton.innerHTML = '';
    offerForm.style.display = 'block';

    const detailsCont = document.getElementById('requestDetails');
    detailsCont.style.border = '1px solid black';

    const buttonElement = document.createElement("button");
    buttonElement.textContent = 'Submit Offer';
    buttonElement.style.border = "1px solid black";
    buttonElement.style.borderRadius = "5px";
    buttonElement.style.padding = "2px";
    buttonElement.style.margin = "2px";
    buttonElement.setAttribute("onclick", `saveOffer(event)`);
    offerButton.appendChild(buttonElement);
}

function modifyOffer(event) {
    event.preventDefault();
    const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
    const selectFields = document.querySelectorAll('#offerFormContainer select');
    const offerButton = document.getElementById('offerButton');
    const dataType = document.getElementById('datatype').value;

    inputFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
    selectFields.forEach(select => select.removeAttribute('disabled'));

    offerButton.innerHTML = '';
    const buttonElement = document.createElement("button");
    buttonElement.textContent = 'Save Changes';
    buttonElement.style.border = "1px solid black";
    buttonElement.style.borderRadius = "5px";
    buttonElement.style.padding = "2px";
    buttonElement.style.margin = "2px";
    buttonElement.setAttribute("onclick", `saveOffer(event)`);
    offerButton.appendChild(buttonElement);

}

function removeOffer() {
    const buyerid = document.getElementById('buyerid').value;
    const dataType = document.getElementById('datatype').value;
    fetch(`/removeOffer?buyerid=${buyerid}`)

        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Offer removed successfully');
                const offerForm = document.getElementById('offerForm');
                const requestDetail = document.getElementById('requestDetail');
                const detailButtons = document.getElementById('detailButtons');

                requestDetail.innerHTML = '';
                detailButtons.innerHTML = '';
                offerForm.style.display = 'none';
                getRequests(dataType);
                clearForm()
            }
        })
        .catch(error => console.error('Error checking user:', error));
}

function getRequestCounts() {
    fetch(`/getRequestCounts`)
        .then(response => response.json())
        .then(data => {
            if (data.length >0 ) {
                if (data.matchStatus == 'New') {
                    document.getElementById('tabNew').textContent += data.cnt;
                }
                if (data.matchStatus == 'Offered') {
                    document.getElementById('tabOffered').textContent += data.cnt;
                }
                if (data.matchStatus == 'Confirmed') {
                    document.getElementById('tabConfirmed').textContent += data.cnt;
                }
                if (data.matchStatus == 'Declined') {
                    document.getElementById('tabDeclined').textContent += data.cnt;
                }
                if (data.matchStatus == 'Rejected') {
                    document.getElementById('tabRejected').textContent += data.cnt;
                }
            }
        })
        .catch(error => console.error('Error checking user:', error));
}

function declineRequest() {
    const buyerid = document.getElementById('buyerid').value;
    const dataType = document.getElementById('datatype').value;
    console.log('dataType:', dataType);
    fetch(`/declineRequest?buyerid=${buyerid}`)

        .then(response => response.json())
        .then(data => {
            console.log('data:', data.success);
            if (data.success) {
                alert('Request Declined successfully');
                const offerForm = document.getElementById('offerForm');
                const requestDetail = document.getElementById('requestDetail');
                const detailButtons = document.getElementById('detailButtons');

                requestDetail.innerHTML = '';
                detailButtons.innerHTML = '';
                offerForm.style.display = 'none';
                getRequests(dataType);
                clearForm()
            }
        })
        .catch(error => console.error('Error checking user:', error));
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

function setStatus(buyerid, status) {
    const data = {
        buyerid: buyerid,
        status: status
    };

    if(status == "Read") {
        const container = document.getElementById(`buyerid${buyerid}`);
        const newDot = container.getElementsByClassName('newDot')[0];
        container.classList.remove('new');
        container.classList.add('read');
        newDot.style.display = 'none';
    }

    fetch('/setStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            console.log('SetStatus Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
    const dataType = document.getElementById('datatype').value;

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
            const requestDetail = document.getElementById('requestDetail');
            const detailButtons = document.getElementById('detailButtons');

            requestDetail.innerHTML = '';
            detailButtons.innerHTML = '';
            offerForm.style.display = 'none';
            requestDetail.display = 'none';
            detailButtons.display = 'none';
            clearForm();
            console.log('dataType:', dataType);

            getRequests(dataType, null);
            // Optionally, perform any actions here after successful submission
        })
        .catch(error => {
            console.error('Error:', error);
            // Optionally, display an error message to the user
        });
}

function populateOfferDefaults() {
    fetch(`/get-offerdefaults`)
        .then(response => response.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                console.log('No offer defaults found.'); // Handle no data case (e.g., display a message)
                return; // Exit the function
            }
            document.getElementById('offerType').value = data.offerType;
            document.getElementById('levelOfService').value = data.levelOfService;
            document.getElementById('compensationType').value = data.compensationType;
            document.getElementById('compensationAmount').value = data.compensationAmount;
            document.getElementById('retainerFee').value = data.retainerFee;
            document.getElementById('lengthOfService').value = data.lengthOfService;
            document.getElementById('expirationCompTimeFrame').value = data.expirationCompTimeFrame;
            document.getElementById('expirationCompensation').value = data.expirationCompensation;
            document.getElementById('offerDesc').value = data.offerDesc;
            const radioButtons = document.querySelectorAll('input[name="retainerCredited"]');
            radioButtons.forEach(radioButton => {
                if (data.retainerCredited === 1) {
                    document.getElementById('retainerCreditedY').checked = true;
                }
                if (data.retainerCredited === 0) {
                    document.getElementById('retainerCreditedN').checked = true;
                }
            });
        })
}

function populateOfferDetail(buyerid) {
    fetch(`/get-offerdetails?buyerid=${buyerid}`)
        .then(response => response.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                console.log('No offer defaults found.'); // Handle no data case (e.g., display a message)
                return; // Exit the function
            }
            document.getElementById('offerType').value = data.offerType;
            document.getElementById('levelOfService').value = data.levelOfService;
            document.getElementById('compensationType').value = data.compensationType;
            document.getElementById('compensationAmount').value = data.compensationAmount;
            document.getElementById('retainerFee').value = data.retainerFee;
            document.getElementById('lengthOfService').value = data.lengthOfService;
            document.getElementById('expirationCompTimeFrame').value = data.expirationCompTimeFrame;
            document.getElementById('expirationCompensation').value = data.expirationCompensation;
            document.getElementById('offerDesc').value = data.offerDesc;
            const radioButtons = document.querySelectorAll('input[name="retainerCredited"]');
            radioButtons.forEach(radioButton => {
                if (data.retainerCredited === 1) {
                    document.getElementById('retainerCreditedY').checked = true;
                }
                if (data.retainerCredited === 0) {
                    document.getElementById('retainerCreditedN').checked = true;
                }
            });
        })
}
