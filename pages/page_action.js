/** 
    Program Title: page_action.js
    Main Purpose: Functionality of page_action.html
    Programmer: Rhabi Mendoza
    Date Written: September 30, 2024
    Date Revised: November 8, 2024

    Purpose:
        a. Display description of user action after blocking, unblocking, allowing, and disallowing a url
    Control:
        a. Event listeners handle user interactions 
 **/

document.addEventListener("DOMContentLoaded", function (){

    // Get components from html
    const PAGE_TITLE = document.getElementById('page-title');
    const RECEIVED_URL = document.getElementById('received-url');
    const PAGE_DESC = document.getElementById('page-desc');
    const CLOSE_BUTTON = document.getElementById('close-button');

    // Get sent url and message
    const PARAMS = new URLSearchParams(window.location.search);
    const URL = PARAMS.get("url");
    const MESSAGE = PARAMS.get("message");

    // Display title and description based on message
    if(MESSAGE === "blocked"){
        PAGE_TITLE.innerText = "URL Blocked";
        PAGE_DESC.innerText = "By putting this URL in your blocked list, SmellsPhishy will stop you from accessing this site.";
    } 
    else if(MESSAGE === "allowed"){
        PAGE_TITLE.innerText = "URL Allowed";
        PAGE_DESC.innerText = "By putting this URL in your allowed list, SmellsPhishy will allow you to proceed to the site without scanning during automatic detection.";
    }
    else if(MESSAGE === "unblock"){
        PAGE_TITLE.innerText = "URL Unblocked";
        PAGE_DESC.innerText = "The URL will now be accessible and when the automatic detection is enabled, it will be scanned again.";
    }
    else if(MESSAGE === "disallow"){
        PAGE_TITLE.innerText = "URL Disallowed";
        PAGE_DESC.innerText = "To access this again during automatic detection, it will have to be added to allowed list again.";
    }

    // Format the url
    const FORMATTED_URL = formatUrl(URL, 30);

    // Display the sent formatted url
    RECEIVED_URL.innerHTML = FORMATTED_URL;

    // Close the page
    CLOSE_BUTTON.addEventListener('click', function (){
        window.close(); 
    });

});