document.addEventListener("DOMContentLoaded", function (){

    // Get components in html
    const received_probility = document.getElementById("received-probability");
    const received_url = document.getElementById("received-url");
    const block_button = document.getElementById("block-button");
    const allow_button = document.getElementById("allow-button");
    const ignore_button = document.getElementById("ignore-button");

    // Get the data sent
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const probability = params.get("probability");

    // Format probability
    const formattedProbability = (parseFloat(probability) * 100).toFixed(2);
    
    // Display the probability and url
    received_probility.innerHTML = "URL is classified as " + formattedProbability + "% phishing";
    received_url.innerHTML = url;

    // Block the url navigated
    function blockURL(){

        // Get blocked urls
        chrome.storage.local.get("blockedUrls", (result) => {
            const blockedUrls = result.blockedUrls || [];
    
            // Push the url to the list and go to blocked page
            if(!blockedUrls.includes(url)){
                blockedUrls.push(url);
                chrome.storage.local.set({ blockedUrls }, () => {
                    chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
                        window.location.href = `page_blocked.html?url=${encodeURIComponent(url)}`;
                    });
                });
            }

        });

    }

    // Store the url to allow user to visit it
    function allowURL(){

        // Get allowed urls
        chrome.storage.local.get("allowedUrls", (result) => {
            const allowedUrls = result.allowedUrls || [];

            // Push the url to list so user can visit it           
            allowedUrls.push(url);
            chrome.storage.local.set({ allowedUrls }, () => {
                window.location.href = `page_allowed.html?url=${encodeURIComponent(url)}`;
            });   

        });

    }

    // Add url to blocked
    block_button.addEventListener("click", function (){
        blockURL();
    });

    // List the url in allowed
    allow_button.addEventListener("click", function (){
        allowURL();
    });

    // Close the page
    ignore_button.addEventListener("click", function (){
        window.close();
    });
    
});