function qsAll(selector) {
  var nodes = document.querySelectorAll(selector);
  return [].slice.call(nodes);
}

function disableMarker() {
  qsAll(".gatagging-marker,.gatooltiptext").forEach(function (el) {
    el.remove();
  });
  qsAll(".gatooltip").forEach(function (el) {
    el.classList.remove("gatooltip");
  });
  qsAll(".gaparent").forEach(function (el) {
    el.classList.remove("gaparent");
  });
}

disableMarker();

if (window.copyTooltipText) {
  function removeCopyTooltipListener() {
    document.removeEventListener("keydown", copyTooltipText);
  }

  // 필요한 경우에 이벤트 리스너 제거 함수 호출
  removeCopyTooltipListener();
}
