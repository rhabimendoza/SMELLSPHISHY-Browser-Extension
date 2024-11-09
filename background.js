// Block the urls in the list
function applyUrlBlockingRules(){

    // Get all blocked urls
    chrome.storage.local.get("blocked_urls", (result) => {
        const blocked_urls = result.blocked_urls || [];

        // Add new url to the list
        const rules = blocked_urls.map((url, index) => ({
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
            removeRuleIds: Array.from(Array(blocked_urls.length).keys()).map(i => i + 1),
            addRules: rules
        }, () =>{});
    });

}

// Flag urls or allow access
function checkURL(url, tab_id){

    // Trim whitespace from the URL
    url = url.trim();

    // Get the value of the checkbox to determine whether to execute url check automatically
    chrome.storage.local.get("isOn", (result) => {
        const is_on = result.isOn;

        // Proceed if checked
        if(is_on && url){ 
            chrome.storage.local.get(["blocked_urls", "allowed_urls"], (result) => {
                
                // Get all urls in blocked and allowed
                const blocked_urls = result.blocked_urls || []; 
                const allowed_urls = result.allowed_urls || []; 

                // Do nothing if url is in allowed
                if(allowed_urls.includes(url)){
                    return; 
                }
                else if(!blocked_urls.includes(url)){

                    // Show a temporary loading page
                    chrome.tabs.update(tab_id, { url: chrome.runtime.getURL("pages/page_loading.html") });

                    // Send the url to python for checking
                    fetch("https://smellsphishy-api.onrender.com/check_url", {
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
                        const features_string = JSON.stringify(features); 

                        // Check the result
                        if(result === 1){
                            const message = "phishing";   
                            chrome.tabs.update(tab_id, { url: `pages/page_classification.html?url=${encodeURIComponent(url)}
                            &benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}
                            &features=${encodeURIComponent(features_string)}&message=${encodeURIComponent(message)}`});;
                        }
                        else if(result === 2){
                            const message = "warning"; 
                            chrome.tabs.update(tab_id, { url: `pages/page_classification.html?url=${encodeURIComponent(url)}
                            &benign=${encodeURIComponent(benign)}&phishing=${encodeURIComponent(phishing)}
                            &features=${encodeURIComponent(features_string)}&message=${encodeURIComponent(message)}`});;
                        }
                        else{
                            allowURL(url);
                            chrome.tabs.create({ url: url }, (newTab) => {
                                chrome.tabs.remove(tab_id);
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
    chrome.storage.local.get("allowed_urls", (result) => {
        const allowed_urls = result.allowed_urls || [];

        // Push the url to list so user can visit it    
        allowed_urls.push(url);
        chrome.storage.local.set({ allowed_urls }, () => {});
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
        const url = details.url;
        checkURL(url, details.tabId);
    }
}, { url: [{ schemes: ['http', 'https'] }]});