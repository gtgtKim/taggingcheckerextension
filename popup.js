document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-button");
  const inputFields = document.querySelectorAll(".input-field");
  const overflowNode = document.getElementById("overflow-node");
  const singleSelector = document.getElementById("toggle-checkbox");

  // 현재 상태 및 입력 필드 값 로드
  chrome.storage.local.get(["isOn", "customAttri", "overflowNode", "singleSelector"], (data) => {
    const isOn = data.isOn || false;
    const savedValues = data.customAttri || [];
    const savedOverflowNode = data.overflowNode || overflowNode.value;
    const savedSingleSelector = data.singleSelector || singleSelector.checked;

    toggleButton.textContent = isOn ? "Turn Off" : "Turn On";
    setInputFieldsState(!isOn);

    // 저장된 값을 입력 필드에 설정
    inputFields.forEach((field, index) => {
      field.value = savedValues[index] || ""; // 저장된 값이 있으면 설정
    });
    overflowNode.value = savedOverflowNode;
    singleSelector.checked = savedSingleSelector;
  });

  // 토글 버튼 클릭 이벤트
  toggleButton.addEventListener("click", () => {
    chrome.storage.local.get("isOn", (data) => {
      const isOn = !(data.isOn || false);
      const customAttri = getCustomAttri(); // 입력 필드 값 저장

      chrome.storage.local.set({ isOn: isOn, customAttri: customAttri }, () => {
        toggleButton.textContent = isOn ? "Turn Off" : "Turn On";
        setInputFieldsState(!isOn);

        // 백그라운드 스크립트에 상태 변경 알림
        chrome.runtime.sendMessage({
          action: "toggleState",
          isOn: isOn,
          customAttri: customAttri,
          overflowNode: overflowNode.value,
          singleSelector: singleSelector.checked,
        });
      });
    });
  });

  // 입력창과 적용 버튼 활성/비활성화 함수
  function setInputFieldsState(isEnabled) {
    inputFields.forEach((field) => {
      field.disabled = !isEnabled;
    });
    overflowNode.disabled = !isEnabled;
    singleSelector.disabled = !isEnabled;
  }

  // 입력 필드의 값을 배열로 가져오는 함수
  function getCustomAttri() {
    return Array.from(inputFields)
      .map((field) => field.value.trim())
      .filter((value) => value !== "");
  }
});
