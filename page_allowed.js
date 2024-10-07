document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const allowed_url = document.getElementById("allowed-url");
    const close_button = document.getElementById("close-button");

    // Get the allowed url
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    
    // Display the allowed url
    allowed_url.innerHTML = url;

    // Close the html page
    close_button.addEventListener("click", function (){
        window.close();
    });
    
});