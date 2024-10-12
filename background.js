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
                else if(!blockedUrls.includes(url)){

                    // Show a temporary loading page
                    chrome.tabs.update(tabId, { url: chrome.runtime.getURL("page_loading.html") });

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
                        
                        // Get output of python
                        const result = data.result;             
                        const benign = data.benign;  
                        const phishing = data.phishing; 
                        const features = data.features;    
                        const featuresString = JSON.stringify(features); 

                        // Check the result
                        if(result === 1){
                            const message = "phishing";   
                            chrome.tabs.update(tabId, { url: `page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}&features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(message)}`});;
                        }
                        else if(result === 2){
                            const message = "warning"; 
                            chrome.tabs.update(tabId, { url: `page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}&features=${encodeURIComponent(featuresString)}&message=${encodeURIComponent(message)}`});;
                        }
                        else{
                            allowURL(url);
                            chrome.tabs.create({ url: url }, (newTab) => {
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
function allowURL(url){

    // Get allowed urls
    chrome.storage.local.get("allowedUrls", (result) => {
        const allowedUrls = result.allowedUrls || [];

        // Push the url to list so user can visit it    
        allowedUrls.push(url);
        chrome.storage.local.set({ allowedUrls }, () => {});
        
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
}, { url: [{ schemes: ['http', 'https'] }]});