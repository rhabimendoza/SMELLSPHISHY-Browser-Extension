document.addEventListener("DOMContentLoaded", function (){
  
    // Get components from html
    const page_title = document.getElementById('page-title');
    const received_url = document.getElementById('received-url');
    const page_desc = document.getElementById('page-desc');
    const close_button = document.getElementById('close-button');

    // Get sent url and message
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const message = params.get("message");

    if(message === "blocked"){
        page_title.innerText = "URL Blocked";
        page_desc.innerText = "By putting this URL in your blocked list, SmellsPhishy will stop you from accessing this site.";
    } 
    else if(message === "allowed"){
        page_title.innerText = "URL Allowed";
        page_desc.innerText = "By putting this URL in your allowed list, SmellsPhishy will allow you to proceed to the site without scanning.";
    }

    // Format the url
    const formatted_url = formatUrl(url, 30);

    // Display the sent formatted url
    received_url.innerHTML = formatted_url;

    // Next line url every 30 char
    function formatUrl(url, limit){

        // Make storage variable
        let formatted_url = '';

        // Next line every 30 characters
        for(let i = 0; i < url.length; i += limit){
            formatted_url += url.slice(i, i + limit) + '<br>';
        }

        // Return formatted
        return formatted_url;
    }

    // Close the page
    close_button.addEventListener('click', function (){
        window.close(); 
    });

});