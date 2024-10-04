var port = chrome.runtime.connect({ name: "devtools" });

var isPanelOpen = false;
var attrNames = [];
var copyCounts = [];
var lastCopiedText = ""; // 마지막으로 받은 메시지 저장

// 유니코드 문자열을 안전하게 Base64로 변환하는 헬퍼 함수
function safeBtoa(input) {
  const utf8Bytes = new TextEncoder().encode(input);
  let binary = "";
  utf8Bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

port.onMessage.addListener(function (msg) {
  if (msg.action === "copyMade" || msg.action === "panelOpened") {
    getData(() => {
      if (msg.action === "panelOpened") {
        isPanelOpen = true;
        updateTable(msg.action);
      } else if (copyCounts[copyCounts.length - 1].count > 1) {
        updateTable(false);
      } else {
        updateTable(true);
      }
    });
  } else if (msg.action === "panelClosed") {
    isPanelOpen = false;
  }
});

function updateTable(isNewRow) {
  var copyList = document.getElementById("copy-list");
  copyList.innerHTML = "";

  // 테이블 헤더 생성
  var tableHeader = `
    <tr>
      ${attrNames.map((e) => `<th>${e}</th>`).join("")}
      <th>count</th>      
    </tr>`;
  copyList.innerHTML = tableHeader;

  // 테이블 내용 생성
  copyCounts.forEach((item, index) => {
    var row = document.createElement("tr");
    var copy = item.text ? JSON.parse(item.text) : [];

    copy.forEach((e, i) => {
      var cell = document.createElement("td");
      cell.textContent = copy[i];
      row.appendChild(cell);
    });

    var countCell = document.createElement("td");
    countCell.textContent = item.count;
    if (isNewRow === "panelOpened") {
      chrome.storage.local.get(["currentTableLength"], function (data) {
        if (data.currentTableLength - 1 < index) {
          row.classList.add("new-row");
          setTimeout(() => {
            row.classList.remove("new-row");
          }, 1000);
        }
      });
    }
    // 숫자 변경 시 효과
    else if (index === copyCounts.length - 1 && !isNewRow) {
      countCell.classList.add("highlight");
      setTimeout(() => {
        countCell.classList.remove("highlight");
      }, 200);
    }

    // 행 추가 시 효과
    else if (index === copyCounts.length - 1 && isNewRow) {
      row.classList.add("new-row");
      setTimeout(() => {
        row.classList.remove("new-row");
      }, 200);
    }

    row.appendChild(countCell);
    copyList.appendChild(row);
  });

  // 가장 마지막 행으로 스크롤
  if (copyCounts.length > 0) {
    var lastRow = copyList.lastElementChild;
    lastRow.scrollIntoView({ behavior: "smooth", block: "end" });
  }
  if (isPanelOpen) chrome.storage.local.set({ currentTableLength: copyCounts.length });
}

// HTML이 처음 로드될 때 테이블 요소를 생성
document.addEventListener("DOMContentLoaded", () => {
  var copyListContainer = document.getElementById("copy-list-container");
  var table = document.createElement("table");
  table.id = "copy-list";
  copyListContainer.appendChild(table);

  // 버튼 이벤트 리스너 추가
  var clearButton = document.getElementById("removeAllTable");
  if (clearButton) {
    clearButton.addEventListener("click", clearTableRows);
  }
});

function clearTableRows() {
  var copyList = document.getElementById("copy-list");
  var rows = copyList.getElementsByTagName("tr");

  while (rows.length > 0) {
    copyList.deleteRow(0);
  }
  copyCounts = [];
  lastCopiedText = "";
  chrome.storage.local.set({ copyCounts: [], lastCopiedText: "", currentTableLength: copyCounts.length }, function () {});
}

function getData(callback) {
  chrome.storage.local.get(["copyCounts", "lastCopiedText", "attrNames"], function (data) {
    copyCounts = data.copyCounts || [];
    lastCopiedText = data.lastCopiedText || "";
    attrNames = data.attrNames;
    callback();
  });
}
