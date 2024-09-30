document.addEventListener("DOMContentLoaded", function () {
    
    const url_name = document.getElementById("url-name");

    function updateUrlDisplay() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab) {
                const url = tab.url; 
                url_name.innerHTML = tab.url;
            }
        });
    }

    chrome.tabs.onActivated.addListener(function () {
        updateUrlDisplay();
    });


    updateUrlDisplay();
});