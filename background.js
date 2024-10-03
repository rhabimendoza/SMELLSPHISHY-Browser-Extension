// Setup the extension when updated or installed
chrome.runtime.onInstalled.addListener(() =>{
    applyUrlBlockingRules();
});

// Receive message from javascript files for blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if(message.action === "applyBlockingRules"){
        applyUrlBlockingRules();
        sendResponse({ status: "Blocking rules updated" });
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
        }, () =>{
        });
    });
}