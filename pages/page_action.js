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
    var page_title = document.getElementById('page-title');
    var received_url = document.getElementById('received-url');
    var page_desc = document.getElementById('page-desc');
    var close_button = document.getElementById('close-button');

    // Get sent url and message
    var link_param = new URLSearchParams(window.location.search);
    var link_url = link_param.get("url");
    var link_message = link_param.get("message");

    // Display title and description based on message
    if(link_message === "blocked"){
        page_title.innerText = "URL Blocked";
        page_desc.innerText = "By putting this URL in your blocked list, SmellsPhishy will stop you from accessing this site.";
    } 
    else if(link_message === "allowed"){
        page_title.innerText = "URL Allowed";
        page_desc.innerText = "By putting this URL in your allowed list, SmellsPhishy will allow you to proceed to the site without scanning during automatic detection.";
    }
    else if(link_message === "unblock"){
        page_title.innerText = "URL Unblocked";
        page_desc.innerText = "The URL will now be accessible and when the automatic detection is enabled, it will be scanned again.";
    }
    else{
        page_title.innerText = "URL Disallowed";
        page_desc.innerText = "To access this again during automatic detection, it will have to be added to allowed list again.";
    }

    // Format the url
    var formatted_url = formatURL(link_url, 30);

    // Display the sent formatted url
    received_url.innerHTML = formatted_url;

    // Close the page
    close_button.addEventListener('click', function (){
        window.close(); 
    });

});