/** 
    Program Title: page_classification.js
    Main Purpose: Functionality of page_classification.html
    Programmer: Rhabi Mendoza
    Date Written: September 30, 2024
    Date Revised: November 8, 2024

    Purpose:
        a. Display classified url and its suspicious features
		b. Allow user to block or allow url
    Data Structures:
		a. allowedUrls - list of allowed urls
        b. blockedUrls - list of blocked urls
    Algorithms:
        a. blockURL - block the url
		b. allowURL - add url to allowed list
    Control:
        a. Event listeners handle user interactions 
 **/

document.addEventListener("DOMContentLoaded", function (){

	// Get components from html
	const PAGE_TITLE = document.getElementById("page-title");
	const RECEIVED_URL = document.getElementById("received-url");
	const PHISHING_PERCENT = document.getElementById("phishing-percent");
	const BENIGN_PERCENT = document.getElementById("benign-percent");
	const TOP_FEATURES = document.getElementById("top-features");
	const BLOCK_BUTTON = document.getElementById("block-button");
	const ALLOW_BUTTON = document.getElementById("allow-button");
	const CLOSE_BUTTON = document.getElementById("close-button");

	// Get all sent data
	const PARAMS = new URLSearchParams(window.location.search);
	const URL = decodeURIComponent(PARAMS.get('url'));
	const BENIGN = decodeURIComponent(PARAMS.get('benign'));
	const PHISHING = decodeURIComponent(PARAMS.get('phishing'));
	const FEATURES_STRING = decodeURIComponent(PARAMS.get('features'));
	const FEATURES = JSON.parse(FEATURES_STRING);
	const MESSAGE = decodeURIComponent(PARAMS.get('message'));

	// Set title of page
	if(MESSAGE == "phishing"){
		PAGE_TITLE.innerHTML = "This URL is detected as PHISHING"
	}
	else if(MESSAGE == "warning"){
		PAGE_TITLE.innerHTML = "This URL is potentially a PHISHING SITE"
	}

	// Display url and probabilities
	RECEIVED_URL.innerHTML = formatUrl(URL, 30); 
	PHISHING_PERCENT.innerHTML = (PHISHING * 100).toFixed(2) + "%";
	BENIGN_PERCENT.innerHTML = (BENIGN * 100).toFixed(2) + "%";
	
	// List the features
	FEATURES.forEach(feature => {
		const LI = document.createElement("li");
		LI.textContent = feature;
		TOP_FEATURES.appendChild(LI); 
	});

	// Block the url navigated
	function blockUrl(url){

		// Get blocked urls
		chrome.storage.local.get("blockedUrls", (result) => {
			const BLOCKED_URLS = result.blockedUrls || [];

			// Push the url to the list and go to blocked page
			BLOCKED_URLS.push(url);
			chrome.storage.local.set({ blockedUrls: BLOCKED_URLS }, () => {
				chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
					const MESSAGE = "blocked";
					window.location.href = `page_action.html?url=${encodeURIComponent(url)}
					&message=${encodeURIComponent(MESSAGE)}`;
				});
			});
		});

	}

	// Store the url to allow user to visit it
	function allowUrl(url){

		// Get allowed urls
		chrome.storage.local.get("allowedUrls", (result) => {
			const ALLOWED_URLS = result.allowedUrls || [];

			// Push the url to list so user can visit it
			ALLOWED_URLS.push(url);
			chrome.storage.local.set({ allowedUrls: ALLOWED_URLS }, () => {
				const MESSAGE = "allowed";
				window.location.href = `page_action.html?url=${encodeURIComponent(url)}
				&message=${encodeURIComponent(MESSAGE)}`;
			});
		});

	}

	// Add url to blocked
	BLOCK_BUTTON.addEventListener("click", function (){
		const PARAMS = new URLSearchParams(window.location.search);
		const URL = decodeURIComponent(PARAMS.get('url'));
		blockUrl(URL);
	});

	// List the url in allowed
	ALLOW_BUTTON.addEventListener("click", function (){
		const PARAMS = new URLSearchParams(window.location.search);
		const URL = decodeURIComponent(PARAMS.get('url'));
		allowUrl(URL);
	});

	// Close the page
	CLOSE_BUTTON.addEventListener("click", function (){
		window.close();
	});

});