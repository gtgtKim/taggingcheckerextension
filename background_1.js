export function copyTextArray(port, message) {
  let attrNames, copyCounts, lastCopiedText;

  // 1. chrome.storage.local.get을 Promise로 래핑
  getData()
    .then((data) => {
      copyCounts = data.copyCounts || [];
      lastCopiedText = data.lastCopiedText || "";
      attrNames = message.attrNames;

      // 2. 메시지 비교 및 데이터 업데이트
      if (message.action === "panelOpened") {
        //
      } else if (message.copyText === lastCopiedText) {
        updateLastCopyCount();
      } else {
        lastCopiedText = message.copyText;
        addNewCopyItem(lastCopiedText);
      }

      // 3. chrome.storage.local.set을 Promise로 래핑하고 저장
      return setAndSendData();
    })
    .then(() => {
      // 저장 후 port에 메시지 보내기
      port.postMessage({ action: message.action });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // 데이터를 가져오는 함수 (Promise로 래핑)
  function getData() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["copyCounts", "lastCopiedText"], (data) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  }

  // 데이터를 저장하는 함수 (Promise로 래핑)
  function setAndSendData() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(
        {
          attrNames: attrNames,
          copyCounts: copyCounts,
          lastCopiedText: lastCopiedText,
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // 마지막 복사 횟수 업데이트
  function updateLastCopyCount() {
    if (copyCounts.length > 0) {
      copyCounts[copyCounts.length - 1].count++;
    }
  }

  // 새 복사 항목 추가
  function addNewCopyItem(copiedText) {
    copyCounts.push({ text: copiedText, count: 1 });
  }
}
