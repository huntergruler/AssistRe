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
                    div.textContent = request.buyerType + ' ' + request.price_min + ' ' + request.price_max  + ' ' + request.prequalified + ' ' + request.timeframe;
                    div.className = "form-group";
                    div.onclick = function () {
                        this.classList.toggle("selected");
                    };
                    newRequests.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error checking user:', error));
};
