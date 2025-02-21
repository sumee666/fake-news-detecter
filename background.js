chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "analyze") {
        const textContent = message.content.trim().substring(0, 5000); // Limit text length

        fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ text: textContent })
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            sendResponse({ 
                success: true, 
                isFake: data.label === "FAKE",
                confidence: data.confidence
            });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        });

        return true;
    }
});

