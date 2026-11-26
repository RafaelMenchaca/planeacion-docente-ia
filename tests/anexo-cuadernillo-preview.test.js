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

function createHarness() {
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="biblioteca-anexo-modal"><div class="biblioteca-modal-card"></div></div>
  </body></html>`, { runScripts: "outside-only", url: "https://example.test/pages/dashboard.html" });
  const { window } = dom;
  const context = dom.getInternalVMContext();
  window.escapeHtml = escapeHtml;
  window.alert = jest.fn();
  window.requireSession = jest.fn();
  window.apiObtenerAnexoDetalle = jest.fn();
  window.AppUI = {
    buildDownloadSuggestedName: jest.fn(() => "Anexo"),
    openDownloadNameModal: jest.fn(async () => "Anexo")
  };
  window.URL.createObjectURL = jest.fn(() => "blob:v1");
  window.URL.revokeObjectURL = jest.fn();
  window.HTMLAnchorElement.prototype.click = jest.fn();
  window.DocxExport = { adapters: { anexo: jest.fn(() => ({})) }, download: jest.fn(async () => { const url = window.URL.createObjectURL({}); window.URL.revokeObjectURL(url); return true; }) };
  run(context, "js/features/anexos/cuadernillo-types.js");
  run(context, "js/features/anexos/anexo-download.js");
  run(context, "js/features/anexos/anexo-preview.js");
  return { dom, window, context, card: window.document.querySelector(".biblioteca-modal-card") };
}

function general(value, mode = "backend", lines) {
  return { valor: value, modo: mode, ...(lines ? { lineas: lines } : {}) };
}

function v2Fixture() {
  return {
    id: "workbook-1",
    tipo_cuadernillo: "ejercicios_aplicacion",
    materia: "Matemáticas",
    tema: "Álgebra lineal",
    schema_version: 2,
    prompt_version: "v2_cuadernillo_segmentado",
    contenido: {
      schema_version: 2,
      titulo: "Cuadernillo <script>alert(1)</script> de Álgebra lineal",
      descripcion: "Práctica segura\ncon matrices.",
      datos_generales: {
        institucion: general("", "completar"),
        asignatura: general("Matemáticas"),
        unidad: general("Unidad 2"),
        tema: general("Álgebra lineal"),
        estudiante: general("", "completar", 1),
        grupo: general("", "completar", 1),
        fecha: general("", "completar", 1)
      },
      secciones: [
        {
          id: "practica", titulo: "Práctica", orden: 2, bloques: [
            { tipo: "actividad", titulo: "Ejercicios", modalidad: "ejercicio", instrucciones: "Resuelve.", items: [{ id: "tech-activity-id", enunciado: "Calcula A + B", opciones: ["Opción A", "Opción B"], espacio_respuesta: { lineas: 2 } }], cobertura: [987654] },
            { tipo: "procedimiento", titulo: "Método", pasos: ["Identifica los datos", "Opera la matriz"], cobertura: [2] },
            { tipo: "ejemplo_resuelto", titulo: "Ejemplo", enunciado: "Suma dos matrices", pasos: ["Alinea entradas", "Suma"], resultado: "Matriz C", interpretacion: "Cada entrada corresponde.", cobertura: [3] },
            { tipo: "proyecto", titulo: "Proyecto", producto: "Modelo matricial", instrucciones: "Construye una propuesta.", etapas: ["Planea", "Comprueba"], espacio_respuesta: { lineas: 3 }, cobertura: [4] },
            { tipo: "registro", titulo: "Registro", campos: ["Hallazgo", "Dificultad"], espacio_respuesta: { lineas: 2 }, cobertura: [5] },
            { tipo: "evaluacion", titulo: "Revisión", modalidad: "lista_cotejo", criterios: [{ id: "tech-criterion-id", texto: "Explica el procedimiento" }], escala: ["Sí", "Aún no"], cobertura: [6] },
            { tipo: "espacio_respuesta", etiqueta: "Reflexión final", lineas: 200, cobertura: [7], slot_id: "hidden-slot-id" }
          ]
        },
        {
          id: "teoria", titulo: "Fundamentos", orden: 1, bloques: [
            { tipo: "texto", titulo: "Introducción", contenido: "Las matrices organizan datos.", cobertura: [8] },
            { tipo: "lista", titulo: "Propiedades", items: ["Orden", "Dimensión"], cobertura: [9] },
            { tipo: "conceptos", titulo: "Conceptos", items: [{ termino: "Matriz", explicacion: "Arreglo rectangular", ejemplo: "Matriz 2 × 2" }], cobertura: [10] },
            { tipo: "tabla", titulo: "Comparación", columnas: ["Concepto", "Uso"], filas: [["Vector", "Dirección"], ["Matriz", "Transformación"]], cobertura: [11] }
          ]
        }
      ]
    }
  };
}

function v3Fixture() {
  const value = v2Fixture();
  value.schema_version = 3;
  value.prompt_version = "v3_cuadernillo_editorial_segmentado";
  value.contenido.schema_version = 3;
  delete value.contenido.datos_generales;
  value.contenido.secciones.flatMap((section) => section.bloques)
    .filter((block) => block.tipo === "ejemplo_resuelto")
    .forEach((block) => { block.verificacion = ["Sustituye el resultado en las condiciones originales."]; });
  return value;
}

describe("Preview web de cuadernillos v2", () => {
  test("dispatch explícito conserva v1 y rechaza formatos desconocidos", () => {
    const { window, card } = createHarness();
    const v1 = { id: "v1", titulo: "Anexo histórico", contenido: { titulo_general: "Anexo histórico", anexos: [] } };
    expect(window.AnexoPreview.detectSchemaVersion(v1)).toBe("v1");
    window.AnexoPreview.render(v1);
    expect(card.textContent).toContain("MATERIAL PARA ALUMNOS");
    expect(card.textContent).toContain("Anexo histórico");

    const unknown = { tipo_cuadernillo: "ejercicios_aplicacion", contenido: { schema_version: 4, anexos: [] } };
    expect(window.AnexoPreview.detectSchemaVersion(unknown)).toBe("unknown");
    window.AnexoPreview.render(unknown);
    expect(card.textContent).toContain("formato no es compatible");
    expect(card.textContent).not.toContain("schema_version");
  });

  test("render v2 muestra contenido estudiantil completo, ordenado y sin metadata técnica", () => {
    const { window, card } = createHarness();
    const fixture = v2Fixture();
    const original = JSON.stringify(fixture);
    window.AnexoPreview.render(fixture);

    expect(window.AnexoPreview.detectSchemaVersion(fixture)).toBe("v2");
    expect(card.classList.contains("bib-cuadernillo-preview-card")).toBe(true);
    expect(card.textContent).toContain("MATERIAL PARA ESTUDIANTES");
    expect(card.textContent).toContain("Cuadernillo de ejercicios y aplicación");
    expect(card.textContent).toContain("Asignatura: Matemáticas");
    expect(card.textContent).toContain("Tema: Álgebra lineal");
    expect(card.querySelectorAll(".bib-workbook-general-field")).toHaveLength(7);
    expect(card.querySelectorAll(".bib-workbook-section")).toHaveLength(2);
    expect([...card.querySelectorAll(".bib-workbook-section h4")].map((node) => node.textContent)).toEqual(["Fundamentos", "Práctica"]);
    ["texto", "lista", "conceptos", "tabla", "actividad", "procedimiento", "ejemplo_resuelto", "proyecto", "registro", "evaluacion", "espacio_respuesta"]
      .forEach((type) => expect(card.querySelector(`.bib-workbook-block-${type}`)).not.toBeNull());
    expect(card.querySelector("table thead th").textContent).toBe("Concepto");
    expect(card.querySelector(".bib-workbook-table-scroll")).not.toBeNull();
    expect(card.textContent).toContain("Lista de cotejo");
    expect(card.textContent).toContain("Ejercicio");
    expect(card.querySelectorAll(".bib-workbook-block-espacio_respuesta .bib-workbook-response-line")).toHaveLength(8);
    expect(card.innerHTML).not.toContain("tech-activity-id");
    expect(card.innerHTML).not.toContain("tech-criterion-id");
    expect(card.innerHTML).not.toContain("hidden-slot-id");
    expect(card.innerHTML).not.toContain("987654");
    expect(card.textContent).not.toContain("schema_version");
    expect(card.textContent).not.toContain("prompt_version");
    expect(card.textContent).not.toContain("null");
    expect(card.querySelector("script")).toBeNull();
    expect(card.innerHTML).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(JSON.stringify(fixture)).toBe(original);
    expect(window.apiObtenerAnexoDetalle).not.toHaveBeenCalled();
  });

  test("dispatch y render v3 omiten datos generales y conservan contenido pedagogico", () => {
    const { window, card } = createHarness();
    const fixture = v3Fixture();
    const procedure = fixture.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "procedimiento");
    procedure.pasos = ["Forma la matriz de coeficientes.", "Calcula el determinante principal.", "Obtén cada variable."];
    window.AnexoPreview.render(fixture);
    expect(window.AnexoPreview.detectSchemaVersion(fixture)).toBe("v3");
    expect(card.classList.contains("bib-cuadernillo-preview-card")).toBe(true);
    expect(card.querySelector(".bib-workbook-general")).toBeNull();
    expect(card.textContent).not.toContain("Datos generales");
    expect(card.textContent).toContain("Fundamentos");
    expect(card.textContent).toMatch(/Pr.*ctica/);
    expect(card.textContent).toContain("Asignatura:");
    expect(card.textContent).not.toMatch(/Autoevaluaci/);
    expect(card.textContent).toContain("Comprobación");
    expect(card.textContent).toContain("Sustituye el resultado en las condiciones originales.");
    procedure.pasos.forEach((step) => expect(card.textContent).toContain(step));
    expect(card.querySelector(".bib-workbook-example-verification")).not.toBeNull();
  });

  test("v2 historico no exige verificacion y v3 incompleto falla cerrado", () => {
    const { window, card } = createHarness();
    window.AnexoPreview.render(v2Fixture());
    expect(card.querySelector(".bib-workbook-example-verification")).toBeNull();
    const invalid = v3Fixture();
    delete invalid.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "ejemplo_resuelto").verificacion;
    window.AnexoPreview.render(invalid);
    expect(card.textContent).toContain("No se puede visualizar");
  });

  test("preview v3 presenta resultado cuantitativo verificado sin metadata interna ni LaTeX", () => {
    const { window, card } = createHarness();
    const value = v3Fixture();
    const example = value.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "ejemplo_resuelto");
    example.resultado = "x = 12/5, y = 2/5";
    example.pasos = ["Calcula x = 12/5.", "Calcula y = 2/5."];
    example.verificacion = ["Ecuación 1: 6 = 6", "Ecuación 2: 2 = 2"];
    example.matrices = [{ titulo: "Sistema lineal", columnas: ["x", "y", "b"], filas: [["2", "3", "6"], ["1", "-1", "2"]] }];
    window.AnexoPreview.render(value);
    expect(card.textContent).toContain("x = 12/5, y = 2/5");
    expect(card.textContent.split("x = 12/5, y = 2/5")).toHaveLength(2);
    expect(card.textContent).toContain("Ecuación 2: 2 = 2");
    expect(card.textContent.split("Ecuación 1: 6 = 6")).toHaveLength(2);
    expect(card.textContent.split("Ecuación 2: 2 = 2")).toHaveLength(2);
    const matrices = [...card.querySelectorAll("table")];
    expect(matrices.at(-1).textContent).toContain("2");
    expect(matrices.at(-1).textContent).toContain("x");
    expect(card.textContent).toContain("Sistema lineal");
    expect(card.innerHTML).not.toContain("familia_problema");
    expect(card.innerHTML).not.toContain("contrato_cuantitativo");
  });

  test("preview v3 muestra espacios backend para completar y clasificar sin marcadores textuales", () => {
    const { window, card } = createHarness();
    const value = v3Fixture();
    const section = value.contenido.secciones.at(-1);
    section.bloques.push(
      {
        tipo: "actividad", modalidad: "completar", instrucciones: "Identifica el término correcto.",
        items: [{ id: "complete-1", enunciado: "Escribe el término que corresponde a un arreglo rectangular.", opciones: ["matriz", "vector"], respuesta_correcta: "matriz", espacio_respuesta: { lineas: 2 } }], cobertura: [23]
      },
      {
        tipo: "tabla", columnas: ["Elemento", "Clasificación (Vector / Matriz)"],
        filas: [["Lista ordenada de componentes", ""], ["Arreglo rectangular", ""], ["Magnitud y dirección", ""], ["Organización en filas", ""]], cobertura: [26]
      }
    );
    window.AnexoPreview.render(value);
    expect(card.querySelectorAll(".bib-workbook-activity-item .bib-workbook-response-line").length).toBeGreaterThanOrEqual(2);
    expect(card.querySelectorAll('.bib-workbook-table-answer-cell[aria-label="Espacio para responder"]')).toHaveLength(4);
    expect(card.textContent).not.toContain("____");
    expect(card.textContent).not.toContain("respuesta_correcta");
    expect(card.innerHTML).not.toContain("aprendizaje_guiado:actividades_comprension");
  });

  test("cerrar y volver a renderizar funciona; Escape conserva el cierre del modal", () => {
    const { window, card } = createHarness();
    const fixture = v2Fixture();
    window.AnexoPreview.render(fixture);
    window.document.getElementById("bib-anexo-close").click();
    expect(window.document.getElementById("biblioteca-anexo-modal").classList.contains("hidden")).toBe(true);
    window.document.getElementById("biblioteca-anexo-modal").classList.remove("hidden");
    window.AnexoPreview.render(fixture);
    expect(card.textContent).toContain("Fundamentos");
    window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(window.document.getElementById("biblioteca-anexo-modal").classList.contains("hidden")).toBe(true);
  });

  test("descarga desde preview usa el exportador v2 y v1 conserva el histórico", async () => {
    jest.useFakeTimers();
    const { window } = createHarness();
    const fixture = v2Fixture();
    window.AnexoDownload.request = jest.fn(async () => true);
    window.AnexoPreview.render(fixture);
    window.document.getElementById("bib-anexo-descargar").click();
    await Promise.resolve();
    expect(window.AnexoDownload.request).toHaveBeenCalledWith(fixture);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();

    const v1 = { id: "v1", titulo: "Histórico", contenido: { titulo_general: "Histórico", anexos: [] } };
    await expect(window.AnexoDownload.download(v1, "Histórico")).resolves.toBe(true);
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("contenido v2 vacío falla de forma segura y estilos declaran estructura responsive", () => {
    const { window, card } = createHarness();
    window.AnexoPreview.render({ tipo_cuadernillo: "ejercicios_aplicacion", contenido: { schema_version: 2, titulo: "Vacío", descripcion: "Vacío", datos_generales: {}, secciones: [] } });
    expect(card.getAttribute("role")).toBeNull();
    expect(card.querySelector('[role="alert"]').textContent).toContain("contenido está incompleto");
    expect(card.textContent).not.toContain("{\"");
    const css = read("css/dashboard.css");
    expect(css).toContain(".bib-workbook-table-scroll");
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.bib-workbook-general-grid/);
  });

  test("orden clásico mantiene catálogo y download antes del owner de preview", () => {
    const html = read("pages/dashboard.html");
    const catalog = html.indexOf("cuadernillo-types.js");
    const download = html.indexOf("anexo-download.js");
    const preview = html.indexOf("anexo-preview.js");
    expect(catalog).toBeGreaterThan(-1);
    expect(catalog).toBeLessThan(download);
    expect(download).toBeLessThan(preview);
  });
});
