document.addEventListener("DOMContentLoaded", function () {
    const statusElement = document.getElementById("status");
    const textArea = document.getElementById("textInput");
    const checkButton = document.getElementById("checkNews");

    function updateStatus(message, type = 'normal', confidence = null) {
        let displayMessage = message;
        if (confidence !== null) {
            const confidencePercent = (confidence * 100).toFixed(1);
            displayMessage += `\nConfidence: ${confidencePercent}%`;
            
            
            if (confidence < 0.6) {
                displayMessage += "\n⚠️ Low confidence prediction";
            }
        }
        statusElement.textContent = displayMessage;
        statusElement.className = 'status';
        if (type !== 'normal') {
            statusElement.classList.add(type);
        }
    }

    
    updateStatus("Select text on the page or enter text below");

    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(
                tabs[0].id, 
                {action: "getSelectedText"}, 
                function(response) {
                    if (chrome.runtime.lastError) {
                        console.log("Error:", chrome.runtime.lastError);
                        return;
                    }
                    if (response && response.hasSelection) {
                        textArea.value = response.text;
                    }
                }
            );
        }
    });

    
    checkButton.addEventListener("click", async function () {
        const textToAnalyze = textArea.value.trim();

        if (!textToAnalyze) {
            updateStatus("Please enter or select some text to analyze", "error");
            return;
        }

        if (textToAnalyze.length < 20) {
            updateStatus("Please provide more text for accurate analysis", "error");
            return;
        }

        checkButton.disabled = true;
        updateStatus("Analyzing...", "loading");

        try {
            chrome.runtime.sendMessage(
                {
                    action: "analyze",
                    content: textToAnalyze
                },
                response => {
                    checkButton.disabled = false;
                    
                    if (response.success) {
                        if (response.isFake) {
                            updateStatus("🚨 This text appears to be fake news!", "warning", response.confidence);
                        } else {
                            updateStatus("✅ This text appears to be reliable.", "success", response.confidence);
                        }
                    } else {
                        updateStatus("❌ Error: " + (response.error || "Unknown error"), "error");
                    }
                }
            );
        } catch (error) {
            console.error(error);
            checkButton.disabled = false;
            updateStatus("❌ Error analyzing text", "error");
        }
    });
});
