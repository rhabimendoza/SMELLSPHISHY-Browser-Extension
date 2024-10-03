document.addEventListener("DOMContentLoaded", function (){

    const received_url = document.getElementById("received-url");
   
    const block_button = document.getElementById("block-button");
    const allowed = document.getElementById("allowed-button");
    const ignore_button = document.getElementById("ignore-button");

    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    
    received_url.innerHTML = url;


    function saveURL(url){
        chrome.storage.local.get("blockedUrls", (result) =>{
            const blockedUrls = result.blockedUrls || [];
    
            if(!blockedUrls.includes(url)){
                blockedUrls.push(url);
                chrome.storage.local.set({ blockedUrls }, () =>{
                    chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () =>{
                        window.location.href = `auto_blocked_page.html?url=${encodeURIComponent(url)}`;
                    });
                });
            }
        });
    }

    // Store URL to allow
    function allowURL(url){
        chrome.storage.local.get("allowedUrls", (result) => {
            const allowedUrls = result.allowedUrls || [];

            if (!allowedUrls.includes(url)) {
                allowedUrls.push(url);
                chrome.storage.local.set({ allowedUrls }, () => {
                    window.location.href = url; 
                });
            }
        });
    }



    block_button.addEventListener("click", function (){
        saveURL(url);
    });

    allowed.addEventListener("click", function () {
        allowURL(url);
    });

    ignore_button.addEventListener("click", function () {
        window.close();
    });
    
});
