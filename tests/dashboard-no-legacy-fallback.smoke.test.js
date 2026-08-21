const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");

describe("Dashboard without the legacy visual fallback", () => {
  const dashboardHtml = read("pages/dashboard.html");
  const dashboard = read("js/pages/dashboard.page.js");
  const bootstrap = read("js/features/dashboard/dashboard-bootstrap.js");
  const quick = read("js/features/dashboard/quick-create.js");
  const layout = read("components/layout.html");

  test("carga Biblioteca y los owners vigentes sin Explorer ni CRUD legacy", () => {
    expect(dashboardHtml).not.toContain("legacy-explorer.js");
    expect(dashboardHtml).not.toContain("legacy-hierarchy-crud.js");
    expect(fs.existsSync(path.join(rootDir, "js/features/dashboard/legacy-explorer.js"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, "js/features/dashboard/legacy-hierarchy-crud.js"))).toBe(false);
    expect(bootstrap).toContain("window.BIBLIOTECA_MODE = true");
    expect(bootstrap).toContain("await window.initBiblioteca()");
    expect(bootstrap).not.toMatch(/hydrateExplorerData|renderAll|pageshow/);

    [
      "quick-create.js",
      "biblioteca.page.js",
      "biblioteca-loader.js",
      "biblioteca-render.js",
      "biblioteca-events.js",
      "exam-generation.js",
      "lista-cotejo-generation.js",
      "anexo-generation.js",
      "planeacion-generation.js"
    ].forEach((owner) => expect(dashboardHtml).toContain(owner));
  });

  test("Quick usa el owner Biblioteca y conserva únicamente selección técnica", () => {
    expect(quick).toContain("window.BibliotecaRender?.renderContent()");
    expect(quick).not.toMatch(/renderExplorerContent|selectUnidad/);
    expect(quick).toContain('explorerState.current = { level: "unidad", plantelId, gradoId, materiaId, unidadId }');

    ["ensureGrados", "ensureMaterias", "ensureUnidades", "ensureTemas"]
      .forEach((name) => expect(dashboard).toMatch(new RegExp(`function ${name}\\b`)));
  });

  test("no deja DOM, actions, storage ni refresh del fallback", () => {
    [
      "explorer-tree",
      "explorer-breadcrumbs",
      "entity-modal",
      "unit-exam-modal",
      "lista-cotejo-confirm-modal",
      "delete-confirm-modal"
    ].forEach((hook) => expect(layout).not.toContain(`id="${hook}"`));

    const production = [dashboard, bootstrap, quick, layout].join("\n");
    [
      "archive-plantel",
      "archive-grado",
      "archive-materia",
      "archive-unidad",
      "archive-planeacion",
      "educativo.dashboard.last-location",
      "refreshExplorerAfterReturn"
    ].forEach((value) => expect(production).not.toContain(value));
  });

  test("conserva redirect Batch", () => {
    const batch = read("pages/batch.html");
    expect(batch).toContain("dashboard.html");
    expect(batch).not.toMatch(/batch\.page\.js|batch\.ui\.js|batch\.css/);
  });
});
