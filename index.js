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
    const toggle_check = document.getElementById("toggle-check");
    const manual_container = document.getElementById("manual-container");
    const automatic_container = document.getElementById("automatic-container");
    const manual_url = document.getElementById("manual-url");
    const check_button = document.getElementById("check-button");    

    // Initialize checkbox state
    if(localStorage.getItem("isOn") === null){
        localStorage.setItem("isOn", "false");
    }

    // Show or hide container depending on checkbox
    function updateUI(){

        // Get state of checkbox
        var isOn = localStorage.getItem("isOn") === "false" ? false : true;

        // Hide components of manual checking if checked
        if(isOn){
            manual_container.style.display = "none";
            automatic_container.style.display = "block";
        } 
        else{
            manual_container.style.display = "block";
            automatic_container.style.display = "none";
        }

        // Store state and clear changes in display
        toggle_check.checked = isOn;
        manual_url.value = "";
        manual_url.placeholder = "Enter suspicious URL";

    }

    // Store the url to allow user to visit it
	function allowURL(url){

		// Get allowed urls
		chrome.storage.local.get("allowedUrls", (result) => {
			const allowedUrls = result.allowedUrls || [];

			// Push the url to list so user can visit it
			allowedUrls.push(url);
			chrome.storage.local.set({ allowedUrls }, () => {});
		});

	}

    // Check validity and classification of url
    async function checkURL(){

        // Get url and trim it
        var url = manual_url.value;
        url = url.trim();

        // Check if url is not empty
        if(!url){
            manual_url.value = "";
            manual_url.placeholder = "Input a url.";
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
                const featuresString = JSON.stringify(features); 

                // Identify what to output
                if(result === 3){
                    manual_url.value = "";
                    manual_url.placeholder = "URL is INVALID.";
                }
                else if(result === 1){
                    const message = "phishing";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}&features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(message)}`;
                }
                else if(result === 2){
                    const message = "warning";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}&features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(message)}`;
                }
                else{
                    manual_url.value = "";
                    manual_url.placeholder = "URL is SAFE.";
                    allowURL(url);
                }
    
            });

        }

    }

    // Get list and check if url is already listed
    async function checkList(){
        return new Promise((resolve, reject) => {

            // Get both allowed and blocked urls from storage
            chrome.storage.local.get(["allowedUrls", "blockedUrls"], (result) => {
                const allowedUrls = result.allowedUrls || [];
                const blockedUrls = result.blockedUrls || [];
    
                // Check if the url is in either list
                if(allowedUrls.includes(manual_url.value) || blockedUrls.includes(manual_url.value)){
                    resolve(1);
                }
                else{
                    resolve(0);
                }
            });

        });
    }
    
    // Get the state of checkbox and update ui
    toggle_check.addEventListener("change", function (){
        var isOn = toggle_check.checked;
        localStorage.setItem("isOn", isOn.toString());
        chrome.storage.local.set({isOn: isOn});
        updateUI();
    });

    // Check the input url 
    check_button.addEventListener("click", function (){
        checkURL();
    });

    // Update ui
    updateUI();

});