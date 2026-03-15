function validateForm(tabIndex) {
  const tabs = document.getElementsByClassName("tab");
  const tab = Number.isInteger(tabIndex) ? tabs[tabIndex] : tabs[0];
  if (!tab) return true;

  const inputs = tab.querySelectorAll("input, select, textarea");
  for (const input of inputs) {
    if (input.hasAttribute("required") && !input.value) {
      return false;
    }
  }

  return true;
}

if (typeof window !== "undefined") {
  window.validateForm = validateForm;
}

if (typeof module !== "undefined") {
  module.exports = { validateForm };
}
