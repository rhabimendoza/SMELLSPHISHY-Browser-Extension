document.addEventListener("DOMContentLoaded", function (){
  
    // Get components from html
    const received_url = document.getElementById('received-url');
    const close_button = document.getElementById('close-button');

    // Get sent url
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");

    // Display the sent url
    received_url.textContent = url;

    // Close page
    close_button.addEventListener('click', function (){
        window.close(); 
    });

});