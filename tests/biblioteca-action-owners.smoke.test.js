const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const EXPECTED_ACTIONS = [
  "abrir-modal-anexos",
  "agregar-planeacion",
  "crear-planeaciones",
  "descargar-anexo",
  "descargar-examen",
  "descargar-lista",
  "descargar-planeacion",
  "eliminar-anexo",
  "eliminar-bloque",
  "eliminar-examen",
  "eliminar-lista",
  "eliminar-planeacion",
  "generar-examen",
  "generar-lista",
  "retry",
  "select-conjunto",
  "switch-tab",
  "ver-anexo",
  "ver-examen",
  "ver-lista"
];

function matches(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function createEventsHarness() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  window.ExamPreview = { openBiblioteca: jest.fn() };
  window.ListaCotejoPreview = { openBiblioteca: jest.fn() };
  window.AnexoPreview = { open: jest.fn() };
  window.PlaneacionDownload = { downloadFromBiblioteca: jest.fn() };
  window.ExamDownload = { downloadFromBiblioteca: jest.fn() };
  window.ListaCotejoDownload = { downloadBiblioteca: jest.fn() };
  window.AnexoDownload = { downloadBiblioteca: jest.fn() };
  window.BibliotecaBlockDelete = { deleteFromBiblioteca: jest.fn() };
  window.PlaneacionDelete = { deleteFromBiblioteca: jest.fn() };
  window.ExamDelete = { deleteFromBiblioteca: jest.fn() };
  window.ListaCotejoDelete = { deleteFromBiblioteca: jest.fn() };
  window.AnexoDelete = { deleteFromBiblioteca: jest.fn() };

  vm.runInContext(read("js/features/biblioteca/biblioteca-events.js"), context, {
    filename: "biblioteca-events.js"
  });
  vm.runInContext("BibliotecaEvents.bind()", context);

  function click(action, dataset) {
    const button = window.document.createElement("button");
    button.dataset.bibAction = action;
    Object.assign(button.dataset, dataset);
    window.document.body.appendChild(button);
    button.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    button.remove();
  }

  return { window, click };
}

describe("Biblioteca action owners", () => {
  const events = read("js/features/biblioteca/biblioteca-events.js");
  const render = read("js/features/biblioteca/biblioteca-render.js");
  const page = read("js/pages/biblioteca.page.js");
  const dashboardHtml = read("pages/dashboard.html");

  test("mantiene 20 emitters con 20 handlers y retira los tres handlers sin emitter", () => {
    const emitters = [...new Set(matches(render, /data-bib-action="([^"]+)"/g))].sort();
    const handlers = matches(events, /case "([^"]+)"/g).sort();

    expect(emitters).toEqual(EXPECTED_ACTIONS);
    expect(handlers).toEqual(EXPECTED_ACTIONS);
    ["toggle-expand", "generar-anexo", "regenerar-anexo"].forEach((action) => {
      expect(events).not.toContain(`case "${action}"`);
      expect(render).not.toContain(`data-bib-action="${action}"`);
    });
  });

  test("despacha preview, download y delete directamente a sus owners con los mismos IDs", () => {
    const { window, click } = createEventsHarness();

    click("ver-examen", { examenId: "exam-1" });
    click("ver-lista", { listaId: "lista-1" });
    click("ver-anexo", { anexoId: "anexo-1" });
    click("descargar-planeacion", { planeacionId: "plan-1" });
    click("descargar-examen", { examenId: "exam-2" });
    click("descargar-lista", { listaId: "lista-2" });
    click("descargar-anexo", { anexoId: "anexo-2" });
    click("eliminar-bloque", { conjuntoId: "batch-1" });
    click("eliminar-planeacion", { planeacionId: "plan-2", conjuntoId: "batch-2" });
    click("eliminar-examen", { examenId: "exam-3", conjuntoId: "batch-3" });
    click("eliminar-lista", { listaId: "lista-3", conjuntoId: "batch-4" });
    click("eliminar-anexo", { anexoId: "anexo-3", conjuntoId: "batch-5" });

    expect(window.ExamPreview.openBiblioteca).toHaveBeenCalledWith("exam-1");
    expect(window.ListaCotejoPreview.openBiblioteca).toHaveBeenCalledWith("lista-1");
    expect(window.AnexoPreview.open).toHaveBeenCalledWith("anexo-1");
    expect(window.PlaneacionDownload.downloadFromBiblioteca).toHaveBeenCalledWith("plan-1");
    expect(window.ExamDownload.downloadFromBiblioteca).toHaveBeenCalledWith("exam-2");
    expect(window.ListaCotejoDownload.downloadBiblioteca).toHaveBeenCalledWith("lista-2");
    expect(window.AnexoDownload.downloadBiblioteca).toHaveBeenCalledWith("anexo-2");
    expect(window.BibliotecaBlockDelete.deleteFromBiblioteca).toHaveBeenCalledWith("batch-1");
    expect(window.PlaneacionDelete.deleteFromBiblioteca).toHaveBeenCalledWith("plan-2", "batch-2");
    expect(window.ExamDelete.deleteFromBiblioteca).toHaveBeenCalledWith("exam-3", "batch-3");
    expect(window.ListaCotejoDelete.deleteFromBiblioteca).toHaveBeenCalledWith("lista-3", "batch-4");
    expect(window.AnexoDelete.deleteFromBiblioteca).toHaveBeenCalledWith("anexo-3", "batch-5");
  });

  test("retira los wrappers de page y conserva cargados los owners activos", () => {
    [
      "bibDescargarAnexo",
      "descargarAnexoWord",
      "openBibliotecaAnexoPreview",
      "closeBibliotecaAnexoModal",
      "renderBibliotecaAnexoModal",
      "bibDescargarPlaneacion",
      "bibDescargarExamen",
      "bibDescargarLista",
      "openBibliotecaExamenPreview",
      "openBibliotecaListaPreview",
      "bibEliminarBloque",
      "bibEliminarPlaneacion",
      "bibEliminarExamen",
      "bibEliminarLista",
      "bibEliminarAnexo",
      "bibGenerarAnexo",
      "bibRegenerarAnexo"
    ].forEach((name) => expect(page).not.toMatch(new RegExp(`function\\s+${name}\\b`)));

    [
      "exam-preview.js",
      "exam-download.js",
      "exam-delete.js",
      "lista-cotejo-preview.js",
      "lista-cotejo-download.js",
      "lista-cotejo-delete.js",
      "anexo-preview.js",
      "anexo-download.js",
      "anexo-delete.js",
      "planeacion-download.js",
      "planeacion-delete.js",
      "biblioteca-block-delete.js"
    ].forEach((asset) => expect(dashboardHtml).toContain(asset));

    expect(read("js/features/examenes/exam-download.js")).not.toContain("window.downloadExamWord");
    expect(read("js/features/examenes/exam-download.js")).toContain("window.ExamDownload");
  });
});
