const btnBlock = document.getElementById('btnBlock');
btnBlock.addEventListener('click', addBannedURL);

const btnClear = document.getElementById('btnClear');
btnClear.addEventListener('click', clearStorage);

function fireEvent(type, data) {
    chrome.runtime.sendMessage({
        type,
        data,
    }, null);
}

function addBannedURL() {
    const inputURL = document.getElementById('urlInput').value.trim();
    if (inputURL) {
        // Format the URL for blocking (assume wildcard blocking for all subdomains)
        const domain = inputURL.startsWith('http') ? new URL(inputURL).hostname : inputURL;
        fireEvent('block', domain);
        alert(`Blocked URL: ${domain}`);
    } else {
        alert('Please enter a valid URL.');
    }
}

function clearStorage() {
    fireEvent('clearStorage', {});
}
