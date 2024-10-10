document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const search_box = document.getElementById('search-box');
    const url_list = document.getElementById('url-list');

    // Function to fetch and display url
    function displayUrls(){

        // Get list
        chrome.storage.local.get(['blockedUrls', 'allowedUrls'], (result) => {
            const blockedUrls = result.blockedUrls || [];
            const allowedUrls = result.allowedUrls || [];
            
            // Combine and sort url
            const combinedUrls = [...blockedUrls.map(url => ({ url, type: 'blocked' })), 
                                   ...allowedUrls.map(url => ({ url, type: 'allowed' }))];
            combinedUrls.sort((a, b) => a.url.localeCompare(b.url));

            // Clear existing list
            url_list.innerHTML = '';

            // Display urls
            combinedUrls.forEach(item => {

                // Create list item
                const li = document.createElement('li');
                
                // Format url into lines of 30 characters
                const formattedUrl = formatUrl(item.url, 30);
                li.innerHTML = formattedUrl;

                // Create a button depending on type
                const button = document.createElement('button');
                if(item.type === 'blocked'){
                    button.textContent = 'Unblock';
                    button.className = 'unblock-button';
                    button.onclick = () => unblockUrl(item.url);
                } 
                else{
                    button.textContent = 'Disallow';
                    button.className = 'disallow-button';
                    button.onclick = () => disallowUrl(item.url);
                }

                // Create the row
                li.appendChild(button);
                url_list.appendChild(li);
        
            });
        
        });

    }

    // Helper function to format the url into lines of 30 characters
    function formatUrl(url, limit){

        // Make storage variable
        let formattedUrl = '';

        // Next line every 30 characters
        for(let i = 0; i < url.length; i += limit){
            formattedUrl += url.slice(i, i + limit) + '<br>';
        }

        // Return formatted
        return formattedUrl;
    }

    // Unblock clicked url
    function unblockUrl(url) {

        // Get list of blocked url
        chrome.storage.local.get("blockedUrls", (result) => {
            const blockedUrls = result.blockedUrls || [];
            
            // Unblock the url and go to unblocked page
            const updatedBlockedUrls = blockedUrls.filter(item => item !== url);
            chrome.storage.local.set({ blockedUrls: updatedBlockedUrls }, () => {
                chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
                    window.location.href = `page_unblocked.html?url=${encodeURIComponent(url)}`;
                });
            });
           
        });

    }
    
    // Disallow a specific url
    function disallowUrl(url) {

        // Update list of allowed urls and go to disallowed page
        chrome.storage.local.get('allowedUrls', (result) => {
            const allowedUrls = result.allowedUrls || [];
            const updatedUrls = allowedUrls.filter(item => item !== url);
            chrome.storage.local.set({ allowedUrls: updatedUrls }, () => {
                window.location.href = `page_disallowed.html?url=${encodeURIComponent(url)}`;
            });
        });

    }

    // Search functionality
    search_box.addEventListener('input', () => {
        
        // Turn input to lowercase
        const searchTerm = search_box.value.toLowerCase();

        // Show query
        Array.from(url_list.children).forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
        });

    });

    // Initial display of urls
    displayUrls();

});