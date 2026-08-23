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

function createHarness({ data = [], error = null, session = { access_token: "test-token" } } = {}) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  window.requireSession = jest.fn(async () => session);
  window.apiBibliotecaConjuntos = jest.fn(async () => {
    if (error) throw error;
    return data;
  });
  window.__renderBibliotecaContent = jest.fn();
  window.AppUI = { statusLabelFromTone: (status) => status };
  window.explorerState = { progress: { items: [] } };
  vm.runInContext(`
    const BibliotecaRender = Object.freeze({
      renderContent: (...args) => window.__renderBibliotecaContent(...args)
    });
  `, context);

  run(context, "js/pages/biblioteca.page.js");
  run(context, "js/features/biblioteca/biblioteca-loader.js");

  return {
    dom,
    window,
    context,
    state: () => vm.runInContext("bibliotecaState", context),
    selection: () => vm.runInContext("BibliotecaSelection.getSelectedConjuntoId()", context),
    activeTab: (id) => vm.runInContext(`BibliotecaTabs.getActiveTab(${JSON.stringify(id)})`, context),
    setState: (source) => vm.runInContext(source, context)
  };
}

function conjunto(id, extra = {}) {
  return {
    id,
    titulo: `Bloque ${id}`,
    planeaciones: [],
    examenes: [],
    listas_cotejo: [],
    anexos: [],
    ...extra
  };
}

