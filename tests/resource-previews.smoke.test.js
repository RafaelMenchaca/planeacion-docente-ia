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

function createHarness() {
  const dom = new JSDOM('<!doctype html><html><body><div id="dashboard-layout-root"></div></body></html>', {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  const examen = {
    id: "exam-1",
    titulo: "Examen Algebra",
    created_at: "2026-08-16T12:00:00.000Z",
    examen_ia: {
      titulo: "Examen Algebra",
      preguntas: [{ tipo: "opcion_multiple", pregunta: "Dos mas dos", opciones: ["3", "4"], respuesta_correcta: "4" }]
    }
  };
  const lista = {
    id: "lista-1",
    titulo: "Lista Algebra",
    tema: "Fracciones",
    criterios: [{ criterio: "Resuelve", si: 2, no: 0 }],
    total_puntos: 2
  };

  window.fetch = jest.fn(async (resource) => {
    if (String(resource).endsWith("components/layout.html")) {
      return { ok: true, text: async () => read("components/layout.html") };
    }
    throw new Error(`Unexpected fetch: ${resource}`);
  });
  window.escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  window.initPrivateChrome = jest.fn(async () => {});
  window.initBiblioteca = jest.fn(async () => {});
  window.console.debug = jest.fn();
  window.QuickCreate = { bind: jest.fn() };
  window.obtenerExamenDetalle = jest.fn(async () => examen);
  window.obtenerListaCoTejoDetalle = jest.fn(async () => lista);
  window.descargarListaCotejoWord = jest.fn();
  window.AppUI = {
    renderProgressPill: (status, label) => `<span>${label || status}</span>`,
    statusLabelFromTone: (status) => status,
    buildDownloadSuggestedName: jest.fn((prefix) => prefix),
    openDownloadNameModal: jest.fn(async () => "recurso")
  };
  window.URL.createObjectURL = jest.fn(() => "blob:exam");
  window.URL.revokeObjectURL = jest.fn();
  window.HTMLAnchorElement.prototype.click = jest.fn();

  run(context, "js/features/examenes/exam-download.js");
  run(context, "js/features/examenes/exam-preview.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-download.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-preview.js");
  run(context, "js/pages/dashboard.page.js");
  run(context, "js/features/dashboard/dashboard-bootstrap.js");

  return { dom, window, context, examen, lista };
}

describe("Resource preview/download owners and compatibility smoke", () => {
  test("Examen conserva Biblioteca, cache, render, cierre, Escape y download bridge", async () => {
    const { window } = createHarness();
    await window.initDashboardPage();

    const opening = window.ExamPreview.openBiblioteca("exam-1");
    expect(window.explorerState.examPreview.loading).toBe(true);
    expect(window.document.getElementById("unit-exam-preview-body").textContent).toContain("Cargando examen");
    await opening;
    expect(window.obtenerExamenDetalle).toHaveBeenCalledTimes(1);
    expect(window.explorerState.examenDetalleById["exam-1"]).toBeDefined();
    expect(window.document.getElementById("unit-exam-preview-modal").classList.contains("hidden")).toBe(false);
    expect(window.document.getElementById("unit-exam-preview-title").textContent).toBe("Examen Algebra");
    expect(window.document.getElementById("unit-exam-preview-body").textContent).toContain("Dos mas dos");

    window.ExamPreview.close();
    expect(window.explorerState.examPreview.open).toBe(false);
    await window.ExamPreview.openBiblioteca("exam-1");
    expect(window.obtenerExamenDetalle).toHaveBeenCalledTimes(2);

    window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(window.explorerState.examPreview.open).toBe(false);

    await window.downloadExamWord("exam-1", "examen-prueba");
    expect(window.obtenerExamenDetalle).toHaveBeenCalledTimes(2);
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:exam");
  });

  test("Lista conserva Biblioteca, render, cierre, Escape y download", async () => {
    const { window, lista } = createHarness();
    await window.initDashboardPage();

    const opening = window.ListaCotejoPreview.openBiblioteca("lista-1");
    expect(window.explorerState.listaCotejoPreview.loading).toBe(true);
    await opening;
    expect(window.obtenerListaCoTejoDetalle).toHaveBeenCalledTimes(1);
    expect(window.document.getElementById("lista-cotejo-preview-modal").classList.contains("hidden")).toBe(false);
    expect(window.document.getElementById("lista-cotejo-preview-title").textContent).toBe("Lista Algebra");
    expect(window.document.getElementById("lista-cotejo-preview-body").textContent).toContain("Resuelve");

    window.ListaCotejoPreview.close();
    await window.ListaCotejoPreview.openBiblioteca("lista-1");
    expect(window.explorerState.listaCotejoPreview.listaData.id).toBe("lista-1");

    window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(window.explorerState.listaCotejoPreview.open).toBe(false);

    await window.ListaCotejoDownload.download(lista);
    expect(window.descargarListaCotejoWord).toHaveBeenCalledWith(lista, "recurso");
  });

  test("los owners vigentes conservan sus contratos canónicos", () => {
    const { window } = createHarness();
    ["render", "openBiblioteca", "close"].forEach((name) => {
      expect(typeof window.ExamPreview[name]).toBe("function");
      expect(typeof window.ListaCotejoPreview[name]).toBe("function");
    });
    expect(typeof window.downloadExamWord).toBe("function");
  });

  test("Biblioteca conserva los fallbacks de error de Examen y Lista", async () => {
    const { window } = createHarness();
    window.console.error = jest.fn();
    await window.initDashboardPage();

    window.obtenerExamenDetalle.mockRejectedValueOnce(new Error("exam failure"));
    await window.ExamPreview.openBiblioteca("exam-error");
    expect(window.explorerState.examPreview).toMatchObject({
      open: true,
      examenId: "exam-error",
      loading: false,
      error: "No se pudo cargar el examen."
    });

    window.obtenerListaCoTejoDetalle.mockRejectedValueOnce(new Error("lista failure"));
    await window.ListaCotejoPreview.openBiblioteca("lista-error");
    expect(window.explorerState.listaCotejoPreview).toMatchObject({
      open: true,
      listaId: "lista-error",
      loading: false,
      error: "No se pudo cargar la lista de cotejo."
    });
    expect(window.console.error).toHaveBeenCalledTimes(2);
  });
});
