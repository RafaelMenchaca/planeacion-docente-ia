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

async function waitFor(predicate, timeoutMs = 1000) {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) throw new Error("Timeout esperando smoke del explorer legacy");
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

function createHarness({ persistedLocation } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="dashboard-layout-root"></div></body></html>', {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  if (persistedLocation) {
    window.sessionStorage.setItem(
      "educativo.dashboard.last-location",
      JSON.stringify({ current: persistedLocation })
    );
  }

  window.requestAnimationFrame = (callback) => callback();
  window.alert = jest.fn();
  window.escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  window.fetch = jest.fn(async (resource) => {
    if (String(resource).endsWith("components/layout.html")) {
      return { ok: true, text: async () => read("components/layout.html") };
    }
    if (String(resource).endsWith("components/sidebar.html")) {
      return { ok: true, text: async () => read("components/sidebar.html") };
    }
    throw new Error(`Unexpected fetch: ${resource}`);
  });
  window.initPrivateChrome = jest.fn(async () => {});
  window.QuickCreate = {
    bind: jest.fn(),
    setPanelVisibility: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
    generateFromStaging: jest.fn()
  };
  window.AppUI = {
    renderProgressPill: (status, label) => `<span>${label || status}</span>`,
    statusLabelFromTone: (status) => status,
    buildDownloadSuggestedName: jest.fn(),
    openDownloadNameModal: jest.fn()
  };
  window.ExamPreview = {
    render: jest.fn(),
    open: jest.fn(),
    close: jest.fn()
  };
  window.ExamDownload = { download: jest.fn() };
  window.ListaCotejoPreview = {
    render: jest.fn(),
    open: jest.fn(),
    close: jest.fn()
  };
  window.ListaCotejoDownload = { download: jest.fn() };

  window.obtenerPlanteles = jest.fn(async () => [{ id: "plantel-1", nombre: "Plantel Norte" }]);
  window.obtenerGradosPorPlantel = jest.fn(async () => [{ id: "grado-1", nombre: "Segundo", nivel_base: "secundaria" }]);
  window.obtenerMateriasPorGrado = jest.fn(async () => [{ id: "materia-1", nombre: "Matemáticas" }]);
  window.obtenerUnidadesPorMateria = jest.fn(async () => [{ id: "unidad-1", nombre: "Álgebra" }]);
  window.obtenerTemasPorUnidad = jest.fn(async () => [{ id: "tema-1", titulo: "Fracciones", duracion: 50, orden: 1 }]);
  window.obtenerPlaneacionTema = jest.fn(async () => ({
    id: "plan-1",
    tema_id: "tema-1",
    batch_id: "batch-1",
    fecha_creacion: "2026-08-16T12:00:00.000Z"
  }));
  window.obtenerExamenesPorUnidad = jest.fn(async () => []);
  window.obtenerListasCotejoPorUnidad = jest.fn(async () => []);

  run(context, "js/features/examenes/exam-download.js");
  run(context, "js/features/examenes/exam-preview.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-download.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-preview.js");
  run(context, "js/pages/dashboard.page.js");
  run(context, "js/features/dashboard/legacy-explorer.js");
  run(context, "js/features/dashboard/dashboard-bootstrap.js");

  return { dom, window, context };
}

describe("Legacy explorer owner smoke", () => {
  test("fallback inicializa sin Biblioteca y conserva root→unidad", async () => {
    const { window, context } = createHarness();

    expect(window.initBiblioteca).toBeUndefined();
    await window.initDashboardPage();

    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(window.QuickCreate.bind).toHaveBeenCalledTimes(1);
    expect(window.BIBLIOTECA_MODE).not.toBe(true);
    expect(window.explorerState.current).toMatchObject({ level: "plantel", plantelId: "plantel-1" });

    await vm.runInContext("selectRoot()", context);
    expect(window.explorerState.current.level).toBe("root");
    expect(window.document.getElementById("explorer-content").textContent).toContain("Planteles");

    await vm.runInContext('selectPlantel("plantel-1")', context);
    expect(window.document.getElementById("explorer-content").textContent).toContain("Grados en Plantel Norte");

    await vm.runInContext('selectGrado("plantel-1", "grado-1")', context);
    expect(window.document.getElementById("explorer-content").textContent).toContain("Materias en Segundo");

    await vm.runInContext('selectMateria("plantel-1", "grado-1", "materia-1")', context);
    expect(window.document.getElementById("explorer-content").textContent).toContain("Unidades en Matemáticas");

    await vm.runInContext('selectUnidad("plantel-1", "grado-1", "materia-1", "unidad-1")', context);
    expect(window.explorerState.current).toEqual({
      level: "unidad",
      plantelId: "plantel-1",
      gradoId: "grado-1",
      materiaId: "materia-1",
      unidadId: "unidad-1"
    });
    expect(window.document.getElementById("explorer-content").textContent).toContain("Fracciones");
  });

  test("tree conserva expand/collapse y breadcrumbs navegan", async () => {
    const { window, context } = createHarness();
    await window.initDashboardPage();

    window.explorerState.expandedPlanteles.delete("plantel-1");
    vm.runInContext("renderSidebarTree()", context);
    const togglePlantel = window.document.querySelector('[data-tree-action="toggle-plantel"]');
    togglePlantel.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await waitFor(() => window.explorerState.expandedPlanteles.has("plantel-1"));
    expect(window.document.querySelector('[data-tree-action="toggle-grado"]')).not.toBeNull();

    window.document.querySelector('[data-tree-action="toggle-plantel"]')
      .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await waitFor(() => !window.explorerState.expandedPlanteles.has("plantel-1"));

    await vm.runInContext('selectUnidad("plantel-1", "grado-1", "materia-1", "unidad-1")', context);
    const gradoCrumb = window.document.querySelector('[data-breadcrumb-level="grado"]');
    expect(gradoCrumb.textContent).toContain("Segundo");
    gradoCrumb.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await waitFor(() => window.explorerState.current.level === "grado");
    expect(window.explorerState.current).toMatchObject({
      plantelId: "plantel-1",
      gradoId: "grado-1",
      materiaId: null,
      unidadId: null
    });
  });

  test("restaura ubicación persistida y conserva callback de Detalle", async () => {
    const { window } = createHarness({
      persistedLocation: {
        level: "unidad",
        plantelId: "plantel-1",
        gradoId: "grado-1",
        materiaId: "materia-1",
        unidadId: "unidad-1"
      }
    });

    await window.initDashboardPage();

    expect(window.explorerState.current.level).toBe("unidad");
    expect(window.document.getElementById("explorer-breadcrumbs").textContent).toContain("Álgebra");
    expect(read("js/features/dashboard/legacy-explorer.js"))
      .toContain('window.location.href = `detalle.html?id=${encodeURIComponent(planeacionId)}`');
  });
});
