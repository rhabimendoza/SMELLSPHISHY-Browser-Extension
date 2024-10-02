'use strict';

// Blocking
function handleRequest(details) {
  return { cancel: true };  // Cancel the request, Chrome will show ERR_BLOCKED_BY_CLIENT
}

function addBlockingListener(urls) {
  chrome.webRequest.onBeforeRequest.addListener(handleRequest, { urls }, ["blocking"]);
}

// Storage
function clearStorage() {
  chrome.storage.local.clear(function () {
    chrome.webRequest.onBeforeRequest.removeListener(handleRequest);
    console.log('Storage cleared');
  });
}

function loadBannedURLs() {
  chrome.storage.local.get('blocked', (result) => {
    if (!result.blocked) { return; }
    for (let url of result.blocked) {
      addBlockingListener([url]);
    }
  });
}

function saveBannedURL(url) {
  chrome.storage.local.get('blocked', (result) => {
    if (!result.blocked) { result.blocked = []; }
    result.blocked.push(url);
    chrome.storage.local.set({ 'blocked': result.blocked });
  });
}

// Core feature
function addBannedURL(url) {
  addBlockingListener([url]);
  saveBannedURL(url);
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case 'clearStorage':
      clearStorage();
      break;
    case 'block':
      addBannedURL(`*://*.${msg.data}/*`);
      break;
    default:
      break;
  }
});

loadBannedURLs();
