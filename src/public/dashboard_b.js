// const { dot } = require("node:test/reporters");

var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the close button inside the modal
var closeModalButton = document.getElementById("modalCloseButton");

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks the close button inside the modal, close the modal
closeModalButton.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Function to show the modal with a message
function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    modal.style.display = "flex";
}

// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getOfferCounts('New', null);
    // getOfferCounts();
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'none';
    // document.querySelector('#offerDetail').innerHTML = '<c><br><strong> <--- Select a buyer request to view details </strong><br><br></c>';

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

let selectedagentid = null;

function getOffers(datatype, element) {
    const offers = document.getElementById('offers');
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');
    const offerForm = document.getElementById('offerForm');

    const detailCont = document.getElementById('offerDetailContainer');
    detailCont.style.border = '0';
    const detailsCont = document.getElementById('offerDetails');
    detailsCont.style.border = '0';

    const buttons = document.querySelectorAll('.tablinks');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    console.log(datatype);

    // Add the 'active' class to the clicked button
    if (element) element.classList.add('active');
    else document.getElementById('tab' + datatype).classList.add('active');

    // Your existing logic for handling offers based on the 'type' parameter

    detailButtons.innerHTML = '';
    offerDetail.innerHTML = '';
    offers.innerHTML = '';
    offerForm.style.display = 'none';

    // offerDetail.style.display = 'none';
    // detailButtons.style.display = 'none';

    document.getElementById('datatype').value = datatype;
    const getOffers = document.getElementById('getOffers');
    getOffers.style.display = 'block';
    offers.innerHTML = '';
    fetch(`/getOffers?datatype=${datatype}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                const div = document.createElement("div");
                if (datatype == "New") {
                    div.textContent = 'No new offers';
                }
                if (datatype == "Read") {
                    div.textContent = 'No read offers';
                }
                if (datatype == "Offers") {
                    div.textContent = 'No offered offers';
                }
                offers.appendChild(div);
            }
            else {
                data.forEach(request => {
                    const div = document.createElement("div");
                    if (request.buyerStatus == "New") {
                        div.innerHTML = ``
                    }
                    div.innerHTML += `
                    <div class="flex-fill offerSummary">
                    <div class="newDot col-md-12">&#x2022;</div>
                    Agent: ${request.dispIdentifier}<br>
                    ${request.levelOfService} - ${request.compensationType}<br>
                    Compensation ${request.compensationAmount}<br>
                    Agreement Length: ${request.lengthOfService}<br></div>`;
                    div.addEventListener('click', () => selectOffer(request.agentid, request.buyerrequestid, this));
                    div.className = "form-row col-md-12";
                    div.id = "agentid" + request.agentid;
                    console.log(request.buyerStatus);
                    if (request.buyerStatus == "New") {
                        div.classList.add("new");
                    }
                    if (request.buyerStatus == "Read") {
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    if (request.buyerStatus == "Favorite" || request.buyerStatus == "Declined") {
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    // offers.appendChild(input);
                    offers.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function selectOffer(agentid, buyerrequestid, element) {
    const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
    const selectFields = document.querySelectorAll('#offerFormContainer select');
    const offerButton = document.getElementById('offerButton');
    const offerForm = document.getElementById('offerForm');
    offerForm.style.display = 'none';
    const datatype = document.getElementById('datatype').value;

    if (selectedAgentId === agentid) return; // If already selected, do nothing
    var selectedAgentId = 'agentid' + agentid;
    const rows = document.querySelectorAll('#offers .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    offerDetail(agentid, buyerrequestid);
    if (datatype == "New") {
        const detailButtons = document.getElementById('detailButtons');
        detailButtons.style.display = 'block';
        inputFields.forEach(input => input.removeAttribute('readonly'));
        selectFields.forEach(select => select.removeAttribute('disabled'));
        setStatus(agentid, 'Read');
    }
    if (datatype == "Offered") {
        populateOfferDetail(agentid);
        const offerForm = document.getElementById('offerForm');
        const detailButtons = document.getElementById('detailButtons');
        const detailsCont = document.getElementById('offerDetails');
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
    if (datatype == "Declined") {
        const detailButtons = document.getElementById('detailButtons');
        detailButtons.style.display = 'block';
    }
}

function offerDetail(agentid, buyerrequestid) {
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');
    const datatype = document.getElementById('datatype').value;
    const detailCont = document.getElementById('offerDetailContainer');
    document.getElementById('agentid').value = agentid;
    document.getElementById('buyerrequestid').value = buyerrequestid;
    detailCont.style.border = '0';

    const detailsCont = document.getElementById('offerDetails');
    detailsCont.style.border = '0';

    offerDetail.innerHTML = "";
    detailButtons.innerHTML = "";
    fetch(`/getOffers?agentid=${encodeURIComponent(agentid)} &buyerrequestid=${encodeURIComponent(buyerrequestid)} &datatype=${encodeURIComponent(datatype)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                const div = document.createElement("div");
                div.innerHTML += `<div class="flex-fill">
                Agent: ${request.dispIdentifier}<br>
                ${request.levelOfService} - ${request.compensationType}<br>
                Compensation ${request.compensationAmount}<br>
                Agreement Length: ${request.lengthOfService}<br></div>`;

                div.className = "form-row container-right";
                div.id = "agentid" + request.agentid;
                offerDetail.appendChild(div);


                detailCont.style.border = '2px solid black';
                detailCont.style.borderbottomleftradius = '5px';
                detailCont.style.borderbottomrightradius = '5px';
                console.log(request.buyerStatus, datatype); 

                // Create a container div to hold the buttons
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "form-row"; // Apply any additional styling if needed
                buttonContainer.style.border = "none";

                // Create each button and append them to the container
                if (datatype == "Read" || datatype == "New") {
                    var buttons = [
                        { id: "makeFavorite", text: "Make Favorite", onclick: `makeFavorite(${request.agentid})` },
                        { id: "declineOffer", text: "Decline Offer", onclick: `declineOffer(${request.agentid})` },
                    ];
                }
                if (datatype == "Favorite") {
                    var buttons = [
                        { id: "removeFavorite", text: "Remove Favorite", onclick: `removeFavorite(${request.agentid})` },
                        { id: "declineOffer", text: "Decline Offer", onclick: `declineOffer(${request.agentid})` },
                    ];
                }
                if (datatype == "Declined") {
                    var buttons = [
                        { id: "makeFavorite", text: "Make Favorite", onclick: `makeFavorite(${request.agentid})` },
                        { id: "declineOffer", text: "Reopen Offer", onclick: `reopenOffer(${request.agentid})` },
                    ];
                }

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

function makeFavorite(agentid) {
    const dataType = document.getElementById('datatype').value;
    const offerForm = document.getElementById('offerForm');
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');
    setStatus(agentid, 'Favorite');
    showModal('Offer added to favorites');
    offerDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    offerForm.style.display = 'none';
    getOffers(dataType, null);
    getOfferCounts();
    clearForm()


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

function getOfferCounts() {
    fetch(`/getOfferCounts`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                if (request.buyerStatus == 'New') {
                    document.getElementById('tabNew').textContent = 'Open Offers' + request.cnt;
                }
                if (request.buyerStatus == 'Favorite') {
                    document.getElementById('tabFavorite').textContent = 'Favorites' + request.cnt;
                }
                if (request.buyerStatus == 'Declined') {
                    document.getElementById('tabDeclined').textContent = 'Declined' + request.cnt;
                }
            })
        })
        .catch(error => console.error('Error checking user:', error));
}

function removeFavorite(agentid) {
    const dataType = document.getElementById('datatype').value;
    const offerForm = document.getElementById('offerForm');
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');
    setStatus(agentid, 'Read');
    showModal('Offer removed from favorites');
    offerDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    offerForm.style.display = 'none';
    getOffers(dataType, null);
    getOfferCounts();
    clearForm()
}

function declineOffer() {
    const agentid = document.getElementById('agentid').value;
    const dataType = document.getElementById('datatype').value;
    const offerForm = document.getElementById('offerForm');
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');

    setStatus(agentid, 'Declined');
    showModal('Offer Declined successfully');
    offerDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    offerForm.style.display = 'none';
    getOffers(dataType, null);
    getOfferCounts();
    clearForm()
}

function reopenOffer() {
    const agentid = document.getElementById('agentid').value;
    const dataType = document.getElementById('datatype').value;
    showModal('Request Reopened successfully');
    setStatus(agentid, 'Read');
    getOffers(dataType, null);
    getOfferCounts();
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

function setStatus(agentid, status) {
    const data = {
        agentid: agentid,
        status: status
    };

    if (status == "Read") {
        const container = document.getElementById(`agentid${agentid}`);
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
    const agentid = document.getElementById('agentid').value;
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
        agentid: agentid,
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
            const offerForm = document.getElementById('offerForm');
            showModal('Offer saved successfully');
            const offerDetail = document.getElementById('offerDetail');
            const detailButtons = document.getElementById('detailButtons');

            offerDetail.innerHTML = '';
            detailButtons.innerHTML = '';
            offerForm.style.display = 'none';
            offerDetail.display = 'none';
            detailButtons.display = 'none';
            clearForm();

            getOffers(dataType, null);
            getRequestCounts();
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

function populateOfferDetail(agentid) {
    fetch(`/get-offerdetails?agentid=${agentid}`)
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
