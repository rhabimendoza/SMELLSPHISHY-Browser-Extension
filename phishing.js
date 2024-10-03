document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    document.getElementById("p1").innerHTML = `Phishing URL: ${url}`;

    const blockButton = document.getElementById("block-button");
    const ignoreButton = document.getElementById("ignore-button");
 
    blockButton.addEventListener("click", function () {
        saveBlockedUrl(url);
    });

    ignoreButton.addEventListener("click", function () {
        window.close(); // Closes the current tab
    });


});

// Function to save the blocked URL
function saveBlockedUrl(url) {
    chrome.storage.local.get("blockedUrls", (result) => {
        const blockedUrls = result.blockedUrls || [];

        if (!blockedUrls.includes(url)) {
            blockedUrls.push(url);
            chrome.storage.local.set({ blockedUrls }, () => {
                // Send a message to the background script to apply the blocking rules
                chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
                    // After applying the blocking rules, redirect to the "URL Blocked" page
                    window.location.href = `url_blocked.html?url=${encodeURIComponent(url)}`;
                });
            });
        }
    });
}

