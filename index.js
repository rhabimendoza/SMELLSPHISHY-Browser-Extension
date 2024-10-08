document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const toggle_check = document.getElementById("toggle-check");
    const manual_container = document.getElementById("manual-container");
    const manual_url = document.getElementById("manual-url");
    const check_button = document.getElementById("check-button");    
    const unblock_button = document.getElementById("unblock-button");
    const delete_button = document.getElementById("delete-button");
    const close_button = document.getElementById("close-button");

    // Create component for displaying output of process
    const result_text = document.createElement("p");

    // Initialize checkbox state
    if(localStorage.getItem("isOn") === null){
        localStorage.setItem("isOn", "false");
    }

    // Update the ui based on the stored state
    updateUI();

    // Show or hide container depending on checkbox
    function updateUI(){

        // Get state of checkbox
        var isOn = localStorage.getItem("isOn") === "false" ? false : true;

        // Hide components of manual checking if checked
        if(isOn){
            manual_container.style.display = "none"; 
        } 
        else{
            manual_container.style.display = "block";
        }

        // Store state and clear changes in display
        toggle_check.checked = isOn;
        manual_url.value = "";
        result_text.textContent = "";
    }

    // Check validity and classification of url
    function checkURL(){

        // Get url and trim it
        var url = manual_url.value;
        url = url.trim();

        if(!url){
            manual_url.value = "";
            manual_url.placeholder = "Input a url.";
        }
        else{

            // Send url to python
            fetch("http://localhost:5000/check_url", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({url: url}),
            })
            .then(response => response.json())
            .then(data => {

                // Get output of python
                const result = data.result;
                const probability = data.probability;

                // Get result and use for classification
                if(result === 3){
                    manual_url.value = "";
                    manual_url.placeholder = "Invalid url.";
                }
                else if(result === 1){
                    window.location.href = `page_phishing.html?url=${encodeURIComponent(url)}&probability=${probability}`;
                }
                else if(result === 2){
                    window.location.href = `page_warning.html?url=${encodeURIComponent(url)}&probability=${probability}`;
                }
                else{
                    result_text.textContent = "The URL is SAFE.";
                    document.getElementById('result-safe').innerHTML = result_text.textContent;
                    //document.body.insertAdjacentElement("afterbegin", result_text);
                }

            });

        }

    }

    // Unblock listed urls
    function unblockURL(){

        // Get all urls and unblock
        chrome.storage.local.remove("blockedUrls", () => {
            chrome.declarativeNetRequest.getDynamicRules((rules) => {
                const ruleIds = rules.map(rule => rule.id);
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: ruleIds,
                    addRules: []
                },() =>{
                });
            });
        });
        
        result_text.textContent = "Listed URLs unblocked.";
        document.body.insertAdjacentElement("afterbegin", result_text);
    }

    // Delete list of allowed urls
    function deleteURL(){

        // Empty list of allowed urls
        chrome.storage.local.set({ allowedUrls: [] }, () => {});

        // Display success
        result_text.textContent = "Listed allowed URLs deleted.";
        document.body.insertAdjacentElement("afterbegin", result_text);
    }
    
    // Get the state of checkbox and update ui
    toggle_check.addEventListener("change", function (){
        var isOn = toggle_check.checked;
        localStorage.setItem("isOn", isOn.toString());
        chrome.storage.local.set({isOn: isOn});
        updateUI();
    });

    // Check the input url 
    check_button.addEventListener("click", function (){
        checkURL();
    });

    // Unblock all listed URL
    unblock_button.addEventListener("click", function (){
        unblockURL();
    });

    // Delete allowed URLs
    delete_button.addEventListener("click", function (){
        deleteURL();
    });

    // Close the HTML page
    close_button.addEventListener("click", function (){
        window.close(); 
    });

    // Update ui
    updateUI();

});