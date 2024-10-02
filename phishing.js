document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    document.getElementById("p1").innerHTML = `Phishing URL: ${url}`;
});