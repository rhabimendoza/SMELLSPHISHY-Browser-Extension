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
    var toggle_check = document.getElementById("toggle-check");
    var manual_container = document.getElementById("manual-container");
    var automatic_container = document.getElementById("automatic-container");
    var manual_url = document.getElementById("manual-url");
    var check_button = document.getElementById("check-button");    

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
	function allowURL(inputURL){

		// Get allowed urls
		chrome.storage.local.get("allowedUrls", (result) => {
			var allowedUrls = result.allowedUrls || [];

			// Push the url to list so user can visit it
			allowedUrls.push(inputURL);
			chrome.storage.local.set({ allowedUrls }, () => {});
		});

	}

    // Check classification of url
    async function checkURL(inputURL){

        // Check if url is not empty
        if(!inputURL){
            manual_url.value = "";
            manual_url.placeholder = "Input a url.";
        }
        else{

            // Check if url is already listed
            var inList = await checkList();
            if(inList === 1){
                window.location.href = "pages/page_urls.html";
                return; 
            }

            // Send url to python
            fetch("https://smellsphishy-api.onrender.com/check_url", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({url: inputURL}),
            })
            .then(response => response.json())
            .then(data => {

                // Get data from python
                var resultClass = data.result;             
                var benignProb = data.benign;  
                var phishingProb = data.phishing; 
                var featuresArr = data.features;    
                var featuresString = JSON.stringify(featuresArr); 

                // Identify what to output
                if(resultClass === 3){
                    manual_url.value = "";
                    manual_url.placeholder = "URL is INVALID.";
                }
                else if(resultClass === 1){
                    var messageDisplay = "phishing";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(inputURL)}
                    &benign=${encodeURIComponent(benignProb)}&phishing=${encodeURIComponent(phishingProb)}
                    &features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(messageDisplay)}`;
                }
                else if(resultClass === 2){
                    var messageDisplay = "warning";   
                    window.location.href = `pages/page_classification.html?url=${encodeURIComponent(inputURL)}
                    &benign=${encodeURIComponent(benignProb)}&phishing=${encodeURIComponent(phishingProb)}
                    &features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(messageDisplay)}`;
                }
                else{
                    manual_url.value = "";
                    manual_url.placeholder = "URL is SAFE.";
                    allowURL(inputURL);
                }
    
            });

        }

    }

    // Get list and check if url is already listed
    async function checkList(){
        return new Promise((resolve, reject) => {

            // Get both allowed and blocked urls from storage
            chrome.storage.local.get(["allowedUrls", "blockedUrls"], (result) => {
                var allowedUrls = result.allowedUrls || [];
                var blockedUrls = result.blockedUrls || [];
    
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
        var inputURL = manual_url.value;
        inputURL = inputURL.trim();
        checkURL(inputURL);
    });

    // Update ui
    updateUI();

});