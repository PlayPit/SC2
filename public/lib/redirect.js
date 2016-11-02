var pageURL = chrome.extension.getURL('window_mode.html');
chrome.windows.create({ url: pageURL, type: 'popup', 'width': 370, 'height': 120 });
window.close();