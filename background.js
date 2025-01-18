// Block the urls in the list
function applyUrlBlockingRules(){

    // Get all blocked urls
    chrome.storage.local.get("blockedUrls", (result) => {
        const BLOCKED_URLS = result.blockedUrls || [];

        // Add new url to the list
        const rules = BLOCKED_URLS.map((url, index) => ({
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
            removeRuleIds: Array.from(Array(BLOCKED_URLS.length).keys()).map(i => i + 1),
            addRules: rules
        }, () =>{});
    });

}

// Flag urls or allow access
function checkUrl(url, tab_id){

    // Trim whitespace from the URL
    url = url.trim();

    // Get the value of the checkbox to determine whether to execute url check automatically
    chrome.storage.local.get("isOn", (result) => {
        const IS_ON = result.isOn;

        // Proceed if checked
        if(IS_ON && url){ 
            chrome.storage.local.get(["blockedUrls", "allowedUrls"], (result) => {
                
                // Get all urls in blocked and allowed
                const blocked_urls = result.blockedUrls || []; 
                const allowed_urls = result.allowedUrls || []; 

                // Do nothing if url is in allowed
                if(allowed_urls.includes(url)){
                    return; 
                }
                else if(!blocked_urls.includes(url)){

                    // Show a temporary loading page
                    chrome.tabs.update(tab_id, { url: chrome.runtime.getURL("pages/page_loading.html") });

                    // Send the url to python for checking
                    fetch("http://127.0.0.1:5000/check_url",{
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({url: url}),
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        // Get output of python
                        const RESULT = data.result;             
                        const BENIGN = data.benign;  
                        const PHISHING = data.phishing; 
                        const FEATURES = data.features;    
                        const FEATURES_STRING = JSON.stringify(FEATURES); 

                        // Check the result
                        if(RESULT === 1){
                            const MESSAGE = "phishing";   
                            chrome.tabs.update(tab_id, { url: `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(BENIGN)}
                            &phishing=${encodeURIComponent(PHISHING)}&features=${encodeURIComponent(FEATURES_STRING)}&message=${encodeURIComponent(MESSAGE)}`});;
                        }
                        else if(RESULT === 2){
                            const MESSAGE = "warning"; 
                            chrome.tabs.update(tab_id, { url: `pages/page_classification.html?url=${encodeURIComponent(url)}&benign=${encodeURIComponent(BENIGN)}
                            &phishing=${encodeURIComponent(PHISHING)}&features=${encodeURIComponent(FEATURES_STRING)}&message=${encodeURIComponent(MESSAGE)}`});;
                        }
                        else{
                            allowUrl(url);
                            chrome.tabs.create({ url: url }, (new_tab) => {
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
function allowUrl(url){

    // Get allowed urls
    chrome.storage.local.get("allowedUrls", (result) => {
        const ALLOWED_URLS = result.allowedUrls || [];

        // Push the url to list so user can visit it    
        ALLOWED_URLS.push(url);
        chrome.storage.local.set({ allowedUrls: ALLOWED_URLS }, () => {});
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
        const URL = details.url;
        const TAB_ID = details.tabId;
        checkUrl(URL, TAB_ID);
    }
}, { url: [{ schemes: ['http', 'https'] }]});