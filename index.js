document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const toggle_check = document.getElementById("toggle-check");
    const manual_container = document.getElementById("manual-container");
    const manual_url = document.getElementById("manual-url");
    const check_button = document.getElementById("check-button");    
    const unblock_button = document.getElementById("unblock-button");
    const close_button = document.getElementById("close-button");
    
    // Create component for displaying output of process
    const result_text = document.createElement("p");

    // Show or hide container depending on checkbox
    function updateUI(){
        var isOn = localStorage.getItem("isOn") === "false" ? false : true;

        if(isOn){
            manual_container.style.display = "none"; 
        } 
        else{
            manual_container.style.display = "block";
        }

        toggle_check.checked = isOn;
        manual_url.value = "";
        result_text.textContent = "";
    }

    // TODO: Add the model and result
    function checkURL(url){
        fetch("http://localhost:5000/check_url",{ 
            method: "POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url }),
        })
        .then(response => response.json())
        .then(data =>{
            if(data.result === 1){
                window.location.href = `manual_phishing_page.html?url=${encodeURIComponent(url)}`;
            } 
            else if(data.result === 2){
                // incorrect url format
                // manual_url.placeholder = "Url format is incorrect.";
            }
            else{
                result_text.textContent = "This URL is SAFE";
                manual_url.insertAdjacentElement("afterend", result_text);
            }
        });
    }

    // Delete list of blocked URLs
    function unblockURL(){
        chrome.storage.local.remove("blockedUrls", () =>{
            chrome.declarativeNetRequest.getDynamicRules((rules) =>{
                const ruleIds = rules.map(rule => rule.id);
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: ruleIds,
                    addRules: []
                },() =>{
                });
            });
        });
        
        result_text.textContent = "Listed URLs unblocked.";
        manual_url.insertAdjacentElement("afterend", result_text);
    }

    // Get the state of checkbox and update ui of html
    toggle_check.addEventListener("change", function (){
        var isOn = toggle_check.checked;
        localStorage.setItem("isOn", isOn.toString());
        updateUI();
    });

    // Check the input url 
    check_button.addEventListener("click", function (){
        var url = manual_url.value;
        url = url.trim();
        
        if(url){
            checkURL(url);
        }
        else{
            manual_url.value = "";
            manual_url.placeholder = "Please input url.";
        }
    });

    // Unblock all listed url
    unblock_button.addEventListener("click", function (){
        unblockURL();
    });

    // Close the html page
    close_button.addEventListener("click", function () {
        window.close(); 
    });

    // Update ui
    updateUI();
});