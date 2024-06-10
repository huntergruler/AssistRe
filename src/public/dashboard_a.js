// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewRequests();
    document.querySelector('#newRequestDetail').innerHTML = '<c><br><strong> <--- Select a buyer request to view details </strong><br></c>';
    var time_zone_offset = new Date().getTimezoneOffset(); // in minutes
    var time_zone = Date().time_zone;
    // SELECT DATE_FORMAT(CONVERT_TZ(your_timestamp_column, '+00:00', @user_time_zone), '%m/%d/%Y %h:%i:%s %p') AS formatted_timestamp
    // FROM your_table_name;
});

let selectedBuyerId = null;
function getNewRequests() {
    // fetch(`/getNewRequests?stateSelect=${encodeURIComponent(zipSelect.value)}`)
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
                    // console.log(request);
                    // const input = document.createElement("input");
                    // input.id = "buyerid"+request.buyerid;
                    // input.name = "buyerid";
                    // input.value = request.buyerid;
                    // input.type = "hidden";
                    const div = document.createElement("div");
                    div.innerHTML = `${request.buyerType}<br>
                    $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timeline: ${request.timeFrame}`;
                    div.addEventListener('click', () => selectItem(request.buyerid));
                    div.className = "form-row";
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
function selectItem(buyerid) {
    if (selectedBuyerId === buyerid) return; // If already selected, do nothing
    var selectedBuyerId = 'buyerid' + buyerid;
    console.log(selectedBuyerId);
    const rows = document.querySelectorAll('#newRequests .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    newRequestDetail(buyerid);
}

function newRequestDetail(buyerid) {
    const detailColumn = document.getElementById('newRequestDetail');
    const detailButtons = document.getElementById('detailButtons');
    detailColumn.innerHTML = "";
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
                    buttonElement.setAttribute("onclick", button.onclick);
                    buttonContainer.appendChild(buttonElement);
                });

                // Append the container to the detailButtons element
                detailButtons.appendChild(buttonContainer);
            });
        })
        .catch(error => console.error('Error checking user:', error));
}
//     if (selectedBuyerId === buyerid) {
//         return; // If already selected, do nothing
//     }
//     const rows = document.querySelectorAll('#newRequests .form-row');
//     rows.forEach(row => {
//         row.classList.remove('selected');
//     });

//     // Add the 'selected' class to the clicked row
//     const selectedRow = document.querySelector(`#newRequests data-id="${buyerid}"`);
//     selectedRow.classList.add('selected');

//     selectedBuyerId = buyerid;
//     const detailColumn = document.getElementById('newRequestDetail');
//     detailColumn.innerHTML = "";
//     detailColumn.innerHTML = `<p><strong>ID:</strong>${buyerid}</p><p><strong>Name:`;
// }
