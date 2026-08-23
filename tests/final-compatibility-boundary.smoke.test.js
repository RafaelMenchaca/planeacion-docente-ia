const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("Final classic compatibility boundary", () => {
  const quick = read("js/features/dashboard/quick-create.js");
  const bootstrap = read("js/features/dashboard/dashboard-bootstrap.js");
  const page = read("js/pages/biblioteca.page.js");
  const loader = read("js/features/biblioteca/biblioteca-loader.js");
  const render = read("js/features/biblioteca/biblioteca-render.js");
  const events = read("js/features/biblioteca/biblioteca-events.js");
  const sharedUi = read("js/ui/shared.ui.js");
  const examDownload = read("js/features/examenes/exam-download.js");
  const main = read("js/main.js");
  const dashboardHtml = read("pages/dashboard.html");

  test("conserva owners activos y retira wrappers, aliases y globals redundantes", () => {
    expect(loader).toContain("global.BibliotecaLoader = Object.freeze");
    expect(page).toContain("window.biblioteca = {");
    expect(quick).toContain("window.QuickCreate = Object.freeze");
    expect(sharedUi).toContain("window.AppUI = window.AppUI || {}");

    [
      "function normalizeGeneratedPlaneaciones(result) {\n  return window.BibliotecaLoader",
      "function applyOptimisticPlaneacionesToConjunto(batchId, planeaciones) {\n  return window.BibliotecaLoader",
      "function applyGenerationResultToPendingItems(batchId, result) {\n  return window.BibliotecaLoader",
      "function finishBibliotecaPlaneacionesGeneration(result) {\n  return window.BibliotecaLoader",
      "function loadAndRenderBiblioteca(options = {}) {\n  return window.BibliotecaLoader"
    ].forEach((wrapper) => expect(page).not.toContain(wrapper));

    expect(sharedUi).not.toMatch(/window\.(?:statusLabelFromTone|renderProgressPill)\s*=/);
    expect(render).not.toContain("window.renderBibliotecaContent");
    expect(examDownload).not.toContain("window.downloadExamWord");
    expect(`${quick}\n${bootstrap}`).not.toContain("BIBLIOTECA_MODE");
  });

  test("deja explícitas las surfaces finales de Quick y de la facade", () => {
    const quickSurface = quick.match(/window\.QuickCreate = Object\.freeze\(\{([\s\S]*?)\}\);/)?.[1] || "";
    ["open:", "close:", "bind:"].forEach((member) => expect(quickSurface).toContain(member));
    ["setPanelVisibility", "generateFromStaging"].forEach((member) => expect(quickSurface).not.toContain(member));

    [
      "pendingBatchId",
      "getConjuntos",
      "startPlaneacionesGeneration",
      "setPendingConjunto",
      "finishPlaneacionesGeneration"
    ].forEach((member) => expect(page).toContain(member));
    expect(page).not.toMatch(/^\s*(?:selectConjunto|refresh):/m);
  });

  test("mantiene 20 actions y carga owners antes del init runtime", () => {
    const emitters = [...new Set([...render.matchAll(/data-bib-action="([^"]+)"/g)].map((match) => match[1]))].sort();
    const handlers = [...events.matchAll(/case "([^"]+)"/g)].map((match) => match[1]).sort();
    expect(emitters).toHaveLength(20);
    expect(handlers).toEqual(emitters);

    const mainIndex = dashboardHtml.indexOf("../js/main.js");
    [
      "shared.ui.js",
      "quick-create.js",
      "biblioteca.page.js",
      "biblioteca-loader.js",
      "biblioteca-render.js",
      "biblioteca-events.js",
      "exam-download.js"
    ].forEach((asset) => {
      const assetIndex = dashboardHtml.indexOf(asset);
      expect(assetIndex).toBeGreaterThan(-1);
      expect(assetIndex).toBeLessThan(mainIndex);
    });
  });

  test("retira el mapping Planeación sin tocar su redirect", () => {
    expect(main).not.toMatch(/["']planeacion\.html["']\s*:/);
    const redirect = read("pages/planeacion.html");
    expect(redirect).toContain('window.location.replace("dashboard.html")');
    expect(redirect).not.toContain("main.js");
  });

  test("limpia el listener persistente del backdrop al resolver por Cancel", async () => {
    const dom = new JSDOM(`<!doctype html><html><body>
      <div id="biblioteca-confirm-modal" class="hidden">
        <div id="bib-confirm-backdrop"></div>
        <div class="biblioteca-modal-card"></div>
      </div>
    </body></html>`, { runScripts: "outside-only" });
    const { window } = dom;
    const context = dom.getInternalVMContext();
    window.escapeHtml = (value) => String(value ?? "");
    vm.runInContext(read("js/features/biblioteca/biblioteca-modal-render.js"), context);

    const backdrop = window.document.getElementById("bib-confirm-backdrop");
    const remove = jest.spyOn(backdrop, "removeEventListener");
    const confirmation = vm.runInContext('BibliotecaModalRender.showConfirm("Título", "Mensaje")', context);
    window.document.getElementById("bib-confirm-cancel").click();

    await expect(confirmation).resolves.toBe(false);
    expect(remove).toHaveBeenCalledWith("click", expect.any(Function));
  });
});
