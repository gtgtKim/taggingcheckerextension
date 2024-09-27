let isOn = false;
let customAttri = [];
let singleSelector = false;
let devtoolsPorts = []; // devtoolsPorts를 전역 스코프에 선언
// 초기 상태 로드
chrome.storage.local.get("isOn", (data) => {
  isOn = data.isOn || false;
});

// 메시지 수신 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleState") {
    isOn = message.isOn;
    customAttri = message.customAttri;
    overflowNode = message.overflowNode;
    singleSelector = message.singleSelector;
    console.log("singleSelector", singleSelector);
    chrome.storage.local.set({ customAttri: customAttri, overflowNode: overflowNode, singleSelector: singleSelector });

    if (isOn) {
      injectScriptsToActiveTab(["b.js", "a.js"], ["a.css"]);
    } else {
      injectScriptsToActiveTab(["b.js"], [], ["a.css"]);
    }
  } else if (message.action === "historyChange" && isOn) {
    setTimeout(() => {
      customAttri = message.customAttri;
      chrome.storage.local.set({ customAttri: customAttri, overflowNode: overflowNode, singleSelector: singleSelector });
      injectScripts(sender.tab.id, ["b.js", "a.js"], ["a.css"]);
    }, 500);
  } else if (message.action === "copyMade") {
    // DevTools 패널로 메시지 전달
    devtoolsPorts.forEach((port) => {
      port.postMessage({
        action: "copyMade",
        copyText: message.copyText,
        attrNames: message.attrNames,
      });
      console.log("message.text", message.copyText);
    });
  }
});
// DevTools 포트 연결 처리
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "devtools") {
    devtoolsPorts.push(port);

    port.onDisconnect.addListener(function () {
      devtoolsPorts = devtoolsPorts.filter((p) => p !== port);
    });
  }
});
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    console.log("Keep-alive alarm triggered.");
  }
});
// 탭 업데이트 감지 (페이지 이동 또는 새로고침)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isOn && changeInfo.status === "complete") {
    injectScripts(tabId, ["b.js", "a.js"], ["a.css"]);
  }
});

// 스크립트 및 CSS를 특정 탭에 주입하는 함수
function injectScripts(tabId, scriptFiles = [], cssFiles = [], cssRemoveFiles = []) {
  // 현재 탭의 URL을 검사하여 'chrome://' 또는 'edge://' URL이면 작업을 중지
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
      console.warn("Cannot inject scripts into chrome:// or edge:// URLs");
      return; // 스크립트 주입 중지
    }

    // 안전한 경우 스크립트와 CSS를 주입
    scriptFiles.forEach((file) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [file],
      });
    });

    cssFiles.forEach((file) => {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: [file],
      });
    });

    cssRemoveFiles.forEach((file) => {
      chrome.scripting.removeCSS({
        target: { tabId: tabId },
        files: [file],
      });
    });
  });
}

// 활성 탭에 스크립트 및 CSS 주입 함수
function injectScriptsToActiveTab(scriptFiles = [], cssFiles = [], cssRemoveFiles = []) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];

      // chrome:// 또는 edge:// URL을 무시
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        console.warn("Cannot inject scripts into chrome:// or edge:// URLs");
        return;
      }

      injectScripts(tab.id, scriptFiles, cssFiles, cssRemoveFiles);
    }
  });
}
