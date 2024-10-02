const btn = document.getElementById('btn');
btn.addEventListener('click', addBannedURL);

const btnClear = document.getElementById('btnClear');
btnClear.addEventListener('click', clearStorage);

function fireEvent(type, data) {
    chrome.runtime.sendMessage({
        type,
        data,
    }, null);
}

function addBannedURL() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        const completeURL = tabs[0].url;
        const domain = completeURL.split('/')[2];
        fireEvent('block', domain);
    });
}

function clearStorage() {
    fireEvent('clearStorage', {});
}
