function qsAll(selector) {
  var nodes = document.querySelectorAll(selector);
  return [].slice.call(nodes);
}
if (window.persistTaggingMarker) {
  persistTaggingMarkerFlag = false;
  clearInterval(persistTaggingMarker);
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
  removeCopyTooltipListener();
}
