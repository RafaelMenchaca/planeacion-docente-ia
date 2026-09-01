// js/ui/shared.ui.js
// Funciones de UI compartidas entre dashboard.page.js y biblioteca.page.js.
// Cargado antes que ambos archivos de página para romper la dependencia circular.
// Expone window.AppUI como namespace compartido.

window.AppUI = window.AppUI || {};

window.AppUI.showToast = function showToast(message, type) {
  var toneMap = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info:    "border-slate-200 bg-white text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error:   "border-rose-200 bg-rose-50 text-rose-700",
    danger:  "border-rose-200 bg-rose-50 text-rose-700"
  };
  var toast = document.createElement("div");
  toast.className = "fixed right-4 top-4 z-[90] rounded-xl border px-4 py-3 text-sm shadow-lg " +
    (toneMap[type] || toneMap.info);
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function () { if (toast.parentNode) toast.remove(); }, 3000);
};

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

// ---- SEARCHABLE SELECT ----

window.AppUI.enhanceSearchableSelect = function enhanceSearchableSelect(select, options) {
  if (!select || select.dataset.searchableSelectEnhanced === "true") return null;

  var settings = options || {};
  var nativeOptions = Array.from(select.options).map(function (option) {
    return {
      value: option.value,
      label: option.textContent.trim(),
      disabled: option.disabled
    };
  });
  var rowLabel = select.closest(".actividad-momento-row")
    ?.querySelector(".actividad-momento-label")?.textContent.trim() || "Actividad";
  var baseId = select.id || ("searchable-select-" + Math.random().toString(36).slice(2, 9));
  var searchId = baseId + "-search";
  var listId = baseId + "-options";

  var wrapper = document.createElement("div");
  wrapper.className = "actividad-searchable-select";
  wrapper.dataset.searchableSelect = "";
  wrapper.innerHTML =
    '<button type="button" class="actividad-searchable-trigger" aria-haspopup="listbox" aria-expanded="false">' +
      '<span data-searchable-selected></span>' +
      '<span class="actividad-searchable-chevron" aria-hidden="true">&#9662;</span>' +
    '</button>' +
    '<div class="actividad-searchable-dropdown" data-searchable-dropdown hidden>' +
      '<input type="search" class="actividad-searchable-input" autocomplete="off" ' +
        'role="combobox" aria-autocomplete="list" aria-expanded="false" />' +
      '<div class="actividad-searchable-options" role="listbox"></div>' +
      '<p class="actividad-searchable-empty" data-searchable-empty role="status" aria-live="polite" hidden></p>' +
    '</div>';

  select.dataset.searchableSelectEnhanced = "true";
  select.hidden = true;
  select.setAttribute("aria-hidden", "true");
  select.tabIndex = -1;
  select.insertAdjacentElement("afterend", wrapper);

  var trigger = wrapper.querySelector(".actividad-searchable-trigger");
  var selectedLabel = wrapper.querySelector("[data-searchable-selected]");
  var dropdown = wrapper.querySelector("[data-searchable-dropdown]");
  var searchInput = wrapper.querySelector(".actividad-searchable-input");
  var optionList = wrapper.querySelector(".actividad-searchable-options");
  var emptyState = wrapper.querySelector("[data-searchable-empty]");

  searchInput.id = searchId;
  searchInput.placeholder = settings.searchPlaceholder || "Buscar...";
  searchInput.setAttribute("aria-controls", listId);
  searchInput.setAttribute("aria-label", "Buscar actividad para " + rowLabel);
  trigger.setAttribute("aria-controls", listId);
  optionList.id = listId;
  emptyState.textContent = settings.emptyMessage || "No se encontraron opciones.";
  trigger.disabled = select.disabled;

  function normalizeSearch(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function syncSelectedValue() {
    var selected = nativeOptions.find(function (option) { return option.value === select.value; })
      || nativeOptions[0]
      || { label: "Seleccionar" };
    selectedLabel.textContent = selected.label;
    trigger.title = selected.label;
    trigger.setAttribute("aria-label", rowLabel + ": " + selected.label);
    wrapper.classList.toggle("is-filled", Boolean(select.value));
  }

  function renderOptions(queryValue) {
    var query = normalizeSearch(queryValue);
    var matchingActivities = nativeOptions.filter(function (option) {
      return option.value && (!query || normalizeSearch(option.label).includes(query));
    });
    var emptyOption = nativeOptions.find(function (option) { return option.value === ""; });
    var visibleOptions = emptyOption ? [emptyOption].concat(matchingActivities) : matchingActivities;

    optionList.replaceChildren();
    visibleOptions.forEach(function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "actividad-searchable-option";
      button.dataset.searchableOption = option.value;
      button.textContent = option.label;
      button.disabled = option.disabled;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", option.value === select.value ? "true" : "false");
      button.addEventListener("click", function () {
        select.value = option.value;
        syncSelectedValue();
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeDropdown(true);
      });
      optionList.appendChild(button);
    });

    emptyState.hidden = !query || matchingActivities.length > 0;
  }

  function openDropdown() {
    dropdown.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    searchInput.setAttribute("aria-expanded", "true");
    searchInput.value = "";
    renderOptions("");
    searchInput.focus();
  }

  function closeDropdown(restoreFocus) {
    dropdown.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.value = "";
    if (restoreFocus && wrapper.isConnected) trigger.focus();
  }

  trigger.addEventListener("click", function () {
    if (dropdown.hidden) openDropdown();
    else closeDropdown(false);
  });

  trigger.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    openDropdown();
  });

  searchInput.addEventListener("input", function () {
    renderOptions(searchInput.value);
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionList.querySelector(".actividad-searchable-option")?.focus();
      return;
    }
    if (event.key === "Enter") {
      var candidates = Array.from(optionList.querySelectorAll(".actividad-searchable-option:not(:disabled)"));
      var candidate = normalizeSearch(searchInput.value)
        ? candidates.find(function (button) { return button.dataset.searchableOption; })
        : candidates.find(function (button) { return button.getAttribute("aria-selected") === "true"; });
      if (!candidate) candidate = candidates[0];
      if (candidate) {
        event.preventDefault();
        candidate.click();
      }
    }
  });

  optionList.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDropdown(true);
  });

  wrapper.addEventListener("focusout", function () {
    setTimeout(function () {
      if (wrapper.isConnected && !wrapper.contains(document.activeElement)) closeDropdown(false);
    }, 0);
  });

  select.addEventListener("change", syncSelectedValue);
  syncSelectedValue();

  return wrapper;
};

