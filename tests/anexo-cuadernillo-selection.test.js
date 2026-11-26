const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const run = (context, file) => vm.runInContext(read(file), context, { filename: file });
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function modalHarness({ loadCatalog = true, conjuntos } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="biblioteca-anexo-create-modal" class="hidden"><div class="biblioteca-modal-card"></div></div>
  </body></html>`, { runScripts: "outside-only", url: "https://example.test/pages/dashboard.html" });
  const { window } = dom;
  const context = dom.getInternalVMContext();
  window.escapeHtml = escapeHtml;
  window.BrowserSessionState = { registerReset: jest.fn() };
  window.BibliotecaRender = { renderContent: jest.fn() };
  window.AnexoGeneration = { generateFromBiblioteca: jest.fn() };
  window.requireSession = jest.fn(async () => ({ access_token: "token-test" }));
  if (loadCatalog) run(context, "js/features/anexos/cuadernillo-types.js");
  run(context, "js/pages/biblioteca.page.js");
  run(context, "js/features/biblioteca/biblioteca-modal-render.js");
  const fixtureConjuntos = conjuntos || [
    { id: "batch-1", anexos: [], planeaciones: [{ id: "plan-1", tema: "Álgebra" }, { id: "plan-2", tema: "Geometría" }] },
    { id: "batch-2", anexos: [], planeaciones: [{ id: "plan-3", tema: "Historia" }] }
  ];
  vm.runInContext(`bibliotecaState.conjuntos = ${JSON.stringify(fixtureConjuntos)}`, context);
  return {
    dom, window, context,
    open(batch = 0) { vm.runInContext(`openBibliotecaAnexoCreateModal(bibliotecaState.conjuntos[${batch}])`, context); },
    state() { return vm.runInContext("BibliotecaAnexoModalState.getState()", context); },
    submit() { return vm.runInContext("submitBibliotecaAnexoCreateModal()", context); }
  };
}

function check(window, planId, checked = true) {
  const input = window.document.querySelector(`[data-bib-anexo-planid="${planId}"]`);
  input.checked = checked;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
}

function choose(window, planId, typeId) {
  const input = [...window.document.querySelectorAll(`[data-bib-anexo-type-for="${planId}"]`)]
    .find((radio) => radio.value === typeId);
  input.checked = true;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
}

describe("Catálogo canónico y modal tipado de Anexos", () => {
  test("catálogo expone IDs, orden y metadata exactos", () => {
    const { window } = modalHarness();
    expect(window.CuadernilloTypes.all()).toEqual([
      expect.objectContaining({ id: "ejercicios_aplicacion", label: "Cuadernillo de ejercicios y aplicación", enfoque: "Practicar y resolver", objetivo: "Desarrollar habilidades y conocimientos mediante ejercicios progresivos, procedimientos y resolución de problemas.", orden: 1 }),
      expect.objectContaining({ id: "actividades_integradoras", label: "Cuadernillo de actividades integradoras", enfoque: "Analizar, crear y resolver", objetivo: "Promover la aplicación de conocimientos mediante situaciones problemáticas, análisis, actividades prácticas y elaboración de productos.", orden: 2 }),
      expect.objectContaining({ id: "aprendizaje_guiado", label: "Cuadernillo de aprendizaje guiado", enfoque: "Aprender y comprender", objetivo: "Proporcionar al estudiante toda la información teórica y explicativa necesaria para estudiar un tema de manera autónoma.", orden: 3 })
    ]);
    expect(window.CuadernilloTypes.isValid("Cuadernillo de aprendizaje guiado")).toBe(false);
    expect(window.CuadernilloTypes.get("otro")).toBeNull();
  });

  test("checkbox expande fieldset accesible con tres radios exclusivos y ninguno preseleccionado", () => {
    const { window, open } = modalHarness();
    open();
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(true);
    check(window, "plan-1");
    const fieldset = window.document.querySelector('[data-bib-anexo-types-for="plan-1"]');
    const radios = fieldset.querySelectorAll("input[type=radio]");
    expect(fieldset.tagName).toBe("FIELDSET");
    expect(fieldset.querySelector("legend").textContent).toContain("Álgebra");
    expect(radios).toHaveLength(3);
    expect([...radios].every((radio) => !radio.checked)).toBe(true);
    expect(new Set([...radios].map((radio) => radio.name)).size).toBe(1);
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(true);
  });

  test("interacción real change → state → rerender funciona con ID numérico grande normalizado", () => {
    const numericId = 1234567890123456;
    const { window, open, state } = modalHarness({
      conjuntos: [{ id: "batch-n", anexos: [], planeaciones: [{ id: numericId, tema: "Álgebra lineal" }] }]
    });
    open();
    const pid = String(numericId);
    const checkbox = window.document.querySelector(`[data-bib-anexo-planid="${pid}"]`);
    checkbox.click();
    expect(state().selectedPlaneacionIds).toEqual([pid]);
    expect(checkbox.isConnected).toBe(false);
    const rerenderedCheckbox = window.document.querySelector(`[data-bib-anexo-planid="${pid}"]`);
    const fieldset = window.document.querySelector(`[data-bib-anexo-types-for="${pid}"]`);
    expect(rerenderedCheckbox.checked).toBe(true);
    expect(fieldset).not.toBeNull();
    expect(fieldset.querySelectorAll("input[type=radio]")).toHaveLength(3);
    expect(fieldset.querySelectorAll("input[type=radio]:checked")).toHaveLength(0);
    const submit = window.document.getElementById("bib-anexo-create-submit");
    expect(submit.disabled).toBe(true);
    expect(submit.hasAttribute("disabled")).toBe(true);
    expect(submit.getAttribute("aria-disabled")).toBe("true");

    const radio = fieldset.querySelector('input[value="aprendizaje_guiado"]');
    radio.click();
    expect(state().tipoPorPlaneacionId).toEqual({ [pid]: "aprendizaje_guiado" });
    expect(window.document.querySelector(`input[data-bib-anexo-type-for="${pid}"][value="aprendizaje_guiado"]`).checked).toBe(true);
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(false);
    expect(window.document.getElementById("bib-anexo-create-submit").getAttribute("aria-disabled")).toBe("false");

    window.document.querySelector(`[data-bib-anexo-planid="${pid}"]`).click();
    expect(state().selectedPlaneacionIds).toEqual([]);
    expect(state().tipoPorPlaneacionId).toEqual({});
    expect(window.document.querySelector(`[data-bib-anexo-types-for="${pid}"]`)).toBeNull();
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(true);
  });

  test("cada planeación conserva su tipo y cambiar un radio no mezcla grupos", () => {
    const { window, open, state } = modalHarness();
    open();
    check(window, "plan-1");
    check(window, "plan-2");
    choose(window, "plan-1", "aprendizaje_guiado");
    choose(window, "plan-2", "ejercicios_aplicacion");
    expect(state().tipoPorPlaneacionId).toEqual({ "plan-1": "aprendizaje_guiado", "plan-2": "ejercicios_aplicacion" });
    choose(window, "plan-1", "actividades_integradoras");
    expect(state().tipoPorPlaneacionId).toEqual({ "plan-1": "actividades_integradoras", "plan-2": "ejercicios_aplicacion" });
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(false);
  });

  test("desmarcar borra el tipo; remarcar, cerrar/reabrir y cambiar bloque reinician", () => {
    const { window, context, open, state } = modalHarness();
    open();
    check(window, "plan-1");
    choose(window, "plan-1", "aprendizaje_guiado");
    check(window, "plan-1", false);
    expect(state().tipoPorPlaneacionId).toEqual({});
    check(window, "plan-1");
    expect(window.document.querySelectorAll('[data-bib-anexo-type-for="plan-1"]:checked')).toHaveLength(0);
    vm.runInContext("closeBibliotecaAnexoCreateModal()", context);
    open();
    expect(state().selectedPlaneacionIds).toEqual([]);
    expect(state().tipoPorPlaneacionId).toEqual({});
    check(window, "plan-1");
    choose(window, "plan-1", "aprendizaje_guiado");
    open(1);
    expect(state().conjuntoId).toBe("batch-2");
    expect(state().selectedPlaneacionIds).toEqual([]);
    expect(state().tipoPorPlaneacionId).toEqual({});
  });

  test("submit programático incompleto no solicita sesión y enfoca el primer radio", async () => {
    const { window, open, submit } = modalHarness();
    open();
    check(window, "plan-1");
    await submit();
    expect(window.requireSession).not.toHaveBeenCalled();
    expect(window.AnexoGeneration.generateFromBiblioteca).not.toHaveBeenCalled();
    expect(window.document.querySelector(".text-rose-700").textContent).toContain("Álgebra");
    expect(window.document.activeElement.dataset.bibAnexoTypeFor).toBe("plan-1");
  });

  test("submit completo transporta pares y neutraliza doble submit", async () => {
    const { window, open, submit, state } = modalHarness();
    let resolveSession;
    window.requireSession.mockImplementation(() => new Promise((resolve) => { resolveSession = resolve; }));
    open();
    check(window, "plan-1");
    choose(window, "plan-1", "aprendizaje_guiado");
    const first = submit();
    const second = submit();
    expect(state().submitting).toBe(true);
    expect(window.requireSession).toHaveBeenCalledTimes(1);
    expect(window.document.querySelector('[data-bib-anexo-planid="plan-1"]').disabled).toBe(true);
    expect(window.document.querySelector('[data-bib-anexo-type-for="plan-1"]').disabled).toBe(true);
    expect(window.document.getElementById("bib-anexo-create-cancel").disabled).toBe(true);
    expect(window.document.getElementById("bib-anexo-create-close").disabled).toBe(true);
    resolveSession({ access_token: "token-test" });
    await Promise.all([first, second]);
    expect(window.AnexoGeneration.generateFromBiblioteca).toHaveBeenCalledWith(expect.objectContaining({
      conjuntoId: "batch-1",
      selections: [{ planeacionId: "plan-1", tipoCuadernillo: "aprendizaje_guiado" }],
      accessToken: "token-test"
    }));
  });

  test("Escape y cierre permanecen bloqueados mientras submitting", () => {
    const { window, context, open, state } = modalHarness();
    open();
    vm.runInContext("BibliotecaAnexoModalState.setSubmitting(true)", context);
    window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(state().open).toBe(true);
    expect(vm.runInContext("closeBibliotecaAnexoCreateModal()", context)).toBe(false);
  });

  test("owner ausente falla cerrado, muestra error y nunca habilita submit", async () => {
    const { window, open, submit, state } = modalHarness({ loadCatalog: false });
    open();
    expect(window.document.querySelector(".text-rose-700").textContent).toContain("No se pudieron cargar los tipos");
    check(window, "plan-1");
    expect(state().selectedPlaneacionIds).toEqual(["plan-1"]);
    expect(window.document.querySelector('[data-bib-anexo-types-for="plan-1"] input[type=radio]')).toBeNull();
    expect(window.document.getElementById("bib-anexo-create-submit").disabled).toBe(true);
    await submit();
    expect(window.requireSession).not.toHaveBeenCalled();
    expect(window.AnexoGeneration.generateFromBiblioteca).not.toHaveBeenCalled();
  });
});

describe("Transporte, coordinación parcial y compatibilidad", () => {
  test("API envía exclusivamente planeacion_id y tipo_cuadernillo", async () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only" });
    const { window } = dom;
    window.API_BASE_URL = "https://api.test";
    window.fetch = jest.fn(async () => ({ ok: true, text: async () => '{"ok":true}' }));
    run(dom.getInternalVMContext(), "js/api/anexos.api.js");
    await window.apiGenerarAnexo("plan-1", "ejercicios_aplicacion", "token-test");
    const [, options] = window.fetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ planeacion_id: "plan-1", tipo_cuadernillo: "ejercicios_aplicacion" });
    expect(options.body).not.toMatch(/user_id|materia|nivel|tema|objetivo|enfoque|label|contenido/);
  });

  test("generación mantiene orden secuencial, continúa tras error y conserva tipo en pending", async () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only" });
    const { window } = dom;
    const context = dom.getInternalVMContext();
    window.escapeHtml = escapeHtml;
    window.BrowserSessionState = { registerReset: jest.fn() };
    window.BibliotecaRender = { renderContent: jest.fn() };
    window.BibliotecaLoader = { load: jest.fn(async () => {}) };
    window.console.warn = jest.fn();
    run(context, "js/features/anexos/cuadernillo-types.js");
    run(context, "js/pages/biblioteca.page.js");
    vm.runInContext(`bibliotecaState.conjuntos = [{id:"batch-1", anexos:[], planeaciones:[]}]`, context);
    const order = [];
    window.apiGenerarAnexo = jest.fn(async (id, tipo) => {
      order.push(`${id}:start:${tipo}`);
      await Promise.resolve();
      order.push(`${id}:end`);
      if (id === "plan-1") throw new Error("fallo seguro");
      return { anexo_id: "a-2" };
    });
    vm.runInContext("renderBibliotecaDetailInPlace = function () {};", context);
    run(context, "js/features/anexos/anexo-generation.js");
    window.AnexoGeneration.generateFromBiblioteca({
      conjuntoId: "batch-1",
      selections: [
        { planeacionId: "plan-1", tipoCuadernillo: "aprendizaje_guiado" },
        { planeacionId: "plan-2", tipoCuadernillo: "ejercicios_aplicacion" }
      ],
      planeaciones: [{ id: "plan-1", tema: "Uno" }, { id: "plan-2", tema: "Dos" }],
      accessToken: "token-test"
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(order).toEqual([
      "plan-1:start:aprendizaje_guiado", "plan-1:end",
      "plan-2:start:ejercicios_aplicacion", "plan-2:end"
    ]);
    const pending = vm.runInContext('BibliotecaAnexosPending.getItem("batch-1", "plan-1")', context);
    expect(pending).toMatchObject({ status: "error", tipoCuadernillo: "aprendizaje_guiado", tipoLabel: "Cuadernillo de aprendizaje guiado" });
    expect(window.BibliotecaLoader.load).toHaveBeenCalledTimes(1);
    expect(window.console.warn).toHaveBeenCalledWith("[anexos] generate:partial", expect.objectContaining({
      successCount: 1, errorCount: 1, totalSolicitados: 2
    }));
  });

  test.each([
    { name: "cero éxitos", outcomes: [false, false], method: "error", event: "[anexos] generate:error", successCount: 0, errorCount: 2 },
    { name: "todos exitosos", outcomes: [true, true], method: "info", event: "[anexos] generate:success", successCount: 2, errorCount: 0 }
  ])("resumen final clasifica $name sin falsos positivos", async ({ outcomes, method, event, successCount, errorCount }) => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only" });
    const { window } = dom;
    const context = dom.getInternalVMContext();
    window.escapeHtml = escapeHtml;
    window.BrowserSessionState = { registerReset: jest.fn() };
    window.BibliotecaRender = { renderContent: jest.fn() };
    window.BibliotecaLoader = { load: jest.fn(async () => {}) };
    window.console.info = jest.fn();
    window.console.warn = jest.fn();
    window.console.error = jest.fn();
    run(context, "js/features/anexos/cuadernillo-types.js");
    run(context, "js/pages/biblioteca.page.js");
    vm.runInContext(`bibliotecaState.conjuntos = [{id:"batch-1", anexos:[], planeaciones:[]}]`, context);
    let call = 0;
    window.apiGenerarAnexo = jest.fn(async () => {
      const succeeds = outcomes[call++];
      if (!succeeds) throw new Error("fallo seguro");
      return { anexo_id: `a-${call}` };
    });
    vm.runInContext("renderBibliotecaDetailInPlace = function () {};", context);
    run(context, "js/features/anexos/anexo-generation.js");

    window.AnexoGeneration.generateFromBiblioteca({
      conjuntoId: "batch-1",
      selections: [
        { planeacionId: "plan-1", tipoCuadernillo: "aprendizaje_guiado" },
        { planeacionId: "plan-2", tipoCuadernillo: "ejercicios_aplicacion" }
      ],
      planeaciones: [{ id: "plan-1", tema: "Uno" }, { id: "plan-2", tema: "Dos" }],
      accessToken: "token-test"
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.console[method]).toHaveBeenCalledWith(event, {
      batchId: "batch-1", successCount, errorCount, totalSolicitados: 2
    });
    if (successCount === 0) {
      expect(window.console.info).not.toHaveBeenCalledWith("[anexos] generate:success", expect.anything());
      expect(window.BibliotecaLoader.load).not.toHaveBeenCalled();
    } else {
      expect(window.BibliotecaLoader.load).toHaveBeenCalledTimes(1);
    }
  });

  test("cards v2 muestran label, v1 no inventa modalidad y pending conserva label", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only" });
    const { window } = dom;
    const context = dom.getInternalVMContext();
    window.escapeHtml = escapeHtml;
    window.AppUI = { renderProgressPill: (status) => `<span>${status}</span>` };
    window.BrowserSessionState = { registerReset: jest.fn() };
    window.BibliotecaRender = { renderContent: jest.fn() };
    run(context, "js/features/anexos/cuadernillo-types.js");
    run(context, "js/pages/biblioteca.page.js");
    run(context, "js/features/biblioteca/biblioteca-render.js");
    const html = vm.runInContext(`renderAnexosTab({id:"b", anexos:[
      {id:"a1",planeacion_id:"p1",tema:"V2",tipo_cuadernillo:"actividades_integradoras"},
      {id:"a2",planeacion_id:"p2",tema:"V1",tipo_cuadernillo:null}
    ], planeaciones:[]})`, context);
    expect(html).toContain("Cuadernillo de actividades integradoras");
    const v1Row = html.slice(html.indexOf("V1"));
    expect(v1Row).not.toMatch(/Cuadernillo de (ejercicios|actividades|aprendizaje)/);
    vm.runInContext(`BibliotecaAnexosPending.setBatch("b", {p3:{titulo:"Pendiente",tipoLabel:"Cuadernillo de aprendizaje guiado",status:"generating"}})`, context);
    const pendingHtml = vm.runInContext(`renderAnexosTab({id:"b", anexos:[], planeaciones:[]})`, context);
    expect(pendingHtml).toContain("Cuadernillo de aprendizaje guiado");
  });

  test("preview v2 incompleto no atraviesa export v1; v1 conserva exportación", async () => {
    jest.useFakeTimers();
    const dom = new JSDOM('<!doctype html><html><body><div id="biblioteca-anexo-modal"><div class="biblioteca-modal-card"></div></div></body></html>', { runScripts: "outside-only" });
    const { window } = dom;
    const context = dom.getInternalVMContext();
    window.escapeHtml = escapeHtml;
    window.alert = jest.fn();
    window.URL.createObjectURL = jest.fn(() => "blob:v1");
    window.URL.revokeObjectURL = jest.fn();
    window.HTMLAnchorElement.prototype.click = jest.fn();
    window.DocxExport = { adapters: { anexo: jest.fn(() => ({})) }, download: jest.fn(async () => { const url = window.URL.createObjectURL({}); window.URL.revokeObjectURL(url); return true; }) };
    run(context, "js/features/anexos/cuadernillo-types.js");
    run(context, "js/features/anexos/anexo-download.js");
    run(context, "js/features/anexos/anexo-preview.js");
    const v2 = { id: "a2", tipo_cuadernillo: "aprendizaje_guiado", contenido: { schema_version: 2, secciones: [] } };
    window.AnexoPreview.render(v2);
    expect(window.document.querySelector(".biblioteca-modal-card").textContent).toContain("contenido está incompleto");
    await expect(window.AnexoDownload.download(v2, "v2")).resolves.toBe(false);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    const v1 = { id: "a1", titulo: "Anexo v1", contenido: { titulo_general: "Anexo v1", anexos: [] } };
    window.AnexoPreview.render(v1);
    expect(window.document.querySelector(".biblioteca-modal-card").textContent).toContain("Anexo v1");
    await expect(window.AnexoDownload.download(v1, "v1")).resolves.toBe(true);
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("catálogo carga antes de API, generation, state y render en la página contractual", () => {
    const html = read("pages/dashboard.html");
    expect((html.match(/<script src="\.\.\//g) || [])).toHaveLength(47);
    const catalog = html.indexOf("cuadernillo-types.js");
    ["anexos.api.js", "anexo-generation.js", "biblioteca.page.js", "biblioteca-modal-render.js"]
      .forEach((consumer) => expect(catalog).toBeLessThan(html.indexOf(consumer)));
  });
});
