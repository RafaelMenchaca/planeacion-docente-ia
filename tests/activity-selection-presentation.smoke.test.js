const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");

test("detail normalization retains structured activity metadata", () => {
  const source = fs.readFileSync(path.join(ROOT, "js/pages/detalle.page.js"), "utf8");
  expect(source).toContain('actividad_seleccionada: fila.actividad_seleccionada || ""');
});

function run(context, relativePath) {
  return vm.runInContext(fs.readFileSync(path.join(ROOT, relativePath), "utf8"), context, { filename: relativePath });
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

test("keeps structured activity internal while preserving it through editing", () => {
  const dom = new JSDOM(`<!doctype html><table id="tablaDetalleIA"><tbody></tbody></table>`, { runScripts: "outside-only" });
  dom.window.escapeHtml = escapeHtml;
  Object.defineProperty(dom.window.HTMLElement.prototype, "innerText", {
    configurable: true,
    get() { return this.textContent; },
    set(value) { this.textContent = value; }
  });
  const context = dom.getInternalVMContext();
  run(context, "js/ui/detalle.ui.js");

  dom.window.renderTablaIA([
    {
      tiempo_sesion: "Conocimientos previos",
      actividad_seleccionada: "Lluvia de ideas",
      actividades: "El docente plantea una consigna y organiza las aportaciones del grupo.",
      tiempo_min: "10", producto: "Ideas", instrumento: "Observación", formativa: "Diagnóstica", sumativa: "2"
    },
    {
      tiempo_sesion: "Cierre",
      actividad_seleccionada: "Evaluación y retroalimentación",
      actividades: "El docente recupera evidencias y ofrece retroalimentación.",
      tiempo_min: "10", producto: "Evidencia", instrumento: "Lista", formativa: "Cierre", sumativa: "3"
    },
    {
      tiempo_sesion: "Desarrollo", actividades: "Registro histórico sin campo estructurado.",
      tiempo_min: "30", producto: "Producto", instrumento: "Rúbrica", formativa: "Formativa", sumativa: "5"
    }
  ]);

  const rows = [...dom.window.document.querySelectorAll("tbody tr")];
  expect(rows[0].querySelector("[data-actividad-seleccionada-label]")).toBeNull();
  expect(rows[0].textContent).not.toContain("Lluvia de ideas");
  expect(rows[0].querySelector("[data-actividad-text]").textContent)
    .toBe("El docente plantea una consigna y organiza las aportaciones del grupo.");
  expect(rows[1].querySelector("[data-actividad-seleccionada-label]")).toBeNull();
  expect(rows[1].textContent).not.toContain("Evaluación y retroalimentación");
  expect(rows[2].querySelector("[data-actividad-seleccionada-label]")).toBeNull();

  const edited = dom.window.obtenerDatosTablaIA();
  expect(edited[0].actividad_seleccionada).toBe("Lluvia de ideas");
  expect(edited[2].actividad_seleccionada).toBe("");
});

test("Word export hides structured metadata and keeps descriptions and historical rows unchanged", async () => {
  const dom = new JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" });
  const { window } = dom;
  let documentHtml = "";
  window.Blob = class BlobCapture {
    constructor(parts) { documentHtml = parts.join(""); }
  };
  window.URL.createObjectURL = () => "blob:synthetic";
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = () => {};
  window.alert = jest.fn();
  window.obtenerPlaneacionDetalle = jest.fn(async () => ({
    tema: "Tema",
    tabla_ia: [
      { actividad_seleccionada: "Lluvia de ideas", actividades: "El grupo comparte aportaciones libremente." },
      { actividad_seleccionada: "Ticket de salida", actividades: "Cada estudiante entrega una respuesta." },
      { actividades: "Fila histórica." }
    ]
  }));
  window.AppUI = {
    buildDownloadSuggestedName: () => "Planeacion",
    openDownloadNameModal: async () => "planeacion"
  };
  run(dom.getInternalVMContext(), "js/features/planeaciones/planeacion-download.js");
  await window.PlaneacionDownload.downloadFromBiblioteca(1);

  expect(documentHtml).not.toContain("Lluvia de ideas");
  expect(documentHtml).not.toContain("Ticket de salida");
  expect(documentHtml.match(/El grupo comparte aportaciones libremente\./g)).toHaveLength(1);
  expect(documentHtml.match(/Cada estudiante entrega una respuesta\./g)).toHaveLength(1);
  expect(documentHtml).toContain("Fila histórica.");
});
