// const { dot } = require("node:test/reporters");
// $(document).ready(function () {
//     $('.favorite-icon').on('click', function(e) {
//         e.preventDefault();
//         e.stopPropagation(); // Prevent the click event from bubbling up to the card
//         var $icon = $(this).find('i');
//         $icon.toggleClass('far fa-heart fas fa-heart favorite');
//         alert('Favorite icon clicked!');
//     });

//     // Handle the click on the card
//     $('.card').on('click', function() {
//         // Your card click handling code here
//         alert('Card clicked!');
//     });

// $('#editButton2').click(function () {
//     $('#propertyForm input').prop('disabled', false).removeClass('view-mode');
//     $('#editButton2').hide();
//     $('#saveButton2').show();
//     $('#cancelButton2').show();
// });

// $('#cancelButton2').click(function () {
//     location.reload();
// });

// $('#saveButton2').click(function () {
//     const formData = {
//         propertyType: $('#propertyType').val(),
//         bedrooms_min: $('#bedrooms_min').val(),
//         bedrooms_max: $('#bedrooms_max').val(),
//         bathrooms_min: $('#bathrooms_min').val(),
//         bathrooms_max: $('#bathrooms_max').val(),
//         squareFootage_min: $('#squareFootage_min').val(),
//         squareFootage_max: $('#squareFootage_max').val(),
//         price_min: $('#price_min').val(),
//         price_max: $('#price_max').val(),
//         timeFrame: $('#timeFrame').val(),
//         prequalifiedY: $('#prequalifiedY').is(':checked'),
//         prequalifiedN: $('#prequalifiedN').is(':checked'),
//         preferredLanguages: $('#preferredLanguages').val(),
//         userid: $('#userid').val(),
//         levelofserviceid: $('#buyerLevelOfService').val()
//     };
//     console.log(levelofserviceid, "Level of Service ID");
//     if (formData.prequalifiedY) {
//         formData.prequalified = 'Yes';
//     } else {
//         formData.prequalified = 'No';
//     }
//     $.ajax({
//         type: 'POST',
//         url: '/profile_b_property',
//         data: formData,
//         success: function (response) {
//             if (response.success) {
//                 alert('Profile updated successfully!');
//                 location.reload();
//             } else {
//                 alert('Error updating profile.');
//             }
//         },
//         error: function () {
//             alert('Error updating profile.');
//         }
//     });
// });
// });
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

