document.addEventListener("DOMContentLoaded", function(){

    // Get components from html
    const search_box = document.getElementById('search-box');
    const url_list = document.getElementById('url-list');

    // Function to fetch and display url
    function displayURL(){

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
                url_list.appendChild(li);
        
            });
        
        });

    }

	// Next line url format
	function formatURL(url, limit){

		// Make storage variable
		let formatted_url = '';

		// Next line every 30 characters
		for(let i = 0; i < url.length; i += limit){
			formatted_url += url.slice(i, i + limit) + '<br>';
		}

		// Return formatted
		return formatted_url;
	}

    






 // Unblock clicked url
 function unblockURL(url) {

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
    function disallowURL(url){

        // Get list of allowed url
        chrome.storage.local.get('allowedUrls', (result) => {
            const allowedUrls = result.allowedUrls || [];

            // Update the allowed list and go to disallowed page
            const updatedUrls = allowedUrls.filter(item => item !== url);
            chrome.storage.local.set({ allowedUrls: updatedUrls }, () => {
                const message = "disallow";
				window.location.href = `page_action.html?url=${encodeURIComponent(url)}&message=${encodeURIComponent(message)}`;
			});

        });

    }

    // Search functionality
    search_box.addEventListener('input', () => {
        
        // Turn input to lowercase
        const inp_find = search_box.value.toLowerCase();

        // Show query
        Array.from(url_list.children).forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(inp_find) ? '' : 'none';
        });

    });

    // Initial display of urls
    displayURL();

});