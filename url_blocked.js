document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    document.getElementById("blocked-url").innerHTML = `Blocked URL: ${url}`;

    const closeButton = document.getElementById("close-button");
    closeButton.addEventListener("click", function () {
        window.close(); // Closes the current tab
    });
});
