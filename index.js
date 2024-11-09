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
        a. allowed_urls - list of allowed urls
        b. blocked_urls - list of blocked urls
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
    function updateUI(){

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
    function allowURL(url){

        // Get allowed urls
        chrome.storage.local.get("allowed_urls", (result) => {
            const allowed_urls = result.allowed_urls || [];

            // Push the url to list so user can visit it
            allowed_urls.push(url);
            chrome.storage.local.set({ allowed_urls }, () => {});
        });

    }

    // Check validity and classification of url
    async function checkURL(){

        // Get url and trim it
        var url = MANUAL_URL.value;
        url = url.trim();

        // Check if url is not empty
        if(!url){
            MANUAL_URL.value = "";
            MANUAL_URL.placeholder = "Input a url.";
        }
        else{

            // Check if url is already listed
            const in_list = await checkList();
            if(in_list === 1){
                window.location.href = "pages/page_urls.html";
                return; 
            }

            // Send url to python
            fetch("https://smellsphishy-api.onrender.com/check_url", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({url: url}),
            })
            .then(response => response.json())
            .then(data => {

                // Get data from python
                const result = data.result;             
                const benign = data.benign;  
                const phishing = data.phishing; 
                const features = data.features;    
                const features_string = JSON.stringify(features); 

                // Identify what to output
                if(result === 3){
                    MANUAL_URL.value = "";
                    MANUAL_URL.placeholder = "URL is INVALID.";
                }
                else if(result === 1){
                    const message = "phishing";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}
                    &benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}
                    &features=${encodeURIComponent(features_string)}&message=${encodeURIComponent(message)}`;
                }
                else if(result === 2){
                    const message = "warning";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}
                    &benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}
                    &features=${encodeURIComponent(features_string)}&message=${encodeURIComponent(message)}`;
                }
                else{
                    MANUAL_URL.value = "";
                    MANUAL_URL.placeholder = "URL is SAFE.";
                    allowURL(url);
                }
    
            });

        }

    }

    // Get list and check if url is already listed
    async function checkList(){
        return new Promise((resolve, reject) => {

            // Get both allowed and blocked urls from storage
            chrome.storage.local.get(["allowed_urls", "blocked_urls"], (result) => {
                const allowed_urls = result.allowed_urls || [];
                const blocked_urls = result.blocked_urls || [];
    
                // Check if the url is in either list
                if(allowed_urls.includes(MANUAL_URL.value) || blocked_urls.includes(MANUAL_URL.value)){
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
        updateUI();
    });

    // Check the input url 
    CHECK_BUTTON.addEventListener("click", function (){
        checkURL();
    });

    // Update ui
    updateUI();

});