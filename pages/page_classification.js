document.addEventListener("DOMContentLoaded", function(){

	// Get components from html
	const page_title = document.getElementById("page-title");
	const received_url = document.getElementById("received-url");
	const phishing_percent = document.getElementById("phishing-percent");
	const benign_percent = document.getElementById("benign-percent");
	const top_features = document.getElementById("top-features");
	const block_button = document.getElementById("block-button");
	const allow_button = document.getElementById("allow-button");
	const close_button = document.getElementById("close-button");

	// Get all sent data
	const params = new URLSearchParams(window.location.search);
	const url = decodeURIComponent(params.get('url'));
	const benign = decodeURIComponent(params.get('benign'));
	const phishing = decodeURIComponent(params.get('phishing'));
	const featuresString = decodeURIComponent(params.get('features'));
	const features = JSON.parse(featuresString);
	const message = decodeURIComponent(params.get('message'));

	// Set title of page
	if(message == "phishing"){
		page_title.innerHTML = "This URL is detected as PHISHING"
	}
	else if(message == "warning"){
		page_title.innerHTML = "This URL is potentially a PHISHING SITE"
	}

	// Display url and probabilities
	received_url.innerHTML = formatURL(url, 30); 
	phishing_percent.innerHTML = (phishing * 100).toFixed(2) + "%";
	benign_percent.innerHTML = (benign * 100).toFixed(2) + "%";
	
	// List the features
	features.forEach(feature => {
		const li = document.createElement("li");
		li.textContent = feature;
		top_features.appendChild(li); 
	});

	// Block the url navigated
	function blockURL(url){

		// Get blocked urls
		chrome.storage.local.get("blockedUrls", (result) => {
			const blockedUrls = result.blockedUrls || [];

			// Push the url to the list and go to blocked page
			blockedUrls.push(url);
			chrome.storage.local.set({ blockedUrls }, () => {
				chrome.runtime.sendMessage({ action: "applyBlockingRules" }, () => {
					const message = "blocked";
					window.location.href = `page_action.html?url=${encodeURIComponent(url)}&message=${encodeURIComponent(message)}`;
				});
			});
		});

	}

	// Store the url to allow user to visit it
	function allowURL(url){

		// Get allowed urls
		chrome.storage.local.get("allowedUrls", (result) => {
			const allowedUrls = result.allowedUrls || [];

			// Push the url to list so user can visit it
			allowedUrls.push(url);
			chrome.storage.local.set({ allowedUrls }, () => {
				const message = "allowed"
				window.location.href = `page_action.html?url=${encodeURIComponent(url)}&message=${encodeURIComponent(message)}`;
			});
		});

	}

	// Next line url 
	function formatURL(url, limit){

		// Make storage variable
		let formatted_url = '';

		// Next line every 30 characters
		for(let i = 0; i < url.length; i += limit){
			formatted_url += url.slice(i, i + limit) + '<br>';
		}

		// Return formatted
		return formatted_url;
		
	}

	// Add url to blocked
	block_button.addEventListener("click", function (){
		const params = new URLSearchParams(window.location.search);
		const url = decodeURIComponent(params.get('url'));
		blockURL(url);
	});

	// List the url in allowed
	allow_button.addEventListener("click", function (){
		const params = new URLSearchParams(window.location.search);
		const url = decodeURIComponent(params.get('url'));
		allowURL(url);
	});

	// Close the page
	close_button.addEventListener("click", function (){
		window.close();
	});

});