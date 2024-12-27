document.getElementById("enable").addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "enable" })
});

document.getElementById("disable").addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "disable" })
});

document.getElementById("redirectToProxyman").addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "redirectToProxyman" })
});