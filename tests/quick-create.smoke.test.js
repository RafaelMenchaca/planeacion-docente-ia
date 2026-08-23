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
    if (Date.now() - startedAt > timeoutMs) throw new Error("Timeout esperando smoke de Quick Create");
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

function createHarness({ generationResult, generationError } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${read("components/layout.html")}</body></html>`, {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  window.requestAnimationFrame = (callback) => callback();
  window.alert = jest.fn();
  window.AppUI = {
    renderProgressPill: (status, label) => `<span>${label || status}</span>`,
    statusLabelFromTone: (status) => ({ ready: "Listo", skipped: "No realizado", error: "Error", generating: "Generando", pending: "Pendiente" }[status] || status)
  };
  window.escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  window.obtenerPlanteles = jest.fn(async () => [{ id: "plantel-1", nombre: "Mi plantel" }]);
  window.obtenerGradosPorPlantel = jest.fn(async () => [{ id: "grado-1", nombre: "Secundaria", nivel_base: "secundaria" }]);
  window.obtenerMateriasPorGrado = jest.fn(async () => [{ id: "materia-1", nombre: "Matemáticas" }]);
  window.obtenerUnidadesPorMateria = jest.fn(async () => [{ id: "unidad-1", nombre: "Bloque de planeacion" }]);
  window.obtenerTemasPorUnidad = jest.fn(async () => []);
  window.obtenerPlaneacionTema = jest.fn(async () => null);
  window.crearPlantel = jest.fn();
  window.crearGrado = jest.fn();
  window.crearMateria = jest.fn();
  window.crearUnidad = jest.fn();
  window.requireSession = jest.fn(async () => ({ access_token: "test-token" }));

  const finalResult = generationResult || {
    batch_id: "batch-real-1",
    success_count: 1,
    error_count: 0,
    planeaciones: [{ id: "plan-1", tema_id: "tema-1", tema: "Fracciones", batch_id: "batch-real-1" }]
  };
  window.generarPlaneacionesUnidadConProgreso = jest.fn(async (_payload, onEvent) => {
    onEvent({ type: "item_started", index: 1, titulo: "Fracciones" });
    if (generationError) throw generationError;
    onEvent({ type: "item_completed", index: 1, tema_id: "tema-1", planeacion_id: "plan-1", titulo: "Fracciones" });
    return finalResult;
  });
  window.apiBibliotecaConjuntos = jest.fn(async () => [{
    id: finalResult.batch_id || "batch-real-1",
    titulo: "Álgebra",
    nivel: "secundaria",
    materia: "Matemáticas",
    unidad_id: "unidad-1",
    total_planeaciones: Number(finalResult.success_count || 0),
    total_examenes: 0,
    total_listas_cotejo: 0,
    total_anexos: 0,
    planeaciones: finalResult.planeaciones || [],
    examenes: [],
    listas_cotejo: [],
    anexos: []
  }]);

  run(context, "js/features/examenes/exam-download.js");
  run(context, "js/features/examenes/exam-preview.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-download.js");
  run(context, "js/features/listas-cotejo/lista-cotejo-preview.js");
  run(context, "js/pages/dashboard.page.js");
  run(context, "js/features/dashboard/quick-create.js");
  run(context, "js/pages/biblioteca.page.js");
  run(context, "js/features/biblioteca/biblioteca-loader.js");
  run(context, "js/features/biblioteca/biblioteca-render.js");
  run(context, "js/features/biblioteca/biblioteca-modal-render.js");
  run(context, "js/features/biblioteca/biblioteca-events.js");

  window.QuickCreate.bind();

  return {
    dom,
    window,
    context,
    state: () => window.explorerState,
    bibliotecaState: () => vm.runInContext("bibliotecaState", context),
    selection: () => vm.runInContext("BibliotecaSelection.getSelectedConjuntoId()", context),
    activeTab: (id) => vm.runInContext(`BibliotecaTabs.getActiveTab(${JSON.stringify(id)})`, context)
  };
}

async function submitNewBlock(harness, temas = [{ titulo: "Fracciones", duracion: "50" }]) {
  const { window } = harness;
  await window.QuickCreate.open();
  window.document.getElementById("quick-conjunto-titulo-combobox-input").value = "Álgebra";
  const nivel = window.document.getElementById("quick-nivel-educativo-select");
  nivel.value = "secundaria";
  nivel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => window.obtenerMateriasPorGrado.mock.calls.length > 0);
  window.document.getElementById("quick-materia-combobox-input").value = "Matemáticas";

  temas.forEach((tema) => {
    window.document.getElementById("quick-tema-title").value = tema.titulo;
    window.document.getElementById("quick-tema-duration").value = tema.duracion;
    window.document.getElementById("quick-add-tema").click();
  });

  window.document.getElementById("quick-create-form")
    .dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await waitFor(() => window.generarPlaneacionesUnidadConProgreso.mock.calls.length === 1);
  await waitFor(() => harness.state().generating === false);
}

describe("Quick Create owner smoke", () => {
  test("conserva open/close/reopen y validación local", async () => {
    const harness = createHarness();
    const { window } = harness;

    await window.QuickCreate.open();
    expect(harness.state().quickCreate.open).toBe(true);
    expect(window.document.getElementById("quick-create-panel").classList.contains("hidden")).toBe(false);

    window.document.getElementById("quick-create-form")
      .dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
    expect(window.document.getElementById("quick-create-error").textContent)
      .toBe("Agrega al menos un tema antes de crear la planeacion.");
    expect(harness.state().quickCreate.open).toBe(true);

    window.QuickCreate.close();
    expect(harness.state().quickCreate.open).toBe(false);
    await window.QuickCreate.open();
    expect(harness.state().quickCreate.temas).toEqual([]);
  });

  test("reconcilia card temporal con batch real sin duplicar", async () => {
    const harness = createHarness();
    await submitNewBlock(harness);

    const generationCall = harness.window.generarPlaneacionesUnidadConProgreso.mock.calls[0][0];
    expect(generationCall.unidadId).toBe("unidad-1");
    expect(generationCall.body.batch_id).toBeUndefined();
    expect(generationCall.body.force_new_batch).toBe(true);
    expect(generationCall.body.mode).toBe("create");
    expect(generationCall.body.titulo_conjunto).toBe("Álgebra");
    expect(harness.bibliotecaState().pendingConjunto).toBeNull();
    expect(harness.bibliotecaState().pendingBatchId).toBeNull();
    expect(harness.bibliotecaState().conjuntos.map((item) => item.id)).toEqual(["batch-real-1"]);
    expect(harness.selection()).toBe("batch-real-1");
    expect(harness.activeTab("batch-real-1")).toBe("planeaciones");
  });

  test("preserva partial success y cleanup de error", async () => {
    const partial = createHarness({
      generationResult: {
        batch_id: "batch-partial",
        success_count: 1,
        error_count: 1,
        resultados: [
          { index: 1, status: "ready", planeacion_id: "plan-1", tema_id: "tema-1", titulo: "Fracciones" },
          { index: 2, status: "skipped", titulo: "Fracciones", message: "duplicate_tema" }
        ],
        planeaciones: [{ id: "plan-1", tema_id: "tema-1", tema: "Fracciones", batch_id: "batch-partial" }]
      }
    });
    await submitNewBlock(partial, [
      { titulo: "Fracciones", duracion: "50" },
      { titulo: "Fracciones", duracion: "50" }
    ]);
    expect(partial.bibliotecaState().pendingPlaneacionesByBatchId["batch-partial"].error)
      .toBe("1 planeacion(es) no se pudieron generar.");
    expect(partial.selection()).toBe("batch-partial");
    expect(partial.state().generating).toBe(false);

    const failed = createHarness({ generationError: new Error("network down") });
    await submitNewBlock(failed);
    expect(failed.state().generating).toBe(false);
    expect(failed.state().progress.finalTone).toBe("danger");
    expect(failed.state().progress.finalMessage).toBe("network down");
    expect(failed.bibliotecaState().pendingBatchId).toBeNull();
    expect(failed.bibliotecaState().pendingConjunto).not.toBeNull();
  });
});
