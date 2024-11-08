// Block the urls in the list
function applyUrlBlockingRules(){

    // Get all blocked urls
    chrome.storage.local.get("blockedUrls", (result) => {
        var blockedUrls = result.blockedUrls || [];

        // Add new url to the list
        var newRule = blockedUrls.map((url, index) => ({
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
            addRules: newRule
        }, () =>{});
    });

}

// Flag urls or allow access
function checkURL(navUrl, tabId){

    // Trim whitespace from the URL
    navUrl = navUrl.trim();

    // Get the value of the checkbox to determine whether to execute url check automatically
    chrome.storage.local.get("isOn", (result) => {
        var isOn = result.isOn;

        // Proceed if checked
        if(isOn && navUrl){ 
            chrome.storage.local.get(["blockedUrls", "allowedUrls"], (result) => {
                
                // Get all urls in blocked and allowed
                var blockedUrls = result.blockedUrls || []; 
                var allowedUrls = result.allowedUrls || []; 

                // Do nothing if url is in allowed
                if(allowedUrls.includes(navUrl)){
                    return; 
                }
                else if(!blockedUrls.includes(navUrl)){

                    // Show a temporary loading page
                    chrome.tabs.update(tabId, { url: chrome.runtime.getURL("pages/page_loading.html") });

                    // Send the url to python for checking
                    fetch("https://smellsphishy-api.onrender.com/check_url", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({url: navUrl}),
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        // Get output of python
                        var resultClass = data.result;             
                        var benignProb = data.benign;  
                        var phishingProb = data.phishing; 
                        var featuresArr = data.features;    
                        var featuresString = JSON.stringify(featuresArr); 

                        // Check the result
                        if(resultClass === 1){
                            var messageDisplay = "phishing";   
                            chrome.tabs.update(tabId, { url: `pages/page_classification.html?url=${encodeURIComponent(navUrl)}
                            &benign=${encodeURIComponent(benignProb)}&phishing=${encodeURIComponent(phishingProb)}
                            &features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(messageDisplay)}`});
                        }
                        else if(resultClass === 2){
                            var messageDisplay = "warning"; 
                            chrome.tabs.update(tabId, { url: `pages/page_classification.html?url=${encodeURIComponent(navUrl)}
                            &benign=${encodeURIComponent(benignProb)}&phishing=${encodeURIComponent(phishingProb)}
                            &features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(messageDisplay)}`});
                        }
                        else{
                            allowURL(navUrl);
                            chrome.tabs.create({ url: navUrl }, (newTab) => {
                                chrome.tabs.remove(tabId);
                            });
                        }

                    });
                    
                }
 
            });  
        }

    });

}

// Store the url to allow user to visit it
function allowURL(navUrl){

    // Get allowed urls
    chrome.storage.local.get("allowedUrls", (result) => {
        var allowedUrls = result.allowedUrls || [];

        // Push the url to list so user can visit it    
        allowedUrls.push(navUrl);
        chrome.storage.local.set({ allowedUrls }, () => {});
    });

}

// Receive message from javascript files for blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "applyBlockingRules"){
        applyUrlBlockingRules();
        sendResponse({status: "Blocking rules updated"});
    }
});

// Setup the extension when updated or installed
chrome.runtime.onInstalled.addListener(() => {
    applyUrlBlockingRules();
});

// Listen to all navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if(details.frameId === 0){
        var navUrl = details.url;
        checkURL(navUrl, details.tabId);
    }
}, { url: [{ schemes: ['http', 'https'] }]});