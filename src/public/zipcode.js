document.addEventListener("DOMContentLoaded", function() {
    const zipCodes = ["10001", "10002", "10003", "10004"]; // Add more zip codes as needed
    const container = document.getElementById("zipCodeContainer");
  
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
  
  function getSelectedZipCodes() {
    const selected = document.querySelectorAll(".zipCodeOption.selected");
    const selectedZipCodes = Array.from(selected).map(node => node.textContent);
    console.log(selectedZipCodes); // Output to console or handle as needed
  }
  
  // Call getSelectedZipCodes() when needed, e.g., on form submission.
  