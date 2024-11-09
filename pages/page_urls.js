/** 
    Program Title: page_urls.js
    Main Purpose: Functionality of page_urls.html
    Programmer: Rhabi Mendoza
    Date Written: September 30, 2024
    Date Revised: November 8, 2024

    Purpose:
        a. Allow user to filter block and allowed url using search box
        b. Unblock or disallow a url
    Data Structures:
        a. allowedUrls - list of allowed urls
        b. blockedUrls - list of blocked urls
        c. combinedUrls - list of combined blocked and allowed urls
    Algorithms:
        a. displayURL - get list of blocked and allowed urls and display with button
        b. unblockURL - unblock the url
        c. disallowURL - disallow the url
    Control:
        a. Event listeners handle user interactions 
 **/

document.addEventListener("DOMContentLoaded", function(){

    // Get components from html
    const SEARCH_BOX = document.getElementById('search-box');
    const URL_LIST = document.getElementById('url-list');

    // Function to fetch and display url
    function displayUrl(){

        // Get list
        chrome.storage.local.get(['blockedUrls', 'allowedUrls'], (result) => {
            const BLOCKED_URLS = result.blockedUrls || [];
            const ALLOWED_URLS = result.allowedUrls || [];
            
            // Combine and sort url
            const COMBINED_URLS = [...BLOCKED_URLS.map(url => ({ url, type: 'blocked' })), 
                                    ...ALLOWED_URLS.map(url => ({ url, type: 'allowed' }))];
            COMBINED_URLS.sort((a, b) => a.url.localeCompare(b.url));

            // Clear existing list
            URL_LIST.innerHTML = '';

            // Display urls
            COMBINED_URLS.forEach(item => {

                // Create list item
                const LI = document.createElement('li');
                
                // Format url into lines of characters
                const FORMATTED_URL = formatUrl(item.url, 30);
                LI.innerHTML = FORMATTED_URL;

                // Create a button depending on type
                const BUTTON = document.createElement('button');
                if(item.type === 'blocked'){
                    BUTTON.textContent = 'Unblock';
                    BUTTON.className = 'unblock-button';
                    BUTTON.onclick = () => unblockUrl(item.url);
                } 
                else{
                    BUTTON.textContent = 'Disallow';
                    BUTTON.className = 'disallow-button';
                    BUTTON.onclick = () => disallowUrl(item.url);
                }

                // Create the row
                LI.appendChild(BUTTON);
                URL_LIST.appendChild(LI);
        
            });

        });

    }

    // Unblock a specific url
    function unblockUrl(url){

        // Get the currently blocked urls
        chrome.storage.local.get("blockedUrls", (data) => {
            const BLOCKED_URLS = data.blockedUrls || [];
            
            // Remove the specified url from the list
            const UPDATED_BLOCKED_URLS = BLOCKED_URLS.filter(item => item !== url);

            // Update the storage with the new list
            chrome.storage.local.set({ blockedUrls: UPDATED_BLOCKED_URLS }, () => {
                
                chrome.declarativeNetRequest.getDynamicRules((rules) => {
                    
                    // Remove the rule
                    const RULE_IDS = rules.filter(rule => rule.action?.type === "block" && rule.condition?.urlFilter === url).map(rule => rule.id);
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: RULE_IDS,
                        addRules: []
                    }, () => {
                        const MESSAGE = "unblock";
                        window.location.href = `page_action.html?url=${encodeURIComponent(url)}
                        &message=${encodeURIComponent(MESSAGE)}`;
                    
                    });

                });

            });

        });
        
    }
    
    // Disallow a specific url
    function disallowUrl(url){

        // Get list of allowed url
        chrome.storage.local.get('allowedUrls', (result) => {
            const ALLOWED_URLS = result.allowedUrls || [];

            // Update the allowed list and go to disallowed page
            const UPDATED_URLS = ALLOWED_URLS.filter(item => item !== url);
            chrome.storage.local.set({ allowedUrls: UPDATED_URLS }, () => {
                const MESSAGE = "disallow";
                window.location.href = `page_action.html?url=${encodeURIComponent(url)}
                &message=${encodeURIComponent(MESSAGE)}`;
            });
        });

    }

    // Search functionality
    SEARCH_BOX.addEventListener('input', () => {
        
        // Turn input to lowercase
        const INP_FIND = SEARCH_BOX.value.toLowerCase();

        // Show query
        Array.from(URL_LIST.children).forEach(LI => {
            LI.style.display = LI.textContent.toLowerCase().includes(INP_FIND) ? '' : 'none';
        });

    });

    // Initial display of urls
    displayUrl();

});