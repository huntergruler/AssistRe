// Open the default active tab when the page loads
document.getElementById("defaultOpen").click();

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