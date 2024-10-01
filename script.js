document.addEventListener("DOMContentLoaded", function (){

    const toggleCheck = document.getElementById("toggle-check");
    const textboxContainer = document.getElementById("textbox-container");
    const manualUrl = document.getElementById("manual-url");
    const checkButton = document.getElementById("check-button");

    toggleCheck.addEventListener("change", function (){
        isOn = toggleCheck.checked;
        localStorage.setItem("isOn", isOn.toString());
        updateUI();
    });

    let isOn = localStorage.getItem("isOn") === "false" ? false : true;

    function updateUI(){
        if(isOn){
            textboxContainer.style.display = "none"; 
        } 
        else{
            textboxContainer.style.display = "block";
        }
        toggleCheck.checked = isOn;
    }

    checkButton.addEventListener("click", function (){
        const url = manualUrl.value;
        if(url){
            checkUrl(url);
        }
    });

    function checkUrl(url){
        fetch("http://localhost:5000/check_url",{ 
            method: "POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url }),
        })
        .then(response => response.json())
        .then(data =>{
            if(data.result === 1){
                showPopup("HARMFUL");
            }
            else{
                showPopup("SAFE");
            }
        })
    }

    function showPopup(message){
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.left = "50%";
        popup.style.top = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.backgroundColor = "red";
        popup.style.color = "white";
        popup.style.zIndex = "1000";
        popup.textContent = message;

        document.body.appendChild(popup);

        setTimeout(() =>{
            document.body.removeChild(popup);
        }, 3000);
    }

    updateUI();
});