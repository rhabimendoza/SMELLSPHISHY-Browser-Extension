document.addEventListener("DOMContentLoaded", function () {

    const url_name = document.getElementById("url-name");

    function updateUrlDisplay() {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab) {
                const url = tab.url; 
                url_name.innerHTML = tab.url;

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
                        showPopup("HARMFUL");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });
            }
        });

    }

    function showPopup(message) {
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.left = "50%";
        popup.style.top = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.backgroundColor = "red";
        popup.style.color = "white";
        popup.style.zIndex = "1000";
        popup.textContent = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            document.body.removeChild(popup);
        }, 3000);
    }

    chrome.tabs.onActivated.addListener(function () {
        updateUrlDisplay();
    });

    updateUrlDisplay();
});