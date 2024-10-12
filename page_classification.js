document.addEventListener("DOMContentLoaded", function () {
const params = new URLSearchParams(window.location.search);
    
  // Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Retrieve the parameters
const url = decodeURIComponent(urlParams.get('url'));
const result = decodeURIComponent(urlParams.get('result'));
const benign = decodeURIComponent(urlParams.get('benign'));
const phishing = decodeURIComponent(urlParams.get('phishing'));

// Retrieve and parse the features parameter
const featuresString = decodeURIComponent(urlParams.get('features'));
const features = JSON.parse(featuresString); // Convert back to an object

const message = decodeURIComponent(urlParams.get('message'));


    const page_title = document.getElementById("page-title");
    const benign_percent = document.getElementById("benign-percent");
    const phishing_percent = document.getElementById("phishing-percent");
    const received_url = document.getElementById("received-url");

    if(message == "phishing"){
        page_title.innerHTML = "HELLO"
    }

    // Set content based on received data
    benign_percent.innerHTML = benign;
    phishing_percent.innerHTML = phishing; // Add this line to display phishing percentage
    received_url.innerHTML = url; // Assuming you want to display the URL somewhere
    page_title.innerHTML = message; // Set the page title or message
});