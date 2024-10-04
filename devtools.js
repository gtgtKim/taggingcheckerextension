chrome.devtools.panels.create("Copy History", "", "panel.html", function (panel) {
  panel.onShown.addListener(function (window) {
    chrome.runtime.sendMessage({ action: "panelOpened" });
  });
  panel.onHidden.addListener(function (window) {
    chrome.runtime.sendMessage({ action: "panelClosed" });
  });
});
var port = chrome.runtime.connect({ name: "devtools" });
