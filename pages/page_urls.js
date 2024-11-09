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
        a. allowed_urls - list of allowed urls
        b. blocked_urls - list of blocked urls
        c. combined_urls - list of combined blocked and allowed urls
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
    function displayURL(){

        // Get list
        chrome.storage.local.get(['blocked_urls', 'allowed_urls'], (result) => {
            const blocked_urls = result.blocked_urls || [];
            const allowed_urls = result.allowed_urls || [];
            
            // Combine and sort url
            const combined_urls = [...blocked_urls.map(url => ({ url, type: 'blocked' })), 
                                    ...allowed_urls.map(url => ({ url, type: 'allowed' }))];
            combined_urls.sort((a, b) => a.url.localeCompare(b.url));

            // Clear existing list
            URL_LIST.innerHTML = '';

            // Display urls
            combined_urls.forEach(item => {

                // Create list item
                const li = document.createElement('li');
                
                // Format url into lines of characters
                const formatted_url = formatURL(item.url, 30);
                li.innerHTML = formatted_url;

                // Create a button depending on type
                const button = document.createElement('button');
                if(item.type === 'blocked'){
                    button.textContent = 'Unblock';
                    button.className = 'unblock-button';
                    button.onclick = () => unblockURL(item.url);
                } 
                else{
                    button.textContent = 'Disallow';
                    button.className = 'disallow-button';
                    button.onclick = () => disallowURL(item.url);
                }

                // Create the row
                li.appendChild(button);
                URL_LIST.appendChild(li);
        
            });

        });

    }

    // Unblock a specific url
    function unblockURL(url){

        // Get the currently blocked urls
        chrome.storage.local.get("blocked_urls", (data) => {
            const blocked_urls = data.blocked_urls || [];
            
            // Remove the specified url from the list
            const updated_urls = blocked_urls.filter(url => url !== url);

            // Update the storage with the new list
            chrome.storage.local.set({ blocked_urls: updated_urls }, () => {
                
                chrome.declarativeNetRequest.getDynamicRules((rules) => {
                    
                    // Remove the rule
                    const rule_id = rules.filter(rule => rule.action?.type === "block" && rule.condition?.urlFilter === url).map(rule => rule.id);
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: rule_id,
                        addRules: []
                    }, () => {
                        const message = "unblock";
                        window.location.href = `page_action.html?url=${encodeURIComponent(url)}
                        &message=${encodeURIComponent(message)}`;
                    
                    });

                });

            });

        });
        
    }
    
    // Disallow a specific url
    function disallowURL(url){

        // Get list of allowed url
        chrome.storage.local.get('allowed_urls', (result) => {
            const allowed_urls = result.allowed_urls || [];

            // Update the allowed list and go to disallowed page
            const updated_urls = allowed_urls.filter(item => item !== url);
            chrome.storage.local.set({ allowed_urls: updated_urls }, () => {
                const message = "disallow";
                window.location.href = `page_action.html?url=${encodeURIComponent(url)}
                &message=${encodeURIComponent(message)}`;
            });
        });

    }

    // Search functionality
    SEARCH_BOX.addEventListener('input', () => {
        
        // Turn input to lowercase
        const inp_find = SEARCH_BOX.value.toLowerCase();

        // Show query
        Array.from(URL_LIST.children).forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(inp_find) ? '' : 'none';
        });

    });

    // Initial display of urls
    displayURL();

});