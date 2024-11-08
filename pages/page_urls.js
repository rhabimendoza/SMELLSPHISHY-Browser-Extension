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
    var search_box = document.getElementById('search-box');
    var url_list = document.getElementById('url-list');

    // Function to fetch and display url
    function displayURL(){

        // Get list
        chrome.storage.local.get(['blockedUrls', 'allowedUrls'], (result) => {
            var blockedUrls = result.blockedUrls || [];
            var allowedUrls = result.allowedUrls || [];
            
            // Combine and sort url
            var combinedUrls = [...blockedUrls.map(url => ({ url, type: 'blocked' })), 
                                   ...allowedUrls.map(url => ({ url, type: 'allowed' }))];
            combinedUrls.sort((a, b) => a.url.localeCompare(b.url));

            // Clear existing list
            url_list.innerHTML = '';

            // Display urls
            combinedUrls.forEach(item => {

                // Create list item
                var liLink = document.createElement('li');
                
                // Format url into lines of characters
                var formattedUrl = formatURL(item.url, 30);
                liLink.innerHTML = formattedUrl;

                // Create a button depending on type
                var buttonUrl = document.createElement('button');
                if(item.type === 'blocked'){
                    buttonUrl.textContent = 'Unblock';
                    buttonUrl.className = 'unblock-button';
                    buttonUrl.onclick = () => unblockURL(item.url);
                } 
                else{
                    buttonUrl.textContent = 'Disallow';
                    buttonUrl.className = 'disallow-button';
                    buttonUrl.onclick = () => disallowURL(item.url);
                }

                // Create the row
                liLink.appendChild(buttonUrl);
                url_list.appendChild(liLink);
        
            });

        });

    }

    // Unblock a specific url
    function unblockURL(urlItem){

        // Get the currently blocked urls
        chrome.storage.local.get("blockedUrls", (data) => {
            var blockedUrls = data.blockedUrls || [];
            
            // Remove the specified url from the list
            var updatedUrls = blockedUrls.filter(item => item !== urlItem);

            // Update the storage with the new list
            chrome.storage.local.set({ blockedUrls: updatedUrls }, () => {
                
                chrome.declarativeNetRequest.getDynamicRules((rules) => {
                    
                    // Remove the rule
                    var ruleIds = rules.filter(rule => rule.action?.type === "block" && rule.condition?.urlFilter === url).map(rule => rule.id);
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: ruleIds,
                        addRules: []
                    }, () => {
                        var messageDisplay = "unblock";
                        window.location.href = `page_action.html?url=${encodeURIComponent(urlItem)}
                        &message=${encodeURIComponent(messageDisplay)}`;
                    
                    });

                });

            });

        });
        
    }
    
    // Disallow a specific url
    function disallowURL(urlItem){

        // Get list of allowed url
        chrome.storage.local.get('allowedUrls', (result) => {
            var allowedUrls = result.allowedUrls || [];

            // Update the allowed list and go to disallowed page
            var updatedUrls = allowedUrls.filter(item => item !== urlItem);
            chrome.storage.local.set({ allowedUrls: updatedUrls }, () => {
                var messageDisplay = "disallow";
				window.location.href = `page_action.html?url=${encodeURIComponent(urlItem)}
                &message=${encodeURIComponent(messageDisplay)}`;
			});
        });

    }

    // Search functionality
    search_box.addEventListener('input', () => {
        
        // Turn input to lowercase
        var stringFind = search_box.value.toLowerCase();

        // Show query
        Array.from(url_list.children).forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(stringFind) ? '' : 'none';
        });

    });

    // Initial display of urls
    displayURL();

});