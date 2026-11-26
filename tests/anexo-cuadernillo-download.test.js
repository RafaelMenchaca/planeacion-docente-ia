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

function general(value, mode = "backend", lines) {
  return { valor: value, modo: mode, ...(lines ? { lineas: lines } : {}) };
}

function fixture(type = "ejercicios_aplicacion") {
  return {
    id: "workbook-1", tipo_cuadernillo: type, tema: "Álgebra lineal", schema_version: 2,
    prompt_version: "v2_cuadernillo_segmentado", tokens: 9999,
    contenido: {
      schema_version: 2,
      titulo: "Cuadernillo <script>alert(1)</script>",
      descripcion: "Práctica de matrices\nsin recursos externos.",
      datos_generales: {
        institucion: general("", "completar"), asignatura: general("Matemáticas"),
        unidad: general("Unidad 2"), tema: general("Álgebra lineal"),
        estudiante: general("", "completar", 1), grupo: general("", "completar", 1), fecha: general("", "completar", 1)
      },
      secciones: [
        { id: "practica", titulo: "Práctica", orden: 3, bloques: [
          { tipo: "actividad", titulo: "Ejercicios", modalidad: "ejercicio", instrucciones: "Resuelve.", items: [{ id: "hidden-activity-id", enunciado: "Calcula A+B", opciones: ["Opción 1", "Opción 2"], espacio_respuesta: { lineas: 2 } }], cobertura: [10101] },
          { tipo: "procedimiento", titulo: "Método", pasos: ["Identifica", "Resuelve"], cobertura: [2] },
          { tipo: "ejemplo_resuelto", titulo: "Ejemplo", enunciado: "Suma matrices", pasos: ["Alinea", "Suma"], resultado: "Matriz C", interpretacion: "Representa el total.", cobertura: [3] },
          { tipo: "proyecto", titulo: "Proyecto", producto: "Modelo", instrucciones: "Construye el modelo.", etapas: ["Planea", "Comprueba"], espacio_respuesta: { lineas: 3 }, cobertura: [4] },
          { tipo: "registro", titulo: "Registro", campos: ["Hallazgo", "Dificultad"], espacio_respuesta: { lineas: 2 }, cobertura: [5] },
          { tipo: "evaluacion", titulo: "Evaluación", modalidad: "lista_cotejo", criterios: [{ id: "hidden-criterion-id", texto: "Explica el método" }], escala: ["Sí", "No"], cobertura: [6] },
          { tipo: "espacio_respuesta", etiqueta: "Reflexión", lineas: 200, cobertura: [7], slot_id: "hidden-slot-id" }
        ] },
        { id: "datos_generales", titulo: "Datos generales", orden: 1, bloques: [{ tipo: "tabla", columnas: ["Campo", "Valor"], filas: [["Asignatura", "Matemáticas"]], cobertura: [1] }] },
        { id: "teoria", titulo: "Fundamentos", orden: 2, bloques: [
          { tipo: "texto", titulo: "Introducción", contenido: "Las matrices organizan datos.", cobertura: [8] },
          { tipo: "lista", titulo: "Propiedades", items: ["Dimensión", "Orden"], cobertura: [9] },
          { tipo: "conceptos", titulo: "Conceptos", items: [{ termino: "Matriz", explicacion: "Arreglo rectangular", ejemplo: "2 × 2" }], cobertura: [10] },
          { tipo: "tabla", titulo: "Comparación", columnas: ["Concepto", "Uso"], filas: [["Vector", "Dirección"], ["Matriz", "Transformación"]], cobertura: [11] }
        ] }
      ]
    }
  };
}

function v3Fixture(type = "ejercicios_aplicacion") {
  const value = fixture(type);
  value.schema_version = 3;
  value.prompt_version = "v3_cuadernillo_editorial_segmentado";
  value.contenido.schema_version = 3;
  delete value.contenido.datos_generales;
  value.contenido.secciones = value.contenido.secciones.filter((section) => section.id !== "datos_generales");
  value.contenido.secciones.flatMap((section) => section.bloques)
    .filter((block) => block.tipo === "ejemplo_resuelto")
    .forEach((block) => { block.verificacion = ["Sustituye el resultado en las condiciones originales."]; });
  return value;
}

