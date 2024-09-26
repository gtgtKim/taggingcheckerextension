var attrNames = [];
var overflowNode;
var singleSelector;
var selector;
chrome.storage.local.get("overflowNode", (data) => {
  overflowNode = data.overflowNode;
});
chrome.storage.local.get("singleSelector", (data) => {
  singleSelector = data.singleSelector;
});
chrome.storage.local.get("customAttri", (data) => {
  attrNames = data.customAttri || [];
  selector = singleSelector ? "[" + attrNames[0] + "]" : attrNames.map((name) => "[" + name + "]").join(",");
  console.log("selector", selector);
  console.log("singleSelector", singleSelector);

  if (attrNames.length > 0) {
    taggingMarker(selector);
  }
});

document.addEventListener("keydown", copyTooltipText);

function qsAll(selector) {
  var nodes = document.querySelectorAll(selector);
  return [].slice.call(nodes);
}

// 태깅되었으면 표시
function taggingMarker(selector) {
  qsAll(selector).forEach(function (el) {
    var attrValues = attrNames.map(function (name) {
      return el.getAttribute(name);
    });

    var elementTop = el.getBoundingClientRect().top + window.scrollY;

    var marker = document.createElement("div");
    marker.className = "gatagging-marker";
    marker.innerHTML = "&#9989;";

    var tooltiptext = document.createElement("div");
    tooltiptext.className = "gatooltiptext gatooltip" + (elementTop > 200 ? "bottom" : "top");
    tooltiptext.innerHTML = attrValues.join("<br>");

    el.classList.add("gatooltip");
    el.innerHTML = marker.outerHTML + el.innerHTML + tooltiptext.outerHTML;

    var count = 0; // 부모 요소 추가 개수 카운트

    while (el.parentElement && count < Number(overflowNode)) {
      el = el.parentElement;
      el.classList.add("gaparent"); // 부모 요소에 클래스 추가
      count++; // 카운트 증가
    }
  });
}

function copyTooltipText(event) {
  function showCopyMessage(message) {
    // 메시지 요소 생성
    var messageDiv = document.createElement("div");
    messageDiv.className = "copy-message";
    messageDiv.innerText = message;

    // 메시지 요소를 body에 추가
    document.body.appendChild(messageDiv);

    // 메시지 요소를 2초 후에 제거
    setTimeout(() => {
      messageDiv.remove();
    }, 500);
  }
  // Ctrl+C 키 조합이 눌렸을 때 처리
  if (event.ctrlKey && event.key === "c") {
    var hoveredTooltipText = document.querySelector(".gatooltip:hover .gatooltiptext");
    if (hoveredTooltipText) {
      // 클립보드에 텍스트 복사
      navigator.clipboard
        .writeText(hoveredTooltipText.innerText)
        .then(() => {
          // 복사 완료 알림 (필요하면 표시)
          showCopyMessage(
            `copy complete:
            ${hoveredTooltipText.innerText}`
          );
        })
        .catch((err) => {
          console.error("텍스트 복사 실패:", err);
        });

      // 기본 복사 동작을 막음
      event.preventDefault();
    }
  }
}
