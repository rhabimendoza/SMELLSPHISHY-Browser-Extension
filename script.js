document.addEventListener("DOMContentLoaded", function (){

    const toggleCheck = document.getElementById("toggle-check");
    const textboxContainer = document.getElementById("textbox-container");
    const manualUrl = document.getElementById("manual-url");
    const checkButton = document.getElementById("check-button");
    const resultText = document.createElement("p");
    const unblockAllButton = document.getElementById("unblock-all-button");
    const closeButton = document.getElementById("close-button"); // New close button reference

    unblockAllButton.addEventListener("click", function () {
        clearAllBlockedUrls();
    });

    // Close button event listener
    closeButton.addEventListener("click", function () {
        window.close(); // Close the current window or tab
    });

    function clearAllBlockedUrls() {
        chrome.storage.local.remove("blockedUrls", () => {
            alert("All blocked URLs have been unblocked.");
            // Remove all blocking rules, not just based on `blockedUrls`
            chrome.declarativeNetRequest.getDynamicRules((rules) => {
                const ruleIds = rules.map(rule => rule.id);
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: ruleIds,
                    addRules: []
                }, () => {
                    console.log("All blocking rules removed.");
                });
            });
        });
    }
    

    toggleCheck.addEventListener("change", function (){
        isOn = toggleCheck.checked;
        localStorage.setItem("isOn", isOn.toString());
        updateUI();
    });

    let isOn = localStorage.getItem("isOn") === "false" ? false : true;

    function updateUI(){
        if(isOn){
            textboxContainer.style.display = "none"; 
        } 
        else{
            textboxContainer.style.display = "block";
        }

        toggleCheck.checked = isOn;
        resultText.textContent = "";
        manualUrl.value = "";
    }

    checkButton.addEventListener("click", function (){
        const url = manualUrl.value;
        if(url){
            checkUrl(url);
        }
    });

    function checkUrl(url){
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
                window.location.href = `phishing.html?url=${encodeURIComponent(url)}`;
            } 
            else{
                resultText.textContent = "This URL is SAFE";
                manualUrl.insertAdjacentElement("afterend", resultText);
            }
        });
    }

    updateUI();
});
