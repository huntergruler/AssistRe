// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewRequests();
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
                    Purchase Timline ${request.timeFrame}`;
                    div.addEventListener('click', () => selectItem(request.buyerid));
                    div.className = "form-row";
                    div.id = "buyerid"+request.buyerid;
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
function selectItem(itemId) {
   if (selectedBuyerId === itemId) return; // If already selected, do nothing
    var selectedBuyerId = 'buyerid'+itemId;
    console.log(selectedBuyerId);
    const rows = document.querySelectorAll('#newRequests .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });
    const selectedRow = document.querySelector(selectedBuyerId);
    selectedRow.classList.add('selected');
    selectedBuyerId = itemId;

    const detailColumn = document.getElementById('newRequestDetail');
    detailColumn.innerHTML = "";
    detailColumn.innerHTML = `<p><strong>ID:</strong>${itemId}</p><p><strong>Name:`;
}

function newRequestDetail(buyerid) {
    if (selectedBuyerId === buyerid) {
        return; // If already selected, do nothing
    }
    const rows = document.querySelectorAll('#newRequests .form-row');
    rows.forEach(row => {
        row.classList.remove('selected');
    });

    // Add the 'selected' class to the clicked row
    const selectedRow = document.querySelector(`#newRequests data-id="${buyerid}"`);
    selectedRow.classList.add('selected');

    selectedBuyerId = buyerid;
    const detailColumn = document.getElementById('newRequestDetail');
    detailColumn.innerHTML = "";
    detailColumn.innerHTML = `<p><strong>ID:</strong>${buyerid}</p><p><strong>Name:`;
}