function harness({ modalResult = "Cuadernillo_final" } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="biblioteca-anexo-modal"><div class="biblioteca-modal-card"></div></div></body></html>', { runScripts: "outside-only", url: "https://example.test/pages/dashboard.html" });
  const { window } = dom;
  const context = dom.getInternalVMContext();
  const blobs = [];
  window.escapeHtml = escapeHtml;
  window.alert = jest.fn();
  window.Blob = jest.fn((parts, options) => { const blob = { parts, type: options.type }; blobs.push(blob); return blob; });
  window.URL.createObjectURL = jest.fn(() => "blob:word");
  window.URL.revokeObjectURL = jest.fn();
  window.HTMLAnchorElement.prototype.click = jest.fn();
  window.AppUI = {
    buildDownloadSuggestedName: jest.fn((prefix, text) => `${prefix}_${text}`),
    sanitizeDownloadFilename: jest.fn((raw) => String(raw).replace(/\.doc$/i, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "Documento"),
    openDownloadNameModal: jest.fn(async () => modalResult)
  };
  window.requireSession = jest.fn(async () => ({ access_token: "test-token" }));
  window.apiObtenerAnexoDetalle = jest.fn(async () => ({ anexo: fixture() }));
  run(context, "js/features/anexos/cuadernillo-types.js");
  run(context, "js/features/anexos/anexo-download.js");
  run(context, "js/features/anexos/anexo-preview.js");
  return { dom, window, context, blobs };
}

describe("Exportación Word de cuadernillos v2", () => {
  test("dispatch es explícito para v1, v2, v3 y desconocido", () => {
    const { window } = harness();
    expect(window.AnexoDownload.detectVersion({ contenido: { anexos: [] } })).toBe("v1");
    expect(window.AnexoDownload.detectVersion(fixture())).toBe("v2");
    expect(window.AnexoDownload.detectVersion(v3Fixture())).toBe("v3");
    expect(window.AnexoDownload.detectVersion({ tipo_cuadernillo: "ejercicios_aplicacion", contenido: { schema_version: 4, anexos: [] } })).toBe("unknown");
  });

  test("Word v3 conserva contenido y metadata externa sin datos generales", () => {
    const { window } = harness();
    const value = v3Fixture();
    const procedure = value.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "procedimiento");
    procedure.pasos = ["Forma la matriz de coeficientes.", "Calcula el determinante principal.", "Obtén cada variable."];
    const html = window.AnexoDownload.buildV3WordHtml(value);
    expect(html).toContain("MATERIAL PARA ESTUDIANTES");
    expect(html).not.toContain("Datos generales");
    expect(html).not.toContain('<section class="general-data">');
    expect(html).not.toContain("Autoevaluación");
    expect(html).toContain("Fundamentos");
    expect(html).toContain("Práctica");
    expect(html).toContain("Comprobación:");
    expect(html).toContain("Sustituye el resultado en las condiciones originales.");
    procedure.pasos.forEach((step) => expect(html).toContain(step));
    expect(window.AnexoDownload.buildV2WordHtml(fixture())).not.toContain("Comprobación:");
  });

  test("Word v3 exige verificacion y escapa sus pasos", () => {
    const { window } = harness();
    const value = v3Fixture();
    const example = value.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "ejemplo_resuelto");
    example.verificacion = ["Comprueba <script>alert(1)</script> en ambas ecuaciones."];
    const html = window.AnexoDownload.buildV3WordHtml(value);
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    delete example.verificacion;
    expect(() => window.AnexoDownload.buildV3WordHtml(value)).toThrow("bloque_invalido");
  });

  test("Word v3 exporta matematicas verificadas en texto plano sin metadata interna", () => {
    const { window } = harness();
    const value = v3Fixture();
    const example = value.contenido.secciones.flatMap((section) => section.bloques).find((block) => block.tipo === "ejemplo_resuelto");
    example.resultado = "x = 12/5, y = 2/5";
    example.pasos = ["Calcula x = 12/5.", "Calcula y = 2/5."];
    example.verificacion = ["Ecuación 1: 6 = 6", "Ecuación 2: 2 = 2"];
    example.matrices = [{ titulo: "Sistema lineal", columnas: ["x", "y", "b"], filas: [["2", "3", "6"], ["1", "-1", "2"]] }];
    const html = window.AnexoDownload.buildV3WordHtml(value);
    expect(html).toContain("x = 12/5, y = 2/5");
    expect(html.split("x = 12/5, y = 2/5")).toHaveLength(2);
    expect(html).toContain("Ecuación 2: 2 = 2");
    expect(html.split("Ecuación 1: 6 = 6")).toHaveLength(2);
    expect(html.split("Ecuación 2: 2 = 2")).toHaveLength(2);
    expect(html).toContain("<table>");
    expect(html).toContain("Sistema lineal");
    expect(html).not.toContain("familia_problema");
    expect(html).not.toContain("contrato_cuantitativo");
  });

  test("Word v3 conserva espacios backend para completar y clasificar", () => {
    const { window } = harness();
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
    const html = window.AnexoDownload.buildV3WordHtml(value);
    expect(html).toContain('class="answer-lines"');
    expect((html.match(/height:28pt/g) || [])).toHaveLength(4);
    expect(html).not.toContain("actividades_comprension:26");
    expect(html).not.toContain("respuesta_correcta");
  });

  test("descarga v3 usa el mismo flujo local de Blob y cleanup", () => {
    jest.useFakeTimers();
    const { window, blobs } = harness();
    expect(window.AnexoDownload.download(v3Fixture(), "Cuadernillo v3")).toBe(true);
    expect(blobs).toHaveLength(1);
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(5000);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:word");
    jest.useRealTimers();
  });

  test.each([
    ["ejercicios_aplicacion", "Cuadernillo de ejercicios y aplicación - Álgebra lineal"],
    ["actividades_integradoras", "Cuadernillo de actividades integradoras - Álgebra lineal"],
    ["aprendizaje_guiado", "Cuadernillo de aprendizaje guiado - Álgebra lineal"]
  ])("nombre sugerido canónico para %s", (type, expected) => {
    const { window } = harness();
    expect(window.AnexoDownload.buildSuggestedFilename(fixture(type))).toBe(expected);
  });

  test("Word v2 contiene portada, datos generales una vez, secciones ordenadas y once bloques", () => {
    const { window } = harness();
    const value = fixture();
    const before = JSON.stringify(value);
    const html = window.AnexoDownload.buildV2WordHtml(value);
    expect(html).toContain("MATERIAL PARA ESTUDIANTES");
    expect(html).toContain("Cuadernillo de ejercicios y aplicación");
    expect(html).toContain("Matemáticas");
    expect(html).toContain("Álgebra lineal");
    expect((html.match(/<h2>Datos generales<\/h2>/g) || [])).toHaveLength(1);
    expect(html.indexOf('section-number">1.</span> Fundamentos')).toBeLessThan(html.indexOf('section-number">2.</span> Práctica'));
    ["Las matrices organizan datos", "Propiedades", "Arreglo rectangular", "Comparación", "Calcula A+B", "Método", "Suma matrices", "Proyecto", "Registro", "Lista de cotejo", "Reflexión"]
      .forEach((text) => expect(html).toContain(text));
    expect(html).toContain("<thead>");
    expect(html).toContain("☐");
    const answerBlock = html.match(/<div class="block answer-block">[\s\S]*?<\/div><\/section>/)?.[0] || "";
    expect((answerBlock.match(/________________________________________________________________________________/g) || [])).toHaveLength(10);
    expect(html).not.toContain("hidden-activity-id");
    expect(html).not.toContain("hidden-criterion-id");
    expect(html).not.toContain("hidden-slot-id");
    expect(html).not.toContain("10101");
    expect(html).not.toContain("schema_version");
    expect(html).not.toContain("prompt_version");
    expect(html).not.toContain("9999");
    expect(html).not.toContain("null");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toMatch(/https?:\/\//);
    expect(JSON.stringify(value)).toBe(before);
  });

  test("preview y Word conservan la misma información pedagógica esencial", () => {
    const { window } = harness();
    const value = fixture();
    window.AnexoPreview.render(value);
    const previewText = window.document.querySelector(".biblioteca-modal-card").textContent;
    const wordHtml = window.AnexoDownload.buildV2WordHtml(value);
    ["Fundamentos", "Práctica", "Las matrices organizan datos", "Calcula A+B", "Suma matrices", "Explica el método", "Reflexión"]
      .forEach((text) => {
        expect(previewText).toContain(text);
        expect(wordHtml).toContain(text);
      });
  });

  test("descarga v2 crea un Blob Word, un clic, limpia nodo y revoca URL", () => {
    jest.useFakeTimers();
    const { window, blobs } = harness();
    const initialLinks = window.document.querySelectorAll("a").length;
    expect(window.AnexoDownload.download(fixture(), "Cuadernillo final.doc")).toBe(true);
    expect(window.Blob).toHaveBeenCalledTimes(1);
    expect(blobs[0].type).toBe("application/msword");
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(window.document.querySelectorAll("a")).toHaveLength(initialLinks);
    expect(window.AppUI.sanitizeDownloadFilename).toHaveBeenCalledWith("Cuadernillo final", "doc");
    jest.advanceTimersByTime(5000);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:word");
    jest.useRealTimers();
  });

  test("card obtiene detalle, abre modal y cancelar no descarga", async () => {
    const { window } = harness({ modalResult: null });
    await expect(window.AnexoDownload.downloadBiblioteca("anexo-1")).resolves.toBe(false);
    expect(window.requireSession).toHaveBeenCalledTimes(1);
    expect(window.apiObtenerAnexoDetalle).toHaveBeenCalledWith("anexo-1", "test-token");
    expect(window.AppUI.openDownloadNameModal).toHaveBeenCalledWith(expect.objectContaining({ extension: "doc" }));
    expect(window.Blob).not.toHaveBeenCalled();
  });

  test("request desde preview usa nombre v2 y neutraliza una segunda acción", async () => {
    jest.useFakeTimers();
    let resolveModal;
    const { window } = harness();
    window.AppUI.openDownloadNameModal.mockImplementation(() => new Promise((resolve) => { resolveModal = resolve; }));
    const first = window.AnexoDownload.request(fixture());
    const second = window.AnexoDownload.request(fixture());
    await expect(second).resolves.toBe(false);
    expect(window.AppUI.openDownloadNameModal).toHaveBeenCalledTimes(1);
    resolveModal("Cuadernillo listo");
    await expect(first).resolves.toBe(true);
    expect(window.Blob).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("v2 inválido, desconocido o bloque ajeno no produce descarga parcial", () => {
    const { window } = harness();
    const unknown = { contenido: { schema_version: 9, anexos: [] } };
    expect(window.AnexoDownload.download(unknown, "x")).toBe(false);
    const invalid = fixture();
    invalid.contenido.secciones[0].bloques[0].tipo = "bloque_externo";
    expect(window.AnexoDownload.download(invalid, "x")).toBe(false);
    expect(window.Blob).not.toHaveBeenCalled();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    expect(window.HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("contenido está incompleto"));
  });

  test("v1 conserva contenido, MIME y nombre histórico", () => {
    jest.useFakeTimers();
    const { window, blobs } = harness();
    const v1 = { titulo: "Anexo histórico", materia: "Historia", tema: "México", contenido: { titulo_general: "Anexo histórico", descripcion: "Descripción", anexos: [{ numero: 1, titulo: "Actividad", instrucciones: "Lee", contenido: [{ subtitulo: "Caso", texto: "Texto histórico", preguntas: ["¿Qué ocurrió?"] }] }] } };
    expect(window.AnexoDownload.download(v1, "Anexo_editado")).toBe(true);
    expect(blobs[0].type).toBe("application/msword");
    expect(blobs[0].parts.join("")).toContain("Texto histórico");
    expect(blobs[0].parts.join("")).not.toContain("Cuadernillo de ejercicios");
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  test("la exportación vigente sigue siendo DOC y la deuda DOCX real queda documentada", () => {
    const source = read("js/features/anexos/anexo-download.js");
    const docs = [read("README.md"), read("docs/ARCHITECTURE.md"), read("docs/FRONTEND_MAP.md")].join("\n");
    expect(source).toContain('type: "application/msword"');
    expect(source).toContain('.doc`');
    expect(source).not.toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(docs).toMatch(/DOCX real/i);
    expect(docs).toMatch(/Office Open XML|librería evaluada/i);
    expect(docs).toMatch(/no (?:se simula|debe crearse) un `?\.docx`? falso/i);
  });
});
