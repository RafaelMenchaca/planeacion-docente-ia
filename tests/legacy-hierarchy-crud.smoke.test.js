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
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="entity-modal" class="hidden">
      <h3 id="entity-modal-title"></h3>
      <form id="entity-modal-form">
        <label id="entity-name-label"></label>
        <input id="entity-name-input" />
        <div id="entity-level-row" class="hidden">
          <select id="entity-level-select">
            <option value=""></option>
            <option value="secundaria">Secundaria</option>
          </select>
        </div>
        <div id="entity-modal-error" class="hidden"></div>
        <button id="entity-modal-submit" type="submit"></button>
        <button data-modal-close type="button">Cerrar</button>
      </form>
    </div>
  </body></html>`, {
    runScripts: "outside-only",
    url: "https://example.test/pages/dashboard.html"
  });
  const { window } = dom;
  const context = dom.getInternalVMContext();

  window.requestAnimationFrame = (callback) => callback();
  window.alert = jest.fn();
  window.syncBodyScrollLock = jest.fn();
  window.syncQuickSelectVisualState = jest.fn();
  window.formatFetchError = (error, fallback) => error?.message || fallback;
  window.getNextOrder = (items) => items.length + 1;
  window.requireNivelBaseValue = (selectId) => window.document.getElementById(selectId).value;
  window.getCurrentPlantel = jest.fn(() => ({ id: "plantel-1", nombre: "Plantel actual" }));
  window.getCurrentGrado = jest.fn(() => ({ id: "grado-1", nombre: "Segundo", nivel_base: "secundaria" }));
  window.getCurrentUnidad = jest.fn(() => ({ id: "unidad-1", nombre: "Unidad actual" }));
  window.loadPlanteles = jest.fn(async () => {});
  window.ensureGrados = jest.fn(async () => {});
  window.ensureMaterias = jest.fn(async () => {});
  window.ensureUnidades = jest.fn(async () => {});
  window.selectPlantel = jest.fn(async () => {});
  window.selectGrado = jest.fn(async () => {});
  window.selectMateria = jest.fn(async () => {});
  window.selectUnidad = jest.fn(async () => {});
  window.renderAll = jest.fn();
  window.crearPlantel = jest.fn(async () => ({ id: "plantel-new" }));
  window.actualizarPlantel = jest.fn(async () => ({}));
  window.crearGrado = jest.fn(async () => ({ id: "grado-new" }));
  window.actualizarGrado = jest.fn(async () => ({}));
  window.crearMateria = jest.fn(async () => ({ id: "materia-new" }));
  window.crearUnidad = jest.fn(async () => ({ id: "unidad-new" }));
  window.actualizarUnidad = jest.fn(async () => ({}));
  window.explorerState = {
    current: {
      level: "plantel",
      plantelId: "plantel-1",
      gradoId: "grado-1",
      materiaId: "materia-1",
      unidadId: "unidad-1"
    },
    gradosByPlantel: { "plantel-1": [] },
    unidadesByMateria: { "materia-1": [] },
    modal: { type: null, mode: "create", entityId: null, submitting: false }
  };

  run(context, "js/features/dashboard/legacy-hierarchy-crud.js");
  return { dom, window, context };
}

describe("Legacy hierarchy CRUD owner smoke", () => {
  test("abre, configura, valida y cierra el modal sin listeners propios", async () => {
    const { window, context } = createHarness();

    vm.runInContext('openEntityModal("grado")', context);
    expect(window.document.getElementById("entity-modal").classList.contains("hidden")).toBe(false);
    expect(window.document.getElementById("entity-modal-title").textContent).toBe("Nuevo grado");
    expect(window.document.getElementById("entity-level-row").classList.contains("hidden")).toBe(false);
    expect(window.document.getElementById("entity-level-select").required).toBe(true);

    await vm.runInContext("submitEntityModal({ preventDefault() {} })", context);
    expect(window.document.getElementById("entity-modal-error").textContent).toBe("Ingresa un nombre valido.");
    expect(window.crearGrado).not.toHaveBeenCalled();

    vm.runInContext("closeEntityModal()", context);
    expect(window.document.getElementById("entity-modal").classList.contains("hidden")).toBe(true);
    expect(window.explorerState.modal).toEqual({ type: null, mode: "create", entityId: null, submitting: false });
    expect(window.syncBodyScrollLock).toHaveBeenCalledTimes(2);
  });

  test("submit conserva payload, loaders técnicos y navegación legacy", async () => {
    const { window, context } = createHarness();
    vm.runInContext('openEntityModal("grado")', context);
    window.document.getElementById("entity-name-input").value = "Tercero";
    window.document.getElementById("entity-level-select").value = "secundaria";

    await vm.runInContext("submitEntityModal({ preventDefault() {} })", context);

    expect(window.ensureGrados).toHaveBeenNthCalledWith(1, "plantel-1");
    expect(window.crearGrado).toHaveBeenCalledWith({
      nombre: "Tercero",
      nivel_base: "secundaria",
      plantel_id: "plantel-1",
      orden: 1
    });
    expect(window.ensureGrados).toHaveBeenNthCalledWith(2, "plantel-1", { force: true });
    expect(window.selectGrado).toHaveBeenCalledWith("plantel-1", "grado-new");
    expect(window.document.getElementById("entity-modal-submit").hasAttribute("disabled")).toBe(false);
  });

  test("owner conserva superficie léxica consumida por Bootstrap y dispatcher", () => {
    const { context } = createHarness();
    expect(vm.runInContext("typeof openModalError", context)).toBe("function");
    expect(vm.runInContext("typeof closeEntityModal", context)).toBe("function");
    expect(vm.runInContext("typeof openEntityModal", context)).toBe("function");
    expect(vm.runInContext("typeof submitEntityModal", context)).toBe("function");
  });
});
