// Initialize the state based on the prequalified value
document.addEventListener('DOMContentLoaded', function () {
    getNewRequests();
});

function getNewRequests() {
    // fetch(`/getNewRequests?stateSelect=${encodeURIComponent(zipSelect.value)}`)
    console.log('getNewRequests');
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
                    Purchase Timeframe ${request.timeFrame}`;
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
