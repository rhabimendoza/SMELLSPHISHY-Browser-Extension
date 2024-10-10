document.addEventListener("DOMContentLoaded", function (){

    // Get all components in html
    const toggle_check = document.getElementById("toggle-check");
    const manual_container = document.getElementById("manual-container");
    const automatic_container = document.getElementById("automatic-container");
    const manual_url = document.getElementById("manual-url");
    const check_button = document.getElementById("check-button");    

    // Initialize checkbox state
    if(localStorage.getItem("isOn") === null){
        localStorage.setItem("isOn", "false");
    }

    // Show or hide container depending on checkbox
    function updateUI(){

        // Get state of checkbox
        var isOn = localStorage.getItem("isOn") === "false" ? false : true;

        // Hide components of manual checking if checked
        if(isOn){
            manual_container.style.display = "none";
            automatic_container.style.display = "block";
        } 
        else{
            manual_container.style.display = "block";
            automatic_container.style.display = "none";
        }

        // Store state and clear changes in display
        toggle_check.checked = isOn;
        manual_url.value = "";
        manual_url.placeholder = "Enter suspicious URL";
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
                    manual_url.placeholder = "URL is INVALID.";
                }
                else if(result === 1){
                    window.location.href = `page_phishing.html?url=${encodeURIComponent(url)}&probability=${probability}`;
                }
                else if(result === 2){
                    window.location.href = `page_warning.html?url=${encodeURIComponent(url)}&probability=${probability}`;
                }
                else{
                    manual_url.value = "";
                    manual_url.placeholder = "URL is SAFE.";
                }

            });

        }

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

    // Update ui
    updateUI();

});