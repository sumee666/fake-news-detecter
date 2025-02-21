
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        const selectedText = window.getSelection().toString().trim();
        sendResponse({ 
            text: selectedText,
            hasSelection: selectedText.length > 0 
        });
    }
});
