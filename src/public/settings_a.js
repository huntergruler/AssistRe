document.addEventListener("DOMContentLoaded", function () {
    // Get all "tablinks" elements
    var tablinks = document.getElementsByClassName("tablinks");
  
    // Loop through the tablinks and add the onclick event
    for (var i = 0; i < tablinks.length; i++) {
        tabcontent[i].style.display = "none";
    }
  
    // Show the first tab by default
    document.getElementById("defaultOpen").click();
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