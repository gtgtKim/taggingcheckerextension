var port = chrome.runtime.connect({ name: "devtools" });

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
  if (msg.action === "copyMade") {
    attrNames = msg.attrNames;
    var copiedText = msg.copyText;
    console.log("copiedText", copiedText);

    // 마지막으로 받은 메시지와 비교
    if (copiedText === lastCopiedText) {
      updateLastCopyCount();
    } else {
      lastCopiedText = copiedText;
      addNewCopyItem(copiedText);
    }
  }
});

function updateLastCopyCount() {
  if (copyCounts.length > 0) {
    copyCounts[copyCounts.length - 1].count++;
    updateTable(false);
  }
}

function addNewCopyItem(copiedText) {
  copyCounts.push({ text: copiedText, count: 1 });
  updateTable(true);
}

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
    var copy = JSON.parse(item.text);

    copy.forEach((e, i) => {
      var cell = document.createElement("td");
      cell.textContent = copy[i];
      row.appendChild(cell);
    });

    var countCell = document.createElement("td");
    countCell.textContent = item.count;

    // 숫자 변경 시 효과
    if (index === copyCounts.length - 1 && !isNewRow) {
      countCell.classList.add("highlight");
      setTimeout(() => {
        countCell.classList.remove("highlight");
      }, 200);
    }

    // 행 추가 시 효과
    if (index === copyCounts.length - 1 && isNewRow) {
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

  while (rows.length > 1) {
    copyList.deleteRow(1);
  }
  copyCounts = [];
  lastCopiedText = "";
}
