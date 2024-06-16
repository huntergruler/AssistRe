document.addEventListener('DOMContentLoaded', function () {
    // document.getElementById("defaultOpen").click();
    populateLevelOfService();
    populateOfferTypes();
    populateCompensationTypes();
    populateOfferDefaults();
    // Open the default active tab when the page loads
});


function openTab(evt, tabName) {
    // Hide all tab content elements
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove "active" class from all tab buttons
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";

    // Add "active" class to the clicked tab button
    evt.currentTarget.classList.add("active");
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
            document.getElementById('levelOfService').value = data.levelofserviceid;
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

function saveOfferDefaults(event) {
    event.preventDefault();
    console.log('Saving offer defaults');
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
    // Get values from input fields
    let retainerCredited = null;
    radioButtons.forEach(radioButton => {
        if (radioButton.checked) {
            // This radio button is selected
            retainerCredited = radioButton.value;
        }
    });
    // Create an object with the gathered data
    const offerData = {
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
    console.log(offerData);
    // Send the data to your backend for saving it into a database
    fetch('/save-OfferDefaults', {
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
            alert('Offer defaults saved successfully');
            // Optionally, perform any actions here after successful submission
        })
        .catch(error => {
            console.error('Error:', error);
            // Optionally, display an error message to the user
        });

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
    clearForm()
}

function clearForm() {
    document.getElementById('offerForm').reset();
}

