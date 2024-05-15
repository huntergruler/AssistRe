document.addEventListener("DOMContentLoaded", function() {
    const zipCodes = ["10001", "10002", "10003", "10004"]; // Add more zip codes as needed
    const container = document.getElementById("availabeZipCodesContainer");
  
    zipCodes.forEach(code => {
      const div = document.createElement("div");
      div.textContent = code;
      div.className = "zipCodeOption";
      div.onclick = function() {
        this.classList.toggle("selected");
      };
      container.appendChild(div);
    });
  });
  
 
  
  // Call getSelectedZipCodes() when needed, e.g., on form submission.
  