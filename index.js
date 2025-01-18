/** 
    Program Title: index.js
    Main Purpose: Functionality of index.html
    Programmer: Rhabi Mendoza
    Date Written: September 30, 2024
    Date Revised: November 8, 2024

    Purpose:
        a. Display components based on toggled mode
        b. Classify input url
        c. Redirect users to url list
    Data Structures:
        a. allowedUrls - list of allowed urls
        b. blockedUrls - list of blocked urls
        c. data - storage of classification result
    Algorithms:
        a. updateUI - display div depending on mode
        b. allowURL - add url to allowed list
        c. checkURL - classify url using API
        d. checkList - check if url is already labeled
    Control:
        a. Event listeners handle user interactions 
        b. Fetch requests to external API for url classification
 **/

document.addEventListener("DOMContentLoaded", function(){

    // Get all components in html
    const TOGGLE_CHECK = document.getElementById("toggle-check");
    const MANUAL_CONTAINER = document.getElementById("manual-container");
    const AUTOMATIC_CONTAINER = document.getElementById("automatic-container");
    const MANUAL_URL = document.getElementById("manual-url");
    const CHECK_BUTTON = document.getElementById("check-button");    

    // Initialize checkbox state
    if(localStorage.getItem("isOn") === null){
        localStorage.setItem("isOn", "false");
    }

    // Show or hide container depending on checkbox
    function updateUi(){

        // Get state of checkbox
        var is_on = localStorage.getItem("isOn") === "false" ? false : true;

        // Hide components of manual checking if checked
        if(is_on){
            MANUAL_CONTAINER.style.display = "none";
            AUTOMATIC_CONTAINER.style.display = "block";
        } 
        else{
            MANUAL_CONTAINER.style.display = "block";
            AUTOMATIC_CONTAINER.style.display = "none";
        }

        // Store state and clear changes in display
        TOGGLE_CHECK.checked = is_on;
        MANUAL_URL.value = "";
        MANUAL_URL.placeholder = "Enter suspicious URL";

    }

    // Store the url to allow user to visit it
    function allowUrl(url){

        // Get allowed urls
        chrome.storage.local.get("allowedUrls", (result) => {
            const ALLOWED_URLS = result.allowedUrls || [];

            // Push the url to list so user can visit it
            ALLOWED_URLS.push(url);
            chrome.storage.local.set({ allowedUrls: ALLOWED_URLS }, () => {});
        });

    }

    // Check validity and classification of url
    async function checkUrl(){

        // Get url and trim it
        var url = MANUAL_URL.value;
        url = url.trim();

        // Check if url is not empty
        if(!url){
            MANUAL_URL.value = "";
            MANUAL_URL.placeholder = "Input a url.";
        }
        else{

            // Create loading spinner
            const loadingSpinner = document.getElementById("loading-spinner");
            document.getElementById("loading-spinner").style.display = "flex";

            // Check if url is already listed
            const IN_LIST = await checkList();
            if(IN_LIST === 1){
                window.location.href = "pages/page_urls.html";
                return; 
            }

            // Send url to python
            fetch("http://127.0.0.1:5000/check_url", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({url: url}),
            })
            .then(response => response.json())
            .then(data => {

                // Get data from python
                const RESULT = data.result;             
                const BENIGN = data.benign;  
                const PHISHING = data.phishing; 
                const FEATURES = data.features;    
                const FEATURES_STRING = JSON.stringify(FEATURES); 

                // Identify what to output
                if(RESULT === 3){
                    loadingSpinner.style.display = "none";
                    MANUAL_URL.value = "";
                    MANUAL_URL.placeholder = "URL is INVALID.";
                }
                else if(RESULT === 1){
                    const MESSAGE = "phishing";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(BENIGN)}
                    &phishing=${encodeURIComponent(PHISHING)}&features=${encodeURIComponent(FEATURES_STRING)}&message=${encodeURIComponent(MESSAGE)}`;
                }
                else if(RESULT === 2){
                    const MESSAGE = "warning";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(BENIGN)}
                    &phishing=${encodeURIComponent(PHISHING)}&features=${encodeURIComponent(FEATURES_STRING)}&message=${encodeURIComponent(MESSAGE)}`;
                }
                else{
                    loadingSpinner.style.display = "none";
                    MANUAL_URL.value = "";
                    MANUAL_URL.placeholder = "URL is SAFE.";
                    allowUrl(url);
                }

            });

        }

    }

    // Get list and check if url is already listed
    async function checkList(){
        return new Promise((resolve, reject) => {

            // Get both allowed and blocked urls from storage
            chrome.storage.local.get(["allowedUrls", "blockedUrls"], (result) => {
                const ALLOWED_URLS = result.allowedUrls || [];
                const BLOCKED_URLS = result.blockedUrls || [];
    
                // Check if the url is in either list
                if(ALLOWED_URLS.includes(MANUAL_URL.value) || BLOCKED_URLS.includes(MANUAL_URL.value)){
                    resolve(1);
                }
                else{
                    resolve(0);
                }
            });

        });
    }
    
    // Get the state of checkbox and update ui
    TOGGLE_CHECK.addEventListener("change", function (){
        var is_on = TOGGLE_CHECK.checked;
        localStorage.setItem("isOn", is_on.toString());
        chrome.storage.local.set({isOn: is_on});
        updateUi();
    });

    // Check the input url 
    CHECK_BUTTON.addEventListener("click", function (){
        checkUrl();
    });

    // Update ui
    updateUi();

});