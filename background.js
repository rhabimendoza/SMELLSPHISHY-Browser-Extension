chrome.runtime.onInstalled.addListener(() => {
    // On extension installation, check and apply blocking rules
    applyUrlBlockingRules();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "applyBlockingRules") {
        applyUrlBlockingRules();
        sendResponse({ status: "Blocking rules updated" });
    }
});
function applyUrlBlockingRules() {
    chrome.storage.local.get("blockedUrls", (result) => {
        const blockedUrls = result.blockedUrls || [];

        const rules = blockedUrls.map((url, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { 
                urlFilter: url,
                resourceTypes: ["main_frame"]
            }
        }));

        // Remove old rules and add the new ones
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from(Array(blockedUrls.length).keys()).map(i => i + 1),
            addRules: rules
        }, () => {
            console.log("Blocking rules updated.");
        });
    });
}
