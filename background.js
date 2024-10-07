// Block the urls in the list
function applyUrlBlockingRules(){

    // Get all blocked urls
    chrome.storage.local.get("blockedUrls", (result) => {
        const blockedUrls = result.blockedUrls || [];

        // Add new url to the list
        const rules = blockedUrls.map((url, index) => ({
            id: index + 1,
            priority: 1,
            action: {type: "block"},
            condition: { 
                urlFilter: url,
                resourceTypes: ["main_frame"]
            }
        }));

        // Add rule to the storage
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from(Array(blockedUrls.length).keys()).map(i => i + 1),
            addRules: rules
        }, () =>{});

    });

}

// Flag urls or allow access
function checkURL(url, tabId){

    // Trim whitespace from the URL
    url = url.trim();

    // List schemes
    const ignoredSchemes = ['chrome://', 'chrome-extension://', 'chrome-untrusted://', 'devtools://',
        'edge://', 'edge-extension://', 'edge-untrusted://', 'about:', 'file://',
        'view-source:', 'data:', 'blob:', 'filesystem:'];

    // Do not check url if it is in schemes
    if(ignoredSchemes.some(scheme => url.startsWith(scheme))){
        return;
    }

    // Get the value of the checkbox to determine whether to execute url check automatically
    chrome.storage.local.get("isOn", (result) => {
        const isOn = result.isOn;

        // Proceed if checked
        if(isOn && url){ 
            chrome.storage.local.get(["blockedUrls", "allowedUrls"], (result) => {
                
                // Get all urls in blocked and allowed
                const blockedUrls = result.blockedUrls || []; 
                const allowedUrls = result.allowedUrls || []; 

                // Do nothing if url is in allowed
                if(allowedUrls.includes(url)){
                    return; 
                }

                if(!blockedUrls.includes(url)){

                    // Send the url to python for checking
                    fetch("http://localhost:5000/check_url", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({url: url}),
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        // If detected as phishing, go to phishing page
                        if(data.result === 1){
                            chrome.tabs.update(tabId, { url: `page_phishing.html?url=${encodeURIComponent(url)}`});
                        }

                    });
                }
 
            });
            
        }

    });

}

// Setup the extension when updated or installed
chrome.runtime.onInstalled.addListener(() => {
    applyUrlBlockingRules();
});

// Receive message from javascript files for blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "applyBlockingRules"){
        applyUrlBlockingRules();
        sendResponse({status: "Blocking rules updated"});
    }
});

// Listen to all navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if(details.frameId === 0){
        const url = details.url;
        checkURL(url, details.tabId);
    }
}, { url: [{urlMatches: '.*'}]});