// create global variables to store session values
let userid = null;
let buyerid = null;
let agentid = null;
let paymentSuccessful = null;

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function () {
    fetch('/session-data')
        .then(response => response.json())
        .then(sessionData => {
            userid = sessionData.userid;
            buyerid = sessionData.buyerid;
            agentid = sessionData.agentid;
            paymentSuccessful = sessionData.paymentSuccessful;

            // const toggle1 = document.getElementById('toggle1');
            // const moreInfo1 = document.getElementById('more-info1');
            const toggle2 = document.getElementById('toggle2');
            const moreInfo2 = document.getElementById('more-info2');

            // toggle1.addEventListener('click', function () {
            //     if (moreInfo1.style.display === 'none') {
            //         moreInfo1.style.display = 'block';
            //         toggle1.innerHTML = '<i class="fas fa-chevron-up"></i>&nbsp;Hide&nbsp;<i class="fas fa-chevron-up"></i>';
            //     } else {
            //         moreInfo1.style.display = 'none';
            //         toggle1.innerHTML = '<i class="fas fa-chevron-down"></i>&nbsp;Show&nbsp;<i class="fas fa-chevron-down"></i>';
            //     }
            // });
            toggle2.addEventListener('click', function () {
                if (moreInfo2.style.display === 'none') {
                    moreInfo2.style.display = 'block';
                    toggle2.innerHTML = '<i class="fas fa-chevron-up"></i>&nbsp;Hide&nbsp;<i class="fas fa-chevron-up"></i>';
                } else {
                    moreInfo2.style.display = 'none';
                    toggle2.innerHTML = '<i class="fas fa-chevron-down"></i>&nbsp;Show&nbsp;<i class="fas fa-chevron-down"></i>';
                }
            });

            populateLevelOfService();
            populateOfferTypes();
            populateCompensationTypes();
            populateStates();
            populateDisplayZipCodes();
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
        })
        .catch(error => console.error('Error fetching session data:', error));

});

