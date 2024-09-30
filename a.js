var attrNames = [];
var overflowNode;
var singleSelector;
var selector;
var persistTaggingMarker;
var persistTaggingMarkerFlag;
chrome.storage.local.get("overflowNode", (data) => {
  overflowNode = data.overflowNode;
});
chrome.storage.local.get("singleSelector", (data) => {
  singleSelector = data.singleSelector;
});
chrome.storage.local.get("customAttri", (data) => {
  attrNames = data.customAttri || [];
  selector = !singleSelector ? attrNames.map((name) => "[" + name + "]").join(",") : attrNames.map((name) => "[" + name + "]").join("");
  console.log("selector", selector);
  console.log("singleSelector", singleSelector);

  if (attrNames.length > 0) {
    taggingMarker(selector);
    persistTaggingMarkerFlag = true;

    persistTaggingMarker = setInterval(() => {
      if (persistTaggingMarkerFlag) taggingMarker(selector);
    }, 200);
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
    if (!el.classList.contains("gatooltip")) {
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
      tooltiptext.setAttribute("gatooltext", JSON.stringify(attrValues));

      el.classList.add("gatooltip");
      el.innerHTML = marker.outerHTML + el.innerHTML + tooltiptext.outerHTML;

      var count = 0; // 부모 요소 추가 개수 카운트

      while (el.parentElement && count < Number(overflowNode)) {
        el.classList.add("gaparent"); // 부모 요소에 클래스 추가
        count++; // 카운트 증가
        el = el.parentElement;
      }
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

    // 메시지 요소를 0.5초 후에 제거
    setTimeout(() => {
      messageDiv.remove();
    }, 500);
  }

  // Ctrl+C 키 조합이 눌렸을 때 처리
  if (event.ctrlKey && event.key === "c") {
    var hoveredTooltipText = document.querySelector(".gatooltip:hover > .gatooltiptext");
    if (hoveredTooltipText) {
      var copiedText = hoveredTooltipText.innerText.trim();
      var copiedTextToDevtools = hoveredTooltipText.getAttribute("gatooltext");
      // 클립보드에 텍스트 복사
      navigator.clipboard
        .writeText(copiedText)
        .then(() => {
          // 복사 완료 알림
          showCopyMessage(`Copy complete:\n${copiedText}`);

          // 백그라운드 스크립트로 메시지 전달
          chrome.runtime.sendMessage({
            action: "copyMade",
            copyText: copiedTextToDevtools,
            attrNames: attrNames,
          });
          console.log("Copy complete", copiedTextToDevtools);
        })
        .catch((err) => {
          console.error("텍스트 복사 실패:", err);
        });

      // 기본 복사 동작을 막음
      event.preventDefault();
    }
  }
}