// create global variables to store session values
let userid = null;
let paymentSuccessful = null;

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function () {
    fetch('/session-data')
        .then(response => response.json())
        .then(sessionData => {
            userid = sessionData.userid;
            paymentSuccessful = sessionData.paymentSuccessful;

            const toggle1 = document.getElementById('toggle1');
            const toggle2 = document.getElementById('toggle2');
            const moreInfo1 = document.getElementById('more-info1');
            const moreInfo2 = document.getElementById('more-info2');

            toggle1.addEventListener('click', function () {
                if (moreInfo1.style.display === 'none') {
                    moreInfo1.style.display = 'block';
                    toggle1.innerHTML = '<i class="fas fa-chevron-up"></i>&nbsp;Hide&nbsp;<i class="fas fa-chevron-up"></i>';
                } else {
                    moreInfo1.style.display = 'none';
                    toggle1.innerHTML = '<i class="fas fa-chevron-down"></i>&nbsp;Show&nbsp;<i class="fas fa-chevron-down"></i>';
                }
            });
            toggle2.addEventListener('click', function () {
                if (moreInfo2.style.display === 'none') {
                    moreInfo2.style.display = 'block';
                    toggle2.innerHTML = '<i class="fas fa-chevron-up"></i>&nbsp;Hide&nbsp;<i class="fas fa-chevron-up"></i>';
                } else {
                    moreInfo2.style.display = 'none';
                    toggle2.innerHTML = '<i class="fas fa-chevron-down"></i>&nbsp;Show&nbsp;<i class="fas fa-chevron-down"></i>';
                }
            });

            populateSearchInfoDisplay();
            getOfferCounts();
            getOffers('AllAvailable', null);
            getBuyerTypes();
            populateStates();
            populateDisplayZipCodes();
            populateLevelOfService();

            // const offerForm = document.getElementById('offerForm');
            // offerForm.style.display = 'none';
            // document.querySelector('#offerDetail').innerHTML = '<c><br><strong> <--- Select a buyer request to view details </strong><br><br></c>';

            // Disable all input fields and select elements
            // const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
            // const selectFields = document.querySelectorAll('#offerFormContainer select');
            // inputFields.forEach(input => input.setAttribute('readonly', 'true'));
            // selectFields.forEach(select => select.setAttribute('disabled', 'true'));
        })
        .catch(error => console.error('Error fetching session data:', error));

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
    // const offerForm = document.getElementById('offerForm');
    const detailCont = document.getElementById('offerDetailContainer');
    detailCont.style.border = '0';
    detailButtons.innerHTML = '';
    offerDetail.innerHTML = '';
    offers.innerHTML = '';
    // offerForm.style.display = 'none';

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
                    div.innerHTML = '<h5>No Unread Offers</h5>';
                }
                if (datatype == "Read") {
                    div.innerHTML = '<h5>No Read Offers</h5>';
                }
                if (datatype == "Favorite") {
                    div.innerHTML = '<h5>No Favorite Offers</h5>';
                }
                if (datatype == "Declined") {
                    div.innerHTML = '<h5>No Declined Offers</h5>';
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
                    <div class="flex-fill offersummary card">
                    <div class="newDot col-md">&#x2022;</div>
                    <a href="#" class="favorite-icon" id="favicon" data-item-id="1" title="Click to favorite this offer">
                    <i class="far fa-heart"></i></a>
                    <a href="#" class="decline-icon" id="declineicon" data-item-id="2" title="Click to decline this offer">
                    <i class="far fa-ban"></i></a>
                    ${request.offerText}<br></div>`;
                    div.className = "form-row offers col-md-12";
                    div.id = "agentid" + request.agentid;
                    if (request.buyerStatus == "New") {
                        div.classList.add("new");
                    }
                    if (request.buyerStatus === "Favorite" || request.buyerStatus === "Read" || request.buyerStatus === "Declined") {
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    }
                    offers.appendChild(div);
                    if (!paymentSuccessful) {
                        offerDetail.innerHTML = `<h5>To connect with an agent complete payment</h5>
                        <form action="create-checkout-session" method="POST">
                        <button type="submit" id="checkout-button">Checkout</button>
                      </form>`;
                    }


                    // Add event listener to the favorite icon
                    const favoriteIcon = div.querySelector('.favorite-icon');
                    const heartIcon = favoriteIcon.querySelector('i');
                    const declineIcon = div.querySelector('.decline-icon');
                    const banIcon = declineIcon.querySelector('i');
                    favoriteIcon.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent the click event from bubbling up to the card
                        const isFavorite = heartIcon.classList.toggle('fas');
                        heartIcon.classList.toggle('far', !isFavorite);
                        heartIcon.classList.toggle('favorite', isFavorite);
                        if (isFavorite) {
                            banIcon.classList.remove('fas', 'decline');
                            banIcon.classList.add('far');
                            setStatus(request.agentid, 'Favorite');
                            getOfferCounts();
                        } else {
                            setStatus(request.agentid, 'Read');
                            getOfferCounts();
                        }
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    });
                    // Add event listener to the decline icon
                    declineIcon.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent the click event from bubbling up to the card
                        const isDecline = banIcon.classList.toggle('fas');
                        banIcon.classList.toggle('far', !isDecline);
                        banIcon.classList.toggle('decline', isDecline);
                        if (isDecline) {
                            heartIcon.classList.remove('fas', 'favorite');
                            heartIcon.classList.add('far');
                            setStatus(request.agentid, 'Declined');
                            getOfferCounts();
                        } else {
                            setStatus(request.agentid, 'Read');
                            getOfferCounts();
                        }
                        div.classList.add("read");
                        div.getElementsByClassName("newDot")[0].style.display = "none";
                    });

                    // Set initial favorite state
                    if (request.buyerStatus == "Favorite") {
                        heartIcon.classList.add('fas', 'favorite');
                        heartIcon.classList.remove('far');
                    }

                    // Set initial favorite state
                    if (request.buyerStatus == "Declined") {
                        banIcon.classList.add('fas', 'decline');
                        banIcon.classList.remove('far');
                    }

                    // Add event listener to the card
                    const card = div.querySelector('.offersummary');
                    card.addEventListener('click', function () {
                        // Your card click handling code here
                        if (paymentSuccessful) {
                            selectOffer(request.agentid, request.buyeragentmatchid, this);
                        }
                        else {
                            showModal('Please complete payment to view offers');
                        }
                    });
                });

            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function selectOffer(agentid, buyeragentmatchid, element) {
    const inputFields = document.querySelectorAll('#offerFormContainer input, #offerFormContainer textarea');
    const selectFields = document.querySelectorAll('#offerFormContainer select');
    const offerButton = document.getElementById('offerButton');
    // const offerForm = document.getElementById('offerForm');
    // offerForm.style.display = 'none';
    const datatype = document.getElementById('datatype').value;

    if (selectedAgentId === agentid) return; // If already selected, do nothing
    var selectedAgentId = 'agentid' + agentid;
    const rows = document.querySelectorAll('#offers .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    offerDetail(agentid, buyeragentmatchid);
    if (datatype == "New") {
        const detailButtons = document.getElementById('detailButtons');
        detailButtons.style.display = 'block';
        inputFields.forEach(input => input.removeAttribute('readonly'));
        selectFields.forEach(select => select.removeAttribute('disabled'));
        setStatus(agentid, 'Read');
    }
}

function offerDetail(agentid, buyeragentmatchid) {
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');
    const datatype = document.getElementById('datatype').value;
    const detailCont = document.getElementById('offerDetailContainer');
    document.getElementById('agentid').value = agentid;
    document.getElementById('buyeragentmatchid').value = buyeragentmatchid;
    detailCont.style.border = '0';

    offerDetail.innerHTML = "";
    detailButtons.innerHTML = "";
    fetch(`/getOffers?agentid=${encodeURIComponent(agentid)}&buyeragentmatchid=${encodeURIComponent(buyeragentmatchid)}&datatype=${encodeURIComponent(datatype)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                const div = document.createElement("div");
                div.innerHTML += `<div class="flex-fill offersummary">
                <u>Agent ${request.dispIdentifier} Full Offer Details</u><br>
                Offer Type: <b>${request.offerType}</b><br>
                Level of Service: <b>${request.levelOfService}</b><br>
                Compensation Type: <b>${request.compensationType}</b><br>
                Compensation Amount: <b>${request.compensationAmount}</b><br>
                Agreement Length: <b>${request.lengthOfService}</b><br>
                Retainer Fee: <b>$${request.retainerFee}</b><br>
                Retainer Fee will be Credited: <b>${request.retainerCredited}</b><br>
                Expiration Compensation: <b>${request.expirationCompTimeFrame}</b><br>
                Expiration Compensation Amount: <b>${request.expirationCompensation}</b><br>
                <u>Offer Description</u><br>
                ${request.offerDesc}<br>
                Offer Date: ${request.offerTimestamp}<br>
                </div>
                <div class="form-row" style="border: none">
                <button type="button" id="agentinfo-button" class="agentinfo-button" data-toggle="modal" data-target="#agentInfoModal" onclick="populateAgentInfo(${request.agentid});">
                  Agent Contact Info
                </button>
                </div>`;

                div.className = "form-row container-right";
                div.id = "agentid" + request.agentid;
                offerDetail.appendChild(div);


                detailCont.style.border = '1px solid black';
                detailCont.style.borderBottomLeftRadius = '5px';
                detailCont.style.borderBottomRightRadius = '5px';

                // // Create a container div to hold the buttons
                // const buttonContainer = document.createElement("div");
                // buttonContainer.className = "form-row";
                // buttonContainer.style.border = "none";

                // var buttons = [
                //     { id: "contactagent", text: "Agent Contact Info", onclick: `contactAgent(${request.agentid})` },
                // ];

                // buttons.forEach(button => {
                //     const buttonElement = document.createElement("button");
                //     buttonElement.id = button.id;
                //     buttonElement.textContent = button.text;
                //     buttonElement.style.border = "1px solid black";
                //     buttonElement.style.borderRadius = "5px";
                //     buttonElement.style.padding = "2px";
                //     buttonElement.style.margin = "2px";
                //     buttonElement.className = "modify-button";
                //     buttonElement.setAttribute("onclick", button.onclick);
                //     buttonContainer.appendChild(buttonElement);
                // });

                // // Append the container to the detailButtons element
                // detailButtons.appendChild(buttonContainer);
            });
        })
        .catch(error => console.error('Error checking user:', error));
}

