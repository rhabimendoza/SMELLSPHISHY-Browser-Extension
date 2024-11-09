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
		a. allowed_urls - list of allowed urls
        b. blocked_urls - list of blocked urls
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
	const LINK_PARAMS = new URLSearchParams(window.location.search);
	const LINK_URL = decodeURIComponent(LINK_PARAMS.get('url'));
	const LINK_BENIGN = decodeURIComponent(LINK_PARAMS.get('benign'));
	const LINK_PHISHING = decodeURIComponent(LINK_PARAMS.get('phishing'));
	const FEATURES_STRING = decodeURIComponent(LINK_PARAMS.get('features'));
	const LINK_FEATURES = JSON.parse(FEATURES_STRING);
	const LINK_MESSAGE = decodeURIComponent(LINK_PARAMS.get('message'));

	// Set title of page
	if(LINK_MESSAGE == "phishing"){
		PAGE_TITLE.innerHTML = "This URL is detected as PHISHING"
	}
	else{
		PAGE_TITLE.innerHTML = "This URL is potentially a PHISHING SITE"
	}

	// Display url and probabilities
	RECEIVED_URL.innerHTML = formatURL(LINK_URL, 30); 
	PHISHING_PERCENT.innerHTML = (LINK_PHISHING * 100).toFixed(2) + "%";
	BENIGN_PERCENT.innerHTML = (LINK_BENIGN * 100).toFixed(2) + "%";
	
	// List the features
	LINK_FEATURES.forEach(feature => {
		const li = document.createElement("li");
		li.textContent = feature;
		TOP_FEATURES.appendChild(li); 
	});

	// Block the url navigated
	function blockURL(url){

		// Get blocked urls
		chrome.storage.local.get("blocked_urls", (result) => {
			const blocked_urls = result.blocked_urls || [];

			// Push the url to the list and go to blocked page
			blocked_urls.push(url);
			chrome.storage.local.set({ blocked_urls }, () => {
				chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
					const message = "blocked";
					window.location.href = `page_action.html?url=${encodeURIComponent(url)}
					&message=${encodeURIComponent(message)}`;
				});
			});
		});

	}

	// Store the url to allow user to visit it
	function allowURL(url){

		// Get allowed urls
		chrome.storage.local.get("allowed_urls", (result) => {
			const allowed_urls = result.allowed_urls || [];

			// Push the url to list so user can visit it
			allowed_urls.push(url);
			chrome.storage.local.set({ allowed_urls }, () => {
				const message = "allowed"
				window.location.href = `page_action.html?url=${encodeURIComponent(url)}
				&message=${encodeURIComponent(message)}`;
			});
		});

	}

	// Add url to blocked
	BLOCK_BUTTON.addEventListener("click", function (){
		blockURL(LINK_URL);
	});

	// List the url in allowed
	ALLOW_BUTTON.addEventListener("click", function (){
		allowURL(LINK_URL);
	});

	// Close the page
	CLOSE_BUTTON.addEventListener("click", function (){
		window.close();
	});

});