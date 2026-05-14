// js/ui/shared.ui.js
// Funciones de UI compartidas entre dashboard.page.js y biblioteca.page.js.
// Cargado antes que ambos archivos de página para romper la dependencia circular.
// Expone window.AppUI (namespace) y aliases directos en window para compatibilidad.

window.AppUI = window.AppUI || {};

window.AppUI.statusLabelFromTone = function statusLabelFromTone(status) {
  if (status === "ready") return "Listo";
  if (status === "generating") return "Generando";
  if (status === "skipped") return "No realizado";
  if (status === "error") return "Error";
  return "En espera";
};

window.AppUI.renderProgressPill = function renderProgressPill(status, label) {
  if (label === undefined) label = window.AppUI.statusLabelFromTone(status);
  var safeLabel = typeof escapeHtml === "function"
    ? escapeHtml(label || window.AppUI.statusLabelFromTone(status))
    : String(label || window.AppUI.statusLabelFromTone(status));
  return `
    <span class="explorer-status-pill ${status}">
      <span class="explorer-status-indicator ${status}" aria-hidden="true"></span>
      <span>${safeLabel}</span>
      ${status === "generating" ? '<span class="explorer-ellipsis" aria-hidden="true">...</span>' : ""}
    </span>
  `;
};

// Aliases directos en window para compatibilidad con código existente
window.statusLabelFromTone = window.AppUI.statusLabelFromTone;
window.renderProgressPill = window.AppUI.renderProgressPill;
