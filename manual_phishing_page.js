document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const input_url = document.getElementById("input-url");
    const block_button = document.getElementById("block-button");
    const ignore_button = document.getElementById("ignore-button");

    // Get url sent
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");

    // Display the url
    input_url.innerHTML = url;

    // Store url for blocking
    function saveURL(){

        // Add url in blocked list
        chrome.storage.local.get("blockedUrls", (result) => {
            const blockedUrls = result.blockedUrls || [];
    
            // Push the url to the list and go to blocked page
            if(!blockedUrls.includes(url)){
                blockedUrls.push(url);
                chrome.storage.local.set({ blockedUrls }, () => {
                    chrome.runtime.sendMessage({action: "applyBlockingRules"}, () => {
                        window.location.href = `manual_blocked_page.html?url=${encodeURIComponent(url)}`;
                    });
                });
            }

        });

    }
    
    // Get input url and save it
    block_button.addEventListener("click", function (){
        saveURL();
    });

    // Close the html page
    ignore_button.addEventListener("click", function (){
        window.close();
    });

});