document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const input_url = document.getElementById("input-url");
    const block_button = document.getElementById("block-button");
    const ignore_button = document.getElementById("ignore-button");

    // Get url to check
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");

    // Display the url to check
    input_url.innerHTML = url;

    // Store url for blocking
    function saveURL(url){
        chrome.storage.local.get("blockedUrls", (result) =>{
            const blockedUrls = result.blockedUrls || [];
    
            if(!blockedUrls.includes(url)){
                blockedUrls.push(url);
                chrome.storage.local.set({ blockedUrls }, () =>{
                    chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () =>{
                        window.location.href = `url_blocked_page.html?url=${encodeURIComponent(url)}`;
                    });
                });
            }
        });
    }
    
    // Get input url and save it
    block_button.addEventListener("click", function (){
        saveURL(url);
    });

    // Close the html page
    ignore_button.addEventListener("click", function (){
        window.close();
    });

});