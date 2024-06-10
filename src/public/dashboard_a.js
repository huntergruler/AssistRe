// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewRequests();
    var time_zone_offset = new Date().getTimezoneOffset(); // in minutes
    var time_zone = Date().time_zone;    
    // SELECT DATE_FORMAT(CONVERT_TZ(your_timestamp_column, '+00:00', @user_time_zone), '%m/%d/%Y %h:%i:%s %p') AS formatted_timestamp
    // FROM your_table_name;
});

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
                    console.log(request);
                    const div = document.createElement("div");
                    div.innerHTML = `${request.buyerType}<br>
                    $${request.price_min} to $${request.price_max}<br>
                    Prequalified? ${request.prequalified}<br>
                    Purchase Timline ${request.timeFrame}`;
                    div.addEventListener('click', () => showDetail(item));
                    div.className = "form-row";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    newRequests.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};

function newRequestDetail(item) {
    const detailColumn = document.getElementById('newRequestDetail');
    detailColumn.innerHTML = `<p><strong>ID:</strong> ${item.id}</p><p><strong>Name:</strong> ${item.name}</p><p><strong>Description:</strong> ${item.description}</p>`;
}