// ---- DOWNLOAD NAME MODAL ----

window.AppUI.buildDownloadSuggestedName = function buildDownloadSuggestedName(prefix, text) {
  var clean = String(text || "").trim();
  clean = clean.replace(/[\/\\:*?"<>|]/g, "");
  clean = clean.replace(/\s+/g, "_");
  clean = clean.replace(/^_+|_+$/g, "");
  clean = clean.slice(0, 60);
  return clean ? (prefix + "_" + clean) : prefix;
};

window.AppUI.sanitizeDownloadFilename = function sanitizeDownloadFilename(raw, ext) {
  var name = String(raw || "").trim();
  name = name.replace(/[\/\\:*?"<>|]/g, "");
  name = name.replace(/\s+/g, "_");
  name = name.replace(/^_+|_+$/g, "");
  if (ext) {
    var extClean = String(ext).replace(/^\./, "").toLowerCase();
    var re = new RegExp("\\.(" + extClean + ")$", "i");
    name = name.replace(re, "");
  }
  if (!name) {
    var d = new Date();
    name = "Documento_" + d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
  }
  return name;
};

window.AppUI.openDownloadNameModal = function openDownloadNameModal(opts) {
  var suggestedName = opts.suggestedName || "Documento";
  var extension = String(opts.extension || "doc").replace(/^\./, "");

  return new Promise(function (resolve) {
    if (!document.getElementById("bib-download-name-modal")) {
      // Inject base modal CSS once so the modal works on any page without dashboard.css
      if (!document.getElementById("bib-download-modal-styles")) {
        var style = document.createElement("style");
        style.id = "bib-download-modal-styles";
        style.textContent = [
          ".biblioteca-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:50;}",
          ".biblioteca-modal-shell{position:fixed;inset:0;z-index:51;overflow-y:auto;display:flex;align-items:center;justify-content:center;padding:2rem 1rem;}",
          ".biblioteca-modal-card{width:100%;max-width:640px;border-radius:1.5rem;border:1px solid rgb(226 232 240);background:#fff;padding:1.25rem;box-shadow:0 24px 48px -12px rgba(15,23,42,.25);}",
          ".bib-confirm-card{max-width:460px;}",
          ".bib-confirm-title{margin:0;color:rgb(15 23 42);font-size:1.1rem;font-weight:800;line-height:1.25;}",
          ".bib-confirm-msg{margin:0;color:rgb(71 85 105);font-size:.875rem;line-height:1.55;}",
          ".bib-confirm-actions{display:flex;justify-content:flex-end;gap:.65rem;margin-top:.5rem;width:100%;}",
          ".bib-exam-cancel{display:inline-flex;align-items:center;justify-content:center;min-height:2.45rem;border-radius:1rem;padding:.45rem 1rem;font-size:.9rem;font-weight:800;border:1px solid rgb(203 213 225);background:#fff;color:rgb(51 65 85);cursor:pointer;}",
          ".bib-lista-submit{display:inline-flex;align-items:center;justify-content:center;min-height:2.45rem;border-radius:1rem;padding:.45rem 1.25rem;font-size:.9rem;font-weight:800;border:1px solid rgb(14 116 144);background:rgb(14 116 144);color:#fff;cursor:pointer;transition:background .15s;}",
          ".bib-lista-submit:hover{background:rgb(21 94 117);}",
          ".bib-download-modal-card{max-width:460px;width:min(92vw,460px);}",
          ".bib-download-modal-body{display:flex;flex-direction:column;gap:1rem;padding:.25rem .25rem 0;}",
          ".bib-download-modal-field{display:flex;flex-direction:column;gap:.4rem;text-align:left;}",
          ".bib-download-modal-label{font-size:.8rem;font-weight:700;color:rgb(51 65 85);}",
          ".bib-download-modal-input-row{display:flex;align-items:center;border:1px solid rgb(203 213 225);border-radius:.75rem;overflow:hidden;background:#fff;transition:border-color .15s;}",
          ".bib-download-modal-input-row:focus-within{border-color:rgb(8 145 178);}",
          ".bib-download-modal-input{flex:1;min-width:0;border:none;outline:none;background:transparent;padding:.55rem .75rem;font-size:.875rem;color:rgb(15 23 42);}",
          ".bib-download-modal-ext{padding:.55rem .75rem .55rem 0;font-size:.875rem;color:rgb(100 116 139);white-space:nowrap;flex-shrink:0;}"
        ].join("");
        document.head.appendChild(style);
      }

      var div = document.createElement("div");
      div.id = "bib-download-name-modal";
      div.className = "hidden";
      div.innerHTML =
        '<div class="biblioteca-modal-backdrop" id="bib-download-backdrop"></div>' +
        '<div class="biblioteca-modal-shell">' +
        '  <div class="biblioteca-modal-card bib-confirm-card bib-download-modal-card"></div>' +
        '</div>';
      document.body.appendChild(div);
    }

    var modal = document.getElementById("bib-download-name-modal");
    var card  = modal.querySelector(".biblioteca-modal-card");

    var safeVal = typeof escapeHtml === "function"
      ? escapeHtml(suggestedName)
      : String(suggestedName).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    card.innerHTML =
      '<div class="bib-download-modal-body">' +
        '<h3 class="bib-confirm-title">Descargar documento</h3>' +
        '<p class="bib-confirm-msg" style="max-width:none;text-align:left;">Puedes cambiar el nombre del archivo antes de descargarlo.</p>' +
        '<div class="bib-download-modal-field">' +
          '<label for="bib-download-name-input" class="bib-download-modal-label">Nombre del archivo</label>' +
          '<div class="bib-download-modal-input-row">' +
            '<input id="bib-download-name-input" type="text" class="bib-download-modal-input"' +
              ' value="' + safeVal + '" autocomplete="off" spellcheck="false" />' +
            '<span class="bib-download-modal-ext">.' + extension + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="bib-confirm-actions" style="justify-content:flex-end;">' +
          '<button type="button" id="bib-download-cancel-btn" class="bib-exam-cancel">Cancelar</button>' +
          '<button type="button" id="bib-download-ok-btn" class="bib-lista-submit">Descargar</button>' +
        '</div>' +
      '</div>';

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    var input = document.getElementById("bib-download-name-input");
    if (input) { input.focus(); input.select(); }

    function sanitize(raw) {
      return window.AppUI.sanitizeDownloadFilename(raw, extension);
    }

    function close(result) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      resolve(result);
    }

    document.getElementById("bib-download-cancel-btn")
      ?.addEventListener("click", function () { close(null); }, { once: true });
    document.getElementById("bib-download-backdrop")
      ?.addEventListener("click", function () { close(null); }, { once: true });
    document.getElementById("bib-download-ok-btn")
      ?.addEventListener("click", function () {
        var val = document.getElementById("bib-download-name-input")?.value || "";
        close(sanitize(val));
      }, { once: true });

    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          close(sanitize(input.value));
        } else if (e.key === "Escape") {
          close(null);
        }
      });
    }
  });
};