function getOfferCounts() {
    fetch(`/getOfferCounts`)
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                if (request.buyerStatus == 'AllAvailable') {
                    document.getElementById('allavailablefilter').textContent = 'All Available Offers' + request.cnt;
                }
                if (request.buyerStatus == 'New') {
                    document.getElementById('newfilter').textContent = 'Unread Offers' + request.cnt;
                }
                if (request.buyerStatus == 'Favorite') {
                    document.getElementById('favoritefilter').textContent = 'Favorite Offers' + request.cnt;
                }
                if (request.buyerStatus == 'Read') {
                    document.getElementById('readfilter').textContent = 'Read Offers' + request.cnt;
                }
                if (request.buyerStatus == 'Declined') {
                    document.getElementById('declinedfilter').textContent = 'Declined Offers' + request.cnt;
                }
            })
        })
        .catch(error => console.error('Error checking user:', error));
}

function declineOffer() {
    const agentid = document.getElementById('agentid').value;
    const dataType = document.getElementById('datatype').value;
    // const offerForm = document.getElementById('offerForm');
    const offerDetail = document.getElementById('offerDetail');
    const detailButtons = document.getElementById('detailButtons');

    setStatus(agentid, 'Declined');
    showModal('Offer Declined successfully');
    offerDetail.innerHTML = '';
    detailButtons.innerHTML = '';
    // offerForm.style.display = 'none';
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

// function cancel() {
//     const makeoffercontainer = document.getElementById('offerForm');
//     makeoffercontainer.style.display = 'none';
//     clearForm()
// }

// function clearForm() {
//     document.getElementById('offerForm').reset();
// }

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

function savePropertyChanges(event) {
    event.preventDefault()
    const propertyType = document.getElementById('propertyType').value;
    const bedrooms_min = document.getElementById('bedrooms_min').value;
    const bathrooms_min = document.getElementById('bathrooms_min').value;
    const squareFootage_min = document.getElementById('squareFootage_min').value;
    const squareFootage_max = document.getElementById('squareFootage_max').value;
    const price_min = document.getElementById('price_min').value;
    const price_max = document.getElementById('price_max').value;
    const timeFrame = document.getElementById('timeFrame').value;
    const timeframeUnit = document.getElementById('timeframeUnit').value;
    const prequalifiedY = document.getElementById('prequalifiedY').checked;
    const prequalifiedN = document.getElementById('prequalifiedN').checked;
    const prequalifiedAmount = document.getElementById('prequalifiedAmount').value;
    const preferredLanguages = document.getElementById('preferredLanguages').value;
    const levelofserviceid = document.getElementById('buyerLevelOfService').value;
    const userid = document.getElementById('userid').value;
    const buyerTypeCheckbox = document.querySelectorAll('input[name="buyerType"]:checked');
    const buyerTypeArray = Array.from(buyerTypeCheckbox).map(buyerType => buyerType.value);
    const buyerType = buyerTypeArray.join(',');

    if (prequalifiedY) {
        var prequalified = 'Yes';
        // if (prequalifiedAmount === '' || prequalifiedAmount === null || prequalifiedAmount === undefined || prequalifiedAmount === '0') {
        //     // showModal('Please enter a prequalified amount or select No');
        //     document.getElementById('prequalifiedY').focus();
        //     return;
        // }
    } else {
        var prequalified = 'No';
    }
    const data = {
        propertyType: propertyType,
        bedrooms_min: bedrooms_min,
        bathrooms_min: bathrooms_min,
        squareFootage_min: squareFootage_min,
        squareFootage_max: squareFootage_max,
        buyerType: buyerType,
        price_min: price_min,
        price_max: price_max,
        timeFrame: timeFrame + ' ' + timeframeUnit,
        prequalified: prequalified,
        prequalifiedAmount: prequalifiedAmount,
        levelofserviceid: levelofserviceid,
        preferredLanguages: preferredLanguages,
        userid: userid
    };

    // Send the data to the server using fetch
    fetch('/savePropertyChanges', {
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

function populateAgentInfo(agentid) {
    const agentInfo = document.getElementById('agentInfo');
    agentInfo.innerHTML = '';
    console.log('Agentid',agentid);
    fetch(`/getagentinfo?agentid=${encodeURIComponent(agentid)}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                const div = document.createElement("div");
                div.innerHTML = `
                <div class="row col-md-3 agentcontactlabel">Name: </div>
                <div class="row col-md-7 agentcontactdata"> <b>${item.fullName}</b></div>
                <div class="row col-md-3 agentcontactlabel">Phone: </div>
                <div class="row col-md-7 agentcontactdata"> <b>${item.phoneNumber}</b></div>
                <div class="row col-md-3 agentcontactlabel">Email: </div>
                <div  class="row col-md-7 agentcontactdata"> <b>${item.email}</b></div>
                <div class="row col-md-3 agentcontactlabel">Address: </div>
                <div  class="row col-md-7 agentcontactdata"> <b>${item.address}</b></div>
                <div class="row col-md-3 agentcontactlabel"></div>
                <div class="row col-md-7 agentcontactdata"> <b>${item.cityStateZip}</b></div>
                <div class="row col-md-3 agentcontactlabel">License: </div>
                <div class="row col-md-7 agentcontactdata"> <b>${item.licenseNumber} - ${item.licenseState}</b><br></div>
                <div class="row col-md-3 agentcontactlabel">Languages: </div>
                <div  class="row col-md-7 agentcontactdata"> <b>${item.languages}</b></div>
                <div class="row col-md-10 agentcontactlabel"></div>
                <div class="row col-md-10" style="justify-content-center"><i>Agent Biography</i></div>
                <div  class="row col-md-10 agentcontactdata" style="border:1px solid black justify-text-center"> ${item.bio}<br></div>
                </div>`;
                div.className = "form-row container-right";
                agentInfo.appendChild(div);
            });
        })
        .catch(error => console.error('Error checking user:', error));
}

function getBuyerTypes() {
    buyerTypeCheckbox = document.getElementById('buyerTypeCheckbox');
    buyerTypesData = [];

    fetch(`getBuyerTypes`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching buyer types:', data.error);
                return;
            }
            data.buyerTypeResults.forEach(buyerTypeItem => {
                buyerTypesData = buyerTypeItem.buyerType;
            })
            data.buyerTypes.forEach(item => {
                // Create a label element
                const label = document.createElement('label');
                label.htmlFor = item.buyertypeid;
                label.innerHTML = '&nbsp;' + item.buyerType + '&nbsp;';

                // Create a checkbox element
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'buyerType';
                checkbox.value = item.buyertypeid;
                checkbox.id = item.buyertypeid;
                // Check the checkbox if the buyer type is in the buyerTypesData array
                if (buyerTypesData) {
                    checkbox.checked = buyerTypesData.includes(item.buyertypeid);
                }
                // Append the checkbox and label to the div
                buyerTypeCheckbox.appendChild(label);
                buyerTypeCheckbox.appendChild(checkbox);
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

function populateSearchInfoDisplay() {
    const populateSearchInfoDisplay = document.getElementById('searchInfoDisplay');
    fetch(`/populateSearchInfoDisplay`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching search info:', data.error);
                return;
            }
            data.results.forEach(item => {
                populateSearchInfoDisplay.innerHTML = item.searchInfoDisplay;
            });
        })

}

function populateUserZipCodes() {
    populateLevelOfService();
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const userZipCodes = document.getElementById("userZipCodes");
    const stateSelect = document.getElementById("stateSelect");
    const citySelect = document.getElementById("citySelect");
    const countySelect = document.getElementById("countySelect");
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    let htmlCodes = '';
    selectedZipCodesContainer.innerHTML = '';
    availabeZipCodesContainer.innerHTML = '';
    citySelect.innerHTML = '';
    countySelect.innerHTML = '';
    stateSelect.selectedIndex = 0;
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            if (!data.results) {
                const div = document.createElement("div");
                div.className = "userZipCodes justify-content-center";
                div.textContent = 'No zip codes yet';
                if (selectedZipCodesContainer) {
                    selectedZipCodesContainer.appendChild(div);
                }
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.className = "userZipCodes align-items-center";
                    div.textContent = code.zipCode;
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    if (selectedZipCodesContainer) {
                        selectedZipCodesContainer.appendChild(div);
                    }
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function populateDisplayZipCodes() {
    const displayZipCodes = document.getElementById("displayZipCodes");
    let htmlCodes = '';
    displayZipCodes.innerHTML = '';
    fetch(`/get-userzipcodes`)
        .then(response => response.json())
        .then(data => {
            if (!data.results) {
                const div = document.createElement("div");
                div.className = "userZipCodes justify-content-center";
                div.textContent = 'Currently no zip codes yet';
                displayZipCodes.appendChild(div);
                htmlCodes += `<p>Currently no zip codes selected</p>`;
                displayZipCodes.innerHTML = htmlCodes;
            }
            else {
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "userZipCodes align-items-center";
                    if (displayZipCodes) {
                        displayZipCodes.appendChild(div);
                    }
                    htmlCodes += `${code.zipCode} - ${code.city}, ${code.state}<br>`;
                });
            }
            if (displayZipCodes) {
                displayZipCodes.innerHTML = htmlCodes;
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

let zipChanges = 0;
function addZipCode() {
    const zipSelect = document.getElementById("zipSelect");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    zipChanges = 1;
    if (zipSelect.value.length === 5) {
        fetch(`/check-zipcode?stateSelect=${encodeURIComponent(zipSelect.value)}`)
            .then(response => response.json())
            .then(data => {
                if (data.zipCodeResult === 'Valid') {
                    if (selectedZipCodesContainer.textContent === 'No zip codes yet') {
                        selectedZipCodesContainer.innerHTML = '';
                    }
                    const div = document.createElement("div");
                    div.textContent = zipSelect.value;
                    div.className = "zipCodeSelected";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    selectedZipCodesContainer.appendChild(div);
                    zipSelect.value = '';
                }
                else if (data.zipCodeResult === 'Invalid') {
                    alert('Zip code not found');
                    zipSelect.value = '';
                }
                else if (data.zipCodeResult === 'Selected') {
                    alert('Zip code already selected');
                    zipSelect.value = '';
                }
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function saveZipChanges() {
    const selected = document.querySelectorAll(".zipCodeSelected");
    const selected2 = document.querySelectorAll(".userZipCodes");

    // Prepare the array of selected zip codes
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);
    const selectedZipCodes2 = Array.from(selected2).map(node => node.textContent);

    //document.getElementById('saveChanges').disabled = true;
    // Prepare the data to be sent
    const userZipCodes = selectedZipCodes.concat(selectedZipCodes2);
    const data = {
        zipCodes: userZipCodes
    };

    // Send the data to the server using fetch
    fetch('/process-zip-codes', {
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
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    populateDisplayZipCodes();
    selected.forEach(node => {
        const data = {
            zipCode: node.textContent
        };
    });
};

function populateStates() {
    const stateSelect = document.getElementById('stateSelect');

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a State';
    defaultOption.value = '';
    stateSelect.appendChild(defaultOption);

    fetch(`/get-states`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(item => {
                let option = document.createElement('option');
                option.value = item.state;
                option.textContent = item.stateName;
                stateSelect.appendChild(option);
            });
        })
};

function populateCities() {
    const stateSelect = document.getElementById('stateSelect').value;
    const citySelect = document.getElementById('citySelect');

    fetch(`/get-cities?stateSelect=${encodeURIComponent(stateSelect)}`)
        .then(response => response.json())
        .then(data => {
            // Clear existing options in citySelect
            citySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.textContent = 'Select a City';
            defaultOption.value = '';
            citySelect.appendChild(defaultOption);
            data.results.forEach(item => {
                let option = new Option(item.city, item.city);
                citySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error checking user:', error));
};

function populateCitiesCounties() {
    const stateSelect = document.getElementById('stateSelect').value;
    const countymessage = document.getElementById('countymessage');
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    // const countycityContainer = document.getElementById("countyCityContainer");
    if (stateSelect === '') {
        citySelect.disabled = true;
        countySelect.disabled = true;
        availabeZipCodesContainer.innerHTML = '';
        countymessage.style.display = 'none';
        return;
    } else {
        const citySelect = document.getElementById('citySelect');
        citySelect.disabled = false;
        countySelect.disabled = false;
        countymessage.style.display = 'block';

        fetch(`/get-cities?stateSelect=${encodeURIComponent(stateSelect)}`)
            .then(response => response.json())
            .then(data => {
                // Clear existing options in citySelect
                citySelect.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.textContent = 'Select a City';
                defaultOption.value = '';
                citySelect.appendChild(defaultOption);
                data.results.forEach(item => {
                    let option = new Option(item.city, item.city);
                    citySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error checking user:', error));
        fetch(`/get-counties?stateSelect=${encodeURIComponent(stateSelect)}`)
            .then(response => response.json())
            .then(data => {
                // Clear existing options in countySelect
                countySelect.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.textContent = 'Select a County';
                defaultOption.value = '';
                countySelect.appendChild(defaultOption);
                data.results.forEach(item => {
                    let option = new Option(item.county, item.county);
                    countySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function populateCountyZipCodes() {
    const countySelect = document.getElementById('countySelect').value;
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    if (countySelect === '') {
        citySelect.disabled = false;
        availabeZipCodesContainer.innerHTML = '';
        return;
    } else {
        const stateSelect = document.getElementById('stateSelect').value;
        const citySelect = document.getElementById('citySelect');
        citySelect.disabled = true;

        // const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
        fetch(`/get-countyzipcodes?stateSelect=${encodeURIComponent(stateSelect)}&countySelect=${encodeURIComponent(countySelect)}`)
            .then(response => response.json())
            .then(data => {
                availabeZipCodesContainer.innerHTML = '';
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "cityZipCodes zipCodeOption justify-content-center";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    availabeZipCodesContainer.appendChild(div);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};

function populateCityZipCodes() {
    const citySelect = document.getElementById('citySelect').value;
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    if (citySelect === '') {
        countySelect.disabled = false;
        availabeZipCodesContainer.innerHTML = '';
        return;
    } else {
        const stateSelect = document.getElementById('stateSelect').value;
        const countySelect = document.getElementById('countySelect');
        countySelect.disabled = true;
        // const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
        fetch(`/get-zipcodes?stateSelect=${encodeURIComponent(stateSelect)}&citySelect=${encodeURIComponent(citySelect)}`)
            .then(response => response.json())
            .then(data => {
                availabeZipCodesContainer.innerHTML = '';
                data.results.forEach(code => {
                    const div = document.createElement("div");
                    div.textContent = code.zipCode;
                    div.className = "cityZipCodes zipCodeOption justify-content-center";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    availabeZipCodesContainer.appendChild(div);
                });
            })
            .catch(error => console.error('Error checking user:', error));
    }
};
document.getElementById('zipSelect').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        console.log('Enter key pressed');
        event.preventDefault();
        addZipCode();
        // Optionally, trigger form submission if needed
        // submitForm();
    }
});

function createCheckoutSession(event) {
    event.preventDefault();
    const data = {
        userid: userid
    };
    fetch('/create-checkout-session', {
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

function addSelection(event) {
    event.preventDefault();
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    zipChanges = 1;
    if (selectedZipCodesContainer.textContent === 'No zip codes yet') {
        selectedZipCodesContainer.innerHTML = '';
    }
    selected.forEach(node => {
        node.classList.remove("selected");
        const div = document.createElement("div");
        div.textContent = node.textContent;
        div.className = "zipCodeSelected";
        div.onclick = function () {
            this.classList.toggle("selected");
        };
        selectedZipCodesContainer.appendChild(div);
        node.remove();
        //document.getElementById('saveChanges').disabled = false;
    });
};

function removeSelection(event) {
    event.preventDefault();
    const availabeZipCodesContainer = document.getElementById("availabeZipCodesContainer");
    const selectedZipCodesContainer = document.getElementById("selectedZipCodesContainer");
    const selected = document.querySelectorAll(".userZipCodes.selected");
    zipChanges = 1;
    selected.forEach(node => {
        node.classList.remove("selected");
        const div = document.createElement("div");
        div.textContent = node.textContent;
        div.className = "zipCodeOption";
        div.onclick = function () {
            this.classList.toggle("selected");
        };
        availabeZipCodesContainer.appendChild(div);
        node.remove();
        //document.getElementById('saveChanges').disabled = false;
    });
    if (!selectedZipCodesContainer) {
        selectedZipCodesContainer.innerHTML = 'No zip codes yet';
    }

};
