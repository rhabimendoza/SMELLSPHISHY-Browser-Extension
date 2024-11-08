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
	var page_title = document.getElementById("page-title");
	var received_url = document.getElementById("received-url");
	var phishing_percent = document.getElementById("phishing-percent");
	var benign_percent = document.getElementById("benign-percent");
	var top_features = document.getElementById("top-features");
	var block_button = document.getElementById("block-button");
	var allow_button = document.getElementById("allow-button");
	var close_button = document.getElementById("close-button");

	// Get all sent data
	var link_params = new URLSearchParams(window.location.search);
	var link_url = decodeURIComponent(link_params.get('url'));
	var link_benign = decodeURIComponent(link_params.get('benign'));
	var link_phishing = decodeURIComponent(link_params.get('phishing'));
	var features_arr = decodeURIComponent(link_params.get('features'));
	var features_string = JSON.parse(features_arr);
	var message_display = decodeURIComponent(link_params.get('message'));

	// Set title of page
	if(message_display == "phishing"){
		page_title.innerHTML = "This URL is detected as PHISHING"
	}
	else{
		page_title.innerHTML = "This URL is potentially a PHISHING SITE"
	}

	// Display url and probabilities
	received_url.innerHTML = formatURL(link_url, 30); 
	phishing_percent.innerHTML = (link_phishing * 100).toFixed(2) + "%";
	benign_percent.innerHTML = (link_benign * 100).toFixed(2) + "%";
	
	// List the features
	features_string.forEach(feature => {
		var liFeature = document.createElement("li");
		liFeature.textContent = feature;
		top_features.appendChild(liFeature); 
	});

	// Block the url navigated
	function blockURL(urlItem){

		// Get blocked urls
		chrome.storage.local.get("blockedUrls", (result) => {
			const blockedUrls = result.blockedUrls || [];

			// Push the url to the list and go to blocked page
			blockedUrls.push(urlItem);
			chrome.storage.local.set({ blockedUrls }, () => {
				chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
					const messageDisplay = "blocked";
					window.location.href = `page_action.html?url=${encodeURIComponent(urlItem)}
					&message=${encodeURIComponent(messageDisplay)}`;
				});
			});
		});

	}

	// Store the url to allow user to visit it
	function allowURL(urlItem){

		// Get allowed urls
		chrome.storage.local.get("allowedUrls", (result) => {
			var allowedUrls = result.allowedUrls || [];

			// Push the url to list so user can visit it
			allowedUrls.push(urlItem);
			chrome.storage.local.set({ allowedUrls }, () => {
				var messageDisplay = "allowed"
				window.location.href = `page_action.html?url=${encodeURIComponent(urlItem)}
				&message=${encodeURIComponent(messageDisplay)}`;
			});
		});

	}

	// Add url to blocked list
	block_button.addEventListener("click", function (){
		blockURL(link_url);
	});

	// List the url in allowed
	allow_button.addEventListener("click", function (){
		allowURL(link_url);
	});

	// Close the page
	close_button.addEventListener("click", function (){
		window.close();
	});

});