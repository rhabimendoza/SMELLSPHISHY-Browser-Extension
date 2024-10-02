document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    document.getElementById("p1").innerHTML = `Phishing URL: ${url}`;
    
    const blockButton = document.getElementById("block-button");
    
    blockButton.addEventListener("click", function() {
        saveBlockedUrl(url);
        alert(`URL blocked: ${url}`); 
    });
});

function saveBlockedUrl(url) {
    const blockedUrls = JSON.parse(localStorage.getItem("blockedUrls")) || [];
    
    if (!blockedUrls.includes(url)) {
        blockedUrls.push(url);
        localStorage.setItem("blockedUrls", JSON.stringify(blockedUrls));
    }
}