// const { dot } = require("node:test/reporters");

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
        button.classList.remove('active');
    });

    // Add the 'active' class to the clicked button
    if (element) element.classList.add('active');
    else document.getElementById('tab' + datatype).classList.add('active');

    // Your existing logic for handling requests based on the 'type' parameter

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
                    const input = document.createElement("input");
                    input.id = "buyerrequestid";
                    input.name = "buyerrequestid";
                    input.type = "hidden";
                    input.value = request.buyerrequestid;
                    requests.appendChild(input);
                    const div = document.createElement("div");
                    if (request.agentStatus == "New") {
                        div.innerHTML = ``
                    }
                    div.innerHTML += `<div class="newDot">&#x2022;</div><div class="flex-fill">
                    Buyer: ${request.dispIdentifier}<br>
                    ${request.buyerType}<br>
                    $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timeline: ${request.timeFrame}<br></div>`;
                    div.addEventListener('click', () => selectRequest(request.buyerid, request.buyerrequestid, this));
                    div.className = "form-row container-left col-md-12 align-self-end d-flex flex-row";
                    div.id = "buyerid" + request.buyerid;
                    if (request.agentStatus == "New") {
                        div.classList.add("new");
                    }
                    if (request.agentStatus == "Read") {
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    if (request.agentStatus == "Offered" || request.agentStatus == "Confirmed" || request.agentStatus == "Declined" || request.agentStatus == "Rejected") {
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
        buttonElement.setAttribute("onclick", `modifyOffer(event, ${buyerrequestid})`);
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
    if (datatype == "Declined") {
        const detailButtons = document.getElementById('detailButtons');
        detailButtons.style.display = 'block';
    }
}

function requestDetail(buyerid, buyerrequestid) {
    const detailColumn = document.getElementById('requestDetail');
    const detailButtons = document.getElementById('detailButtons');
    const datatype = document.getElementById('datatype').value;
    const detailCont = document.getElementById('requestDetailContainer');
    document.getElementById('buyerid').value = buyerid;
    detailCont.style.border = '0';

    const detailsCont = document.getElementById('requestDetails');
    detailsCont.style.border = '0';

    detailColumn.innerHTML = "";
    detailButtons.innerHTML = "";
    // detailColumn.innerHTML = `<p><strong>ID:</strong>${buyerid}</p><p><strong>Name:`;
    fetch(`/getRequests?buyerid=${encodeURIComponent(buyerid)} &datatype=${encodeURIComponent(datatype)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                console.log(request);
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
                console.log(datatype);
                if (datatype == "Read" || datatype == "New") {
                    var buttons = [
                        { id: "makeOffer", text: "Make Offer", onclick: `makeOffer(${request.buyerid},${request.buyerrequestid})` },
                        { id: "declinerequest", text: "Decline Request", onclick: `declineRequest(${request.buyerid})` },
                    ];
                }
                if (datatype == "Confirmed") {
                    var buttons = [
                        { id: "declinerequest", text: "Cancel Offer", onclick: `cancelOffer(${request.buyerid})` },
                    ];
                }
                if (datatype == "Declined") {
                    var buttons = [
                        { id: "declinerequest", text: "Reopen Request", onclick: `reopenRequest(${request.buyerid})` },
                    ];
                }
                if (datatype == "Read" || datatype == "New" || datatype == "Confirmed" || datatype == "Declined") {

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
                        detailButtons.appendChild(buttonContainer);
                    });
                }

            });
        })
        .catch(error => console.error('Error checking user:', error));
}

function makeOffer(buyerid, buyerrequestid) {
    populateOfferDefaults();
    const offerForm = document.getElementById('offerForm');
    const offerButton = document.getElementById('offerButton');
    offerButton.innerHTML = '';
    offerForm.style.display = 'block';
    console.log(buyerid, buyerrequestid);

    const detailsCont = document.getElementById('requestDetails');
    detailsCont.style.border = '1px solid black';

    const buttonElement = document.createElement("button");
    buttonElement.textContent = 'Submit Offer';
    buttonElement.style.border = "1px solid black";
    buttonElement.style.borderRadius = "5px";
    buttonElement.style.padding = "2px";
    buttonElement.style.margin = "2px";
    buttonElement.setAttribute("onclick", `saveOffer(event,'insert',${buyerrequestid})`);
    offerButton.appendChild(buttonElement);
}

function modifyOffer(event, buyerrequestid) {
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
    buttonElement.setAttribute("onclick", `saveOffer(event,'Update',${buyerrequestid})`);
    offerButton.appendChild(buttonElement);

}

function getRequestCounts() {
    fetch(`/getRequestCounts`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                if (request.agentStatus == 'New') {
                    document.getElementById('tabNew').textContent = 'Open Requests' + request.cnt;
                }
                if (request.agentStatus == 'Offered') {
                    document.getElementById('tabOffered').textContent = request.agentStatus + request.cnt;
                }
                if (request.agentStatus == 'Confirmed') {
                    document.getElementById('tabConfirmed').textContent = request.agentStatus + request.cnt;
                }
                if (request.agentStatus == 'Declined') {
                    document.getElementById('tabDeclined').textContent = request.agentStatus + request.cnt;
                }
                if (request.agentStatus == 'Rejected') {
                    document.getElementById('tabRejected').textContent = request.agentStatus + request.cnt;
                }
            })
        })
        .catch(error => console.error('Error checking user:', error));
}

function removeOffer() {
    const buyerid = document.getElementById('buyerid').value;
    const dataType = document.getElementById('datatype').value;
    const offerForm = document.getElementById('offerForm');
    const requestDetail = document.getElementById('requestDetail');
    const detailButtons = document.getElementById('detailButtons');

    setStatus(buyerid, 'Declined');
    showModal('Offer removed successfully');
    requestDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    offerForm.style.display = 'none';
    getRequests(dataType, null);
    getRequestCounts();
    clearForm()
}

function declineRequest() {
    const buyerid = document.getElementById('buyerid').value;
    const dataType = document.getElementById('datatype').value;
    const offerForm = document.getElementById('offerForm');
    const requestDetail = document.getElementById('requestDetail');
    const detailButtons = document.getElementById('detailButtons');

    setStatus(buyerid, 'Declined');
    showModal('Request Declined successfully');
    requestDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    offerForm.style.display = 'none';
    getRequests(dataType, null);
    getRequestCounts();
    clearForm()
}

function reopenRequest() {
    const buyerid = document.getElementById('buyerid').value;
    const dataType = document.getElementById('datatype').value;
    showModal('Request Reopened successfully');
    setStatus(buyerid, 'Read');
    getRequests(dataType, null);
    getRequestCounts();
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
                option.value = item.levelofserviceid;
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
                option.value = item.offertypeid;
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
                option.value = item.compensationtypeid;
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

    if (status == "Read") {
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
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function saveOffer(event, action, buyerrequestid) {
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
        offerDesc: offerDesc,
        action: action
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
            const offerForm = document.getElementById('offerForm');
            showModal('Offer saved successfully');
            const requestDetail = document.getElementById('requestDetail');
            const detailButtons = document.getElementById('detailButtons');

            requestDetail.innerHTML = '';
            detailButtons.innerHTML = '';
            offerForm.style.display = 'none';
            requestDetail.display = 'none';
            detailButtons.display = 'none';
            // clearForm();

            // getRequests(dataType, null);
            // getRequestCounts();
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
            document.getElementById('offerType').value = data.offertypeid;
            document.getElementById('levelOfService').value = data.levelofserviceid;
            document.getElementById('compensationType').value = data.compensationtypeid;
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
            document.getElementById('offerType').value = data.offertypeid;
            document.getElementById('levelOfService').value = data.levelofserviceid;
            document.getElementById('compensationType').value = data.compensationtypeid;
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
