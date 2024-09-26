let isOn = false;
let customAttri = [];
let singleSelector = false;

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
}

// 활성 탭에 스크립트 및 CSS 주입 함수
function injectScriptsToActiveTab(scriptFiles = [], cssFiles = [], cssRemoveFiles = []) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      injectScripts(tabs[0].id, scriptFiles, cssFiles, cssRemoveFiles);
    }
  });
}
