document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const blocked_url = document.getElementById("blocked-url");
    const close_button = document.getElementById("close-button");

    // Get the blocked url
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    
    // Display the blocked url
    blocked_url.innerHTML = url;

    // Close the html page
    close_button.addEventListener("click", function (){
        window.close();
    });
    
});