describe("Biblioteca loader/reconcile owner smoke", () => {
  test("conserva carga normal, loading, primer fallback y estado vacío", async () => {
    const first = createHarness({ data: [conjunto("batch-1"), conjunto("batch-2")] });
    await first.window.BibliotecaLoader.load();

    expect(first.window.requireSession).toHaveBeenCalledTimes(1);
    expect(first.window.apiBibliotecaConjuntos).toHaveBeenCalledTimes(1);
    expect(first.window.__renderBibliotecaContent).toHaveBeenCalledTimes(2);
    expect(first.state().loading).toBe(false);
    expect(first.state().error).toBe("");
    expect(first.state().conjuntos.map((item) => item.id)).toEqual(["batch-1", "batch-2"]);
    expect(first.selection()).toBe("batch-1");
    expect(first.activeTab("batch-1")).toBe("planeaciones");

    const empty = createHarness({ data: [] });
    await empty.window.BibliotecaLoader.load();
    expect(empty.state().conjuntos).toEqual([]);
    expect(empty.selection()).toBeNull();
    expect(empty.window.__renderBibliotecaContent).toHaveBeenCalledTimes(2);
  });

  test("preserva selección válida, target/tab explícitos y fallback inválido", async () => {
    const valid = createHarness({ data: [conjunto("batch-1"), conjunto("batch-2")] });
    valid.setState(`
      bibliotecaState.conjuntos = [{ id: "batch-1" }, { id: "batch-2" }];
      bibliotecaState.pendingBatchId = "batch-2";
      BibliotecaSelection.setSelectedConjuntoId("batch-2");
      BibliotecaTabs.setActiveTab("batch-2", "anexos");
    `);
    await valid.window.BibliotecaLoader.load({ silent: true });
    expect(valid.selection()).toBe("batch-2");
    expect(valid.activeTab("batch-2")).toBe("anexos");
    expect(valid.state().pendingBatchId).toBe("batch-2");
    expect(valid.window.__renderBibliotecaContent).toHaveBeenCalledTimes(1);

    await valid.window.BibliotecaLoader.load({
      silent: true,
      targetBatchId: "batch-1",
      activeTab: "examenes"
    });
    expect(valid.selection()).toBe("batch-1");
    expect(valid.activeTab("batch-1")).toBe("examenes");
    expect(valid.window.apiBibliotecaConjuntos).toHaveBeenCalledTimes(2);

    const invalid = createHarness({ data: [conjunto("batch-new")] });
    invalid.setState(`
      bibliotecaState.conjuntos = [{ id: "batch-gone" }];
      BibliotecaSelection.setSelectedConjuntoId("batch-gone");
    `);
    await invalid.window.BibliotecaLoader.load({ silent: true });
    expect(invalid.selection()).toBe("batch-new");
    expect(invalid.activeTab("batch-new")).toBe("planeaciones");
  });

  test("reconcilia pending temporal por target explícito y por diferencia de IDs", async () => {
    const explicit = createHarness({ data: [conjunto("batch-real")] });
    explicit.window.biblioteca.setPendingConjunto({
      tempId: "tmp-explicit",
      titulo: "Nuevo bloque",
      materia: "Matemáticas",
      nivel: "secundaria",
      unidad: "Bloque de planeacion"
    });
    await explicit.window.BibliotecaLoader.load({
      silent: true,
      targetBatchId: "batch-real",
      activeTab: "planeaciones"
    });
    expect(explicit.state().pendingConjunto).toBeNull();
    expect(explicit.state().conjuntos.map((item) => item.id)).toEqual(["batch-real"]);
    expect(explicit.selection()).toBe("batch-real");
    expect(explicit.activeTab("tmp-explicit")).toBeUndefined();

    const inferred = createHarness({ data: [conjunto("batch-old"), conjunto("batch-inferred")] });
    inferred.setState('bibliotecaState.conjuntos = [{ id: "batch-old" }];');
    inferred.window.biblioteca.setPendingConjunto({ tempId: "tmp-inferred", titulo: "Otro bloque" });
    await inferred.window.BibliotecaLoader.load({ silent: true });
    expect(inferred.state().pendingConjunto).toBeNull();
    expect(inferred.selection()).toBe("batch-inferred");
    expect(inferred.activeTab("batch-inferred")).toBe("planeaciones");
    expect(inferred.window.apiBibliotecaConjuntos).toHaveBeenCalledTimes(1);
  });

  test("preserva merge optimista, partial, finish/refetch y error de carga", async () => {
    const finished = createHarness({
      data: [conjunto("batch-real", {
        planeaciones: [{ id: "plan-1", tema: "Persistida" }],
        total_planeaciones: 1
      })]
    });
    finished.window.biblioteca.setPendingConjunto({ tempId: "tmp-finish", titulo: "Nuevo bloque" });
    finished.setState(`
      window.explorerState.progress.items = [
        { titulo: "Tema 1", status: "ready", statusLabel: "Listo", message: "" },
        { titulo: "Tema 2", status: "error", statusLabel: "Error", message: "falló" }
      ];
    `);

    await finished.window.biblioteca.finishPlaneacionesGeneration({
      batch_id: "batch-real",
      success_count: 1,
      error_count: 1,
      resultados: [
        { index: 1, status: "ready", planeacion_id: "plan-1", titulo: "Tema 1" },
        { index: 2, status: "error", titulo: "Tema 2", message: "falló" }
      ],
      planeaciones: [{ id: "plan-1", tema: "Optimista" }]
    });

    expect(finished.window.apiBibliotecaConjuntos).toHaveBeenCalledTimes(1);
    expect(finished.window.__renderBibliotecaContent).toHaveBeenCalledTimes(2);
    expect(finished.state().pendingConjunto).toBeNull();
    expect(finished.state().pendingPlaneacionesByBatchId["batch-real"].error)
      .toBe("1 planeacion(es) no se pudieron generar.");
    expect(finished.state().conjuntos).toHaveLength(1);
    expect(finished.state().conjuntos[0].planeaciones).toEqual([{ id: "plan-1", tema: "Persistida" }]);
    expect(finished.selection()).toBe("batch-real");
    expect(finished.activeTab("batch-real")).toBe("planeaciones");

    const failed = createHarness({ error: new Error("network down") });
    const errorLog = jest.spyOn(failed.window.console, "error").mockImplementation(() => {});
    await failed.window.BibliotecaLoader.load();
    expect(failed.state().loading).toBe(false);
    expect(failed.state().error).toBe("network down");
    expect(failed.window.apiBibliotecaConjuntos).toHaveBeenCalledTimes(1);
    expect(failed.window.__renderBibliotecaContent).toHaveBeenCalledTimes(2);
    expect(errorLog).toHaveBeenCalledWith("[biblioteca] Error al cargar conjuntos:", expect.any(Error));
  });
});
