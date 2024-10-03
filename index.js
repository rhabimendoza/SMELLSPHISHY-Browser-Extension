document.addEventListener("DOMContentLoaded", function () {

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
    if (localStorage.getItem("isOn") === null) {
        localStorage.setItem("isOn", "false"); // Set default to unchecked (false)
    }

    // Update the UI based on the stored state
    updateUI();

    // Show or hide container depending on checkbox
    function updateUI() {
        var isOn = localStorage.getItem("isOn") === "false" ? false : true;

        if (isOn) {
            manual_container.style.display = "none"; 
        } 
        else {
            manual_container.style.display = "block";
        }

        toggle_check.checked = isOn;
        manual_url.value = "";
        result_text.textContent = "";
    }

    // TODO: Add the model and result
    function checkURL(url) {
        fetch("http://localhost:5000/check_url", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 1) {
                window.location.href = `manual_phishing_page.html?url=${encodeURIComponent(url)}`;
            } 
            else if (data.result === 2) {
                manual_url.value = "";
                manual_url.placeholder = "Invalid url.";
            }
            else {
                result_text.textContent = "This URL is SAFE";
                manual_url.insertAdjacentElement("afterend", result_text);
            }
        });
    }

    function unblockURL() {
        chrome.storage.local.set({ blockedUrls: [] }, () => {
            result_text.textContent = "Listed URLs unblocked.";
            manual_url.insertAdjacentElement("afterend", result_text);
        });
    }

    // Function to delete all allowedUrls from storage
    function deleteURL() {
        chrome.storage.local.set({ allowedUrls: [] }, () => {
            result_text.textContent = "Listed allowed URLs deleted.";
            manual_url.insertAdjacentElement("afterend", result_text);
        });
    }

    // Get the state of checkbox and update UI of HTML
    toggle_check.addEventListener("change", function () {
        var isOn = toggle_check.checked;
        localStorage.setItem("isOn", isOn.toString());
        chrome.storage.local.set({ isOn: isOn });
        updateUI();

        // Log the state of the checkbox
        console.log(isOn ? "Checked" : "Unchecked");
    });

    // Check the input url 
    check_button.addEventListener("click", function () {
        var url = manual_url.value;
        url = url.trim();
        
        if (url) {
            checkURL(url);
        }
        else {
            manual_url.value = "";
            manual_url.placeholder = "Input url.";
        }
    });

    // Unblock all listed URL
    unblock_button.addEventListener("click", function () {
        unblockURL();
    });

    // Delete allowed URLs
    delete_button.addEventListener("click", function () {
        deleteURL();
    });

    // Close the HTML page
    close_button.addEventListener("click", function () {
        window.close(); 
    });

    // Initialize the checkbox state if not set
    if (localStorage.getItem("isOn") === null) {
        localStorage.setItem("isOn", "true"); // Set default to checked (true)
    }

    // Update UI
    updateUI();
});
