(function () {
  "use strict";

  function normalizeParagraphSeparators(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/\r\n?/g, "\n")
      .replace(/(?:(?:\\r\\n|\\n|\\r)){2,}/g, "\n\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  window.EditorialText = { normalizeParagraphSeparators };
})();
