// Setup the extension when updated or installed
chrome.runtime.onInstalled.addListener(() =>{
    applyUrlBlockingRules();
});

// Receive message from javascript files for blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if(message.action === "applyBlockingRules"){
        applyUrlBlockingRules();
        sendResponse({status: "Blocking rules updated"});
    }
});

// Block the urls in the list
function applyUrlBlockingRules(){
    chrome.storage.local.get("blockedUrls", (result) =>{
        const blockedUrls = result.blockedUrls || [];

        const rules = blockedUrls.map((url, index) =>({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { 
                urlFilter: url,
                resourceTypes: ["main_frame"]
            }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from(Array(blockedUrls.length).keys()).map(i => i + 1),
            addRules: rules
        }, () =>{});
    });
}

// Flag urls or allow access
function checkURL(url, tabId) {
    // Trim whitespace from the URL
    url = url.trim();

    // Get the value of the checkbox to determine whether to execute the URL check
    chrome.storage.local.get("isOn", (result) => {
        const isOn = result.isOn;

        if (url) { // Proceed only if the URL is not empty
            // Fetch the blocked and allowed URLs from local storage
            chrome.storage.local.get(["blockedUrls", "allowedUrls"], (result) => {
                const blockedUrls = result.blockedUrls || []; // Get blocked URLs or default to empty array
                const allowedUrls = result.allowedUrls || []; // Get allowed URLs or default to empty array

                // If the URL is in the allowed list, do nothing and return
                if (allowedUrls.includes(url)) {
                    return; 
                }

                // If the URL is not blocked, check it using the external service
                if (!blockedUrls.includes(url) && isOn) { // Only execute if the checkbox is checked
                    fetch("http://localhost:5000/check_url", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ url: url }), // Send the URL to be checked
                    })
                    .then(response => response.json()) // Parse the JSON response
                    .then(data => {
                        // If the result indicates a phishing URL (result === 1)
                        if (data.result === 1) {
                            // Redirect the tab to the phishing warning page
                            chrome.tabs.update(tabId, { url: `auto_phishing_page.html?url=${encodeURIComponent(url)}` });
                        }
                    });
                }
            });
        }
    });
}

// Listen to all navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) =>{
    if(details.frameId === 0){
        const url = details.url;
        checkURL(url, details.tabId);
    }
}, { url: [{ urlMatches: '.*' }] });


