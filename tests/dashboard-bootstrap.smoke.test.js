const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function run(context, relativePath) {
  return vm.runInContext(read(relativePath), context, { filename: relativePath });
}

function createHarness({ layoutError = false } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="dashboard-layout-root"></div></body></html>', {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  window.fetch = jest.fn(async (resource) => {
    if (layoutError) return { ok: false, text: async () => "" };
    if (String(resource).endsWith("components/layout.html")) {
      return { ok: true, text: async () => read("components/layout.html") };
    }
    if (String(resource).endsWith("components/sidebar.html")) {
      return { ok: true, text: async () => read("components/sidebar.html") };
    }
    throw new Error(`Unexpected fetch: ${resource}`);
  });
  window.initPrivateChrome = jest.fn(async () => {});
  window.initBiblioteca = jest.fn(async () => {});
  window.QuickCreate = { bind: jest.fn() };
  window.AppUI = {
    renderProgressPill: (status, label) => `<span>${label || status}</span>`,
    statusLabelFromTone: (status) => status,
    buildDownloadSuggestedName: jest.fn(),
    openDownloadNameModal: jest.fn()
  };

  run(context, "js/features/examenes/exam-download.js");
  run(context, "js/features/examenes/exam-preview.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-download.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-preview.js");
  run(context, "js/pages/dashboard.page.js");
  run(context, "js/features/dashboard/legacy-explorer.js");
  run(context, "js/features/dashboard/legacy-hierarchy-crud.js");
  run(context, "js/features/dashboard/dashboard-bootstrap.js");

  return { dom, window, context };
}

describe("Dashboard bootstrap/bindings owner smoke", () => {
  test("conserva layout, chrome, bind único, Biblioteca y helpers compartidos", async () => {
    const { window, context } = createHarness();

    await window.initDashboardPage();

    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith("../components/layout.html");
    expect(window.initPrivateChrome).toHaveBeenCalledTimes(1);
    expect(window.QuickCreate.bind).toHaveBeenCalledTimes(1);
    expect(window.initBiblioteca).toHaveBeenCalledTimes(1);
    expect(window.BIBLIOTECA_MODE).toBe(true);
    expect(window.document.getElementById("explorer-content")).not.toBeNull();
    expect(window.document.getElementById("btn-hero-quick-create")).not.toBeNull();
    expect(vm.runInContext('isActividadDidacticaValida("Debate académico")', context)).toBe(true);

    const content = window.document.getElementById("explorer-content");
    const bibliotecaAction = window.document.createElement("button");
    bibliotecaAction.dataset.bibAction = "select-conjunto";
    content.appendChild(bibliotecaAction);

    const documentListener = jest.fn();
    window.document.addEventListener("click", documentListener);
    bibliotecaAction.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await Promise.resolve();

    expect(documentListener).toHaveBeenCalledTimes(1);

    await window.initDashboardPage();
    expect(window.QuickCreate.bind).toHaveBeenCalledTimes(1);
  });

  test("conserva bridge de preview y rama legacy desconocida sin crash", async () => {
    const { window } = createHarness();
    await window.initDashboardPage();

    const preview = jest.fn(async () => {});
    window.openListaCotejoPreview = preview;
    const content = window.document.getElementById("explorer-content");
    const previewButton = window.document.createElement("button");
    previewButton.dataset.contentAction = "preview-lista-cotejo";
    previewButton.dataset.listaId = "lista-1";
    content.appendChild(previewButton);
    previewButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(preview).toHaveBeenCalledWith("lista-1");

    const errorLog = jest.spyOn(window.console, "error").mockImplementation(() => {});
    const unknown = window.document.createElement("button");
    unknown.dataset.contentAction = "legacy-unknown";
    content.appendChild(unknown);
    unknown.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(errorLog).not.toHaveBeenCalled();
  });

  test("conserva error de layout y detiene bindings/init", async () => {
    const { window } = createHarness({ layoutError: true });
    const errorLog = jest.spyOn(window.console, "error").mockImplementation(() => {});

    await window.initDashboardPage();

    expect(window.document.getElementById("dashboard-layout-root").textContent)
      .toBe("No se pudo cargar el dashboard.");
    expect(window.initPrivateChrome).not.toHaveBeenCalled();
    expect(window.QuickCreate.bind).not.toHaveBeenCalled();
    expect(window.initBiblioteca).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(
      "Error inicializando dashboard:",
      expect.objectContaining({ message: "No se pudo cargar componente: ../components/layout.html" })
    );
  });
});
