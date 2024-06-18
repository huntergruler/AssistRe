// const { dot } = require("node:test/reporters");
$(document).ready(function () {
    $('#editButton2').click(function () {
        $('#propertyForm input').prop('disabled', false).removeClass('view-mode');
        $('#editButton2').hide();
        $('#saveButton2').show();
        $('#cancelButton2').show();
    });

    $('#cancelButton2').click(function () {
        location.reload();
    });

    $('#saveButton2').click(function () {
        const formData = {
            propertyType: $('#propertyType').val(),
            bedrooms_min: $('#bedrooms_min').val(),
            bedrooms_max: $('#bedrooms_max').val(),
            bathrooms_min: $('#bathrooms_min').val(),
            bathrooms_max: $('#bathrooms_max').val(),
            squareFootage_min: $('#squareFootage_min').val(),
            squareFootage_max: $('#squareFootage_max').val(),
            price_min: $('#price_min').val(),
            price_max: $('#price_max').val(),
            timeFrame: $('#timeFrame').val(),
            prequalifiedY: $('#prequalifiedY').is(':checked'),
            prequalifiedN: $('#prequalifiedN').is(':checked'),
            preferredLanguages: $('#preferredLanguages').val(),
            userid: $('#userid').val(),
            levelofserviceid: $('#buyerLevelOfService').val()
        };
        console.log(levelofserviceid, "Level of Service ID");
        if (formData.prequalifiedY) {
            formData.prequalified = 'Y';
        } else {
            formData.prequalified = 'N';
        }
        $.ajax({
            type: 'POST',
            url: '/profile_b_property',
            data: formData,
            success: function (response) {
                if (response.success) {
                    alert('Profile updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating profile.');
                }
            },
            error: function () {
                alert('Error updating profile.');
            }
        });
    });
});
var modal = document.getElementById("messageModal");

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
    getBuyerTypes();
    populateLevelOfService();

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
                    div.textContent = 'No Open Offers';
                }
                if (datatype == "Favorite") {
                    div.textContent = 'No Favorite Offers';
                }
                if (datatype == "Declined") {
                    div.textContent = 'No Declined Offers';
                }
                offers.appendChild(div);
            }
            else {
                data.forEach(request => {
                    const div = document.createElement("div");
                    if (request.buyerStatus == "New") {
                        div.innerHTML = ``
                    }
                    console.log('Offer summary', request.buyerStatus);
                    div.innerHTML += `
                    <div class="flex-fill offerSummary">
                    <div class="newDot col-md-12">&#x2022;</div>
                    ${request.offerText}<br></div>`;
                    div.addEventListener('click', () => selectOffer(request.agentid, request.buyerrequestid, this));
                    div.className = "form-row offers col-md-12";
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
    // if (datatype == "Offered") {
    //     populateOfferDetail(agentid);
    //     const offerForm = document.getElementById('offerForm');
    //     const detailButtons = document.getElementById('detailButtons');
    //     const detailsCont = document.getElementById('offerDetails');
    //     detailsCont.style.border = '1px solid black';

    //     offerForm.style.display = 'block';
    //     inputFields.forEach(input => {
    //         input.setAttribute('readonly', 'true');
    //         input.setAttribute('disabled', 'true')
    //     });
    //     selectFields.forEach(select => select.setAttribute('disabled', 'true'));
    //     detailButtons.style.display = 'none';
    //     offerButton.innerHTML = '';

    //     // create a button to modify the offer
    //     var buttonElement = document.createElement("button");
    //     buttonElement.className = "col-md-5";
    //     buttonElement.textContent = 'Modify Offer';
    //     buttonElement.style.border = "1px solid black";
    //     buttonElement.style.borderRadius = "5px";
    //     buttonElement.style.padding = "2px";
    //     buttonElement.style.margin = "2px";
    //     buttonElement.setAttribute("onclick", `modifyOffer(event)`);
    //     offerButton.appendChild(buttonElement);
    //     buttonElement = document.createElement("button");
    //     buttonElement.className = "col-md-5";
    //     buttonElement.textContent = 'Remove Offer';
    //     buttonElement.style.border = "1px solid black";
    //     buttonElement.style.borderRadius = "5px";
    //     buttonElement.style.padding = "2px";
    //     buttonElement.style.margin = "2px";
    //     buttonElement.setAttribute("onclick", `removeOffer(event)`);
    //     offerButton.appendChild(buttonElement);
    // }
    // if (datatype == "Declined") {
    //     const detailButtons = document.getElementById('detailButtons');
    //     detailButtons.style.display = 'block';
    // }
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
                div.innerHTML += `<div class="flex-fill offerSummary">
                Agent: ${request.dispIdentifier}<br>
                ${request.levelOfService} - ${request.compensationType}<br>
                Compensation ${request.compensationAmount}<br>
                Agreement Length: ${request.lengthOfService}<br></div>`;

                div.className = "form-row container-right";
                div.id = "agentid" + request.agentid;
                offerDetail.appendChild(div);


                detailCont.style.border = '1px solid black';
                detailCont.style.borderBottomLeftRadius = '5px';
                detailCont.style.borderBottomRightRadius = '5px';
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

function savePropertyChanges() {
    const propertyType = document.getElementById('propertyType').value;
    const bedrooms_min = document.getElementById('bedrooms_min').value;
    const bathrooms_min = document.getElementById('bathrooms_min').value;
    const squareFootage_min = document.getElementById('squareFootage_min').value;
    const squareFootage_max = document.getElementById('squareFootage_max').value;
    const price_min = document.getElementById('price_min').value;
    const price_max = document.getElementById('price_max').value;
    const timeFrame = document.getElementById('timeFrame').value;
    const prequalifiedY = document.getElementById('prequalifiedY').checked;
    const prequalifiedN = document.getElementById('prequalifiedN').checked;
    const preferredLanguages = document.getElementById('preferredLanguages').value;
    const levelofserviceid = document.getElementById('levelofserviceid').value;
    const userid = document.getElementById('userid').value;

    console.log("levelofserviceid", levelofserviceid);  

    if (prequalifiedY) {
        var prequalified = 'Y';
    } else {
        var prequalified = 'N';
    }
    const data = {
        propertyType: propertyType,
        bedrooms_min: bedrooms_min,
        bathrooms_min: bathrooms_min,
        squareFootage_min: squareFootage_min,
        squareFootage_max: squareFootage_max,
        price_min: price_min,
        price_max: price_max,
        timeFrame: timeFrame,
        prequalified: prequalified,
        levelOfService: levelOfService,
        preferredLanguages: preferredLanguages,
        userid: userid
    };

    // Send the data to the server using fetch
    fetch('/profile_b_property', {
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
            window.location.reload();
        })
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function getBuyerTypes() {
    buyerTypeCheckbox = document.getElementById('buyerTypeCheckbox');
    fetch(`getBuyerTypes`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                // Create a div element for Bootstrap grid
                // const div = document.createElement('div');
                // div.className = 'col-sm-6 buyertype'; // Adjust the column size as needed

                // Create a label element
                const label = document.createElement('label');
                label.htmlFor = item.buyertypeid;
                label.innerHTML = '&nbsp;' + item.buyerType + '&nbsp;';
                // label.style.marginRight = '10px';

                // Create a checkbox element
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'buyerType';
                checkbox.value = item.buyertypeid;
                checkbox.id = item.buyertypeid;
                // checkbox.style.marginRight = '5px';

                // Append the checkbox and label to the div
                buyerTypeCheckbox.appendChild(label);
                buyerTypeCheckbox.appendChild(checkbox);

                // Append the div to the row container
                // buyerTypeCheckbox.appendChild(div);
            });
        })
}

function populateLevelOfService() {
    const buyerLevelOfService = document.getElementById('buyerLevelOfService');
    const levelofservicevalue = document.getElementById('levelofserviceid').value;

    if (!levelofservicevalue) {
        const defaultOption = document.createElement('option');
        buyerLevelOfService.innerHTML = '';
        defaultOption.textContent = 'Select a Level of Service';
        defaultOption.value = '';
        buyerLevelOfService.appendChild(defaultOption);
    }

    fetch(`/get-levelofservice`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                option.value = item.levelofserviceid;
                option.textContent = item.levelOfService;
                option.selected = item.levelofserviceid == levelofservicevalue;
                buyerLevelOfService.appendChild(option);
            });
        })
};
