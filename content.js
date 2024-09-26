function notifyHistoryChange() {
  chrome.runtime.sendMessage({ action: "historyChange" });
}

// history.pushState 감지
(function (history) {
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    notifyHistoryChange();
  };
})(window.history);

// history.replaceState 감지
(function (history) {
  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    notifyHistoryChange();
  };
})(window.history);

// popstate 이벤트 감지
window.addEventListener("popstate", () => {
  notifyHistoryChange();
});
