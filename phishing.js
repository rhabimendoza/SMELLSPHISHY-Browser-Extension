document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");

document.getElementById("p1").innerHTML = `Phishing URL: ${url}`;


    console.log("Retrieved URL:", url);


    const form = document.getElementById("block-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const blockChoice = document.querySelector('input[name="block"]:checked').value;

        if (blockChoice === "yes") {
            alert("Website will be blocked.");
           
        } else {
            alert("Website will not be blocked.");
        }
        window.close(); 
    });
});