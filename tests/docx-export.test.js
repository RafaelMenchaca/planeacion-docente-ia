const fs = require("fs");
const path = require("path");
const vm = require("vm");
const JSZip = require("jszip");
const docx = require("docx");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function owner() {
  const dom = new JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" });
  dom.window.docx = docx;
  dom.window.Blob = Blob;
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/ui/editorialText.js"), "utf8"), dom.getInternalVMContext());
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/ui/docxExport.js"), "utf8"), dom.getInternalVMContext());
  return { dom, api: dom.window.DocxExport };
}

async function inspect(model) {
  const { api } = owner();
  const blob = await api.createBlob(model);
  const bytes = Buffer.from(await blob.arrayBuffer());
  const zip = await JSZip.loadAsync(bytes);
  const documentXml = await zip.file("word/document.xml").async("string");
  const stylesXml = await zip.file("word/styles.xml").async("string");
  return { blob, bytes, zip, documentXml, stylesXml };
}

test("serializes a real OOXML ZIP with required parts and inert text", async () => {
  const { api } = owner();
  const result = await inspect({ children: [
    api.heading("Álgebra & análisis <script>alert(1)</script> Δ × −", 0),
    api.paragraph("Texto <div>inerte</div>"),
    api.table(["A", "B"], [["1", "2"]])
  ] });

  expect(result.blob.type).toBe(MIME);
  expect(result.bytes.subarray(0, 2).toString()).toBe("PK");
  ["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/_rels/document.xml.rels", "word/styles.xml"]
    .forEach((name) => expect(result.zip.file(name)).not.toBeNull());
  expect(new JSDOM(result.documentXml, { contentType: "text/xml" }).window.document.querySelector("parsererror")).toBeNull();
  expect(result.documentXml).not.toMatch(/<(?:html|body|div|script)(?:\s|>)/i);
  expect(result.documentXml).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(result.documentXml).toContain("Álgebra &amp; análisis");
});

test("historical annex paragraph escapes become OOXML breaks while a technical escape stays literal", async () => {
  const { api } = owner();
  const anexo = {
    contenido: {
      titulo: "V3",
      descripcion: "Descripcion",
      secciones: [{ id: "s", orden: 1, titulo: "Teoria", bloques: [{
        tipo: "texto",
        contenido: 'Primer parrafo.\\n\\nSegundo parrafo. En JavaScript, "\\n" representa un salto.'
      }] }]
    }
  };
  const model = api.adapters.anexo(anexo, "v3");
  const { documentXml } = await inspect(model);
  expect(documentXml).not.toContain("Primer parrafo.\\n\\nSegundo parrafo.");
  expect(documentXml).toMatch(/Primer parrafo\.<\/w:t>[\s\S]*<\/w:p>[\s\S]*Segundo parrafo\./);
  expect(documentXml).toContain('En JavaScript, &quot;\\n&quot; representa un salto.');
});

test.each([
  ["Mi archivo", "Mi archivo.docx"],
  ["Mi archivo.doc", "Mi archivo.docx"],
  ["Mi archivo.DOC", "Mi archivo.docx"],
  ["Mi archivo.docx", "Mi archivo.docx"],
  ["Mi archivo.DOCX", "Mi archivo.docx"],
  ["../mal:icioso?.doc", "..malicioso.docx"]
])("normalizes %s to one docx extension", (input, expected) => {
  expect(owner().api.normalizeFilename(input, "Documento")).toBe(expected);
});

test("downloads with the DOCX MIME and revokes its URL exactly once", async () => {
  const { dom, api } = owner();
  const blob = new Blob(["PK"], { type: MIME });
  api.createBlob = jest.fn(async () => blob);
  const create = jest.fn(() => "blob:docx");
  const revoke = jest.fn();
  dom.window.URL.createObjectURL = create;
  dom.window.URL.revokeObjectURL = revoke;
  dom.window.HTMLAnchorElement.prototype.click = jest.fn();
  await api.download({ children: [api.paragraph("Contenido")] }, "reporte.DOC", "Documento");
  expect(create).toHaveBeenCalledWith(expect.objectContaining({ type: MIME }));
  expect(revoke).toHaveBeenCalledTimes(1);
  expect(revoke).toHaveBeenCalledWith("blob:docx");
});

test("does not create an object URL when serialization fails", async () => {
  const { dom, api } = owner();
  dom.window.URL.createObjectURL = jest.fn();
  await expect(api.download({ children: [] }, "fallo", "Documento")).rejects.toThrow("docx_model_empty");
  expect(dom.window.URL.createObjectURL).not.toHaveBeenCalled();
});

test("resource adapters preserve their contractual content and the resolved exam sheet", async () => {
  const { api } = owner();
  const planning = api.adapters.planeacion({ materia: "Historia", tema: "Tema", tabla_ia: [
    { tiempo_sesion: "Inicio", actividades: "Explorar", tiempo_min: 10 },
    { tiempo_sesion: "Desarrollo", actividades: "Analizar", tiempo_min: 30 },
    { tiempo_sesion: "Cierre", actividades: "Sintetizar", tiempo_min: 10 }
  ] });
  expect(JSON.stringify(planning)).toMatch(/Inicio.*Desarrollo.*Cierre/);
  expect(planning.children.some((node) => node.type === "table")).toBe(true);

  const exam = { examen_ia: { preguntas: [{ pregunta: "Elige", opciones: ["Uno", "Dos", "Tres", "Cuatro"], respuesta_correcta: "Dos" }] } };
  const student = JSON.stringify(api.adapters.exam(exam));
  expect(student).toContain("D. Cuatro");
  expect(student).toContain("Hoja de respuestas");
  expect(student).toContain("Dos");
  expect(student).not.toContain("Clave de respuestas");

  const checklist = api.adapters.listaCotejo({ tema: "Tema", criterios: [{ criterio: "Explica" }] });
  expect(JSON.stringify(checklist)).toContain("Observaciones");
  expect(JSON.stringify(checklist)).toContain("Explica");
});

test("compact planning profile uses landscape geometry, green headers and proportional seven-column tables", async () => {
  const { api } = owner();
  const planning = api.adapters.planeacion({ materia: "Historia", nivel: "Secundaria", tema: "Revolución mexicana", subtema: "Fuentes históricas", duracion: 50, sesiones: 1, tabla_ia: [
    { tiempo_sesion: "Inicio", actividades: "Recupera saberes previos y observa la fuente incluida.", tiempo_min: 10, producto: "Notas", instrumento: "Registro", formativa: "Preguntas", sumativa: "" },
    { tiempo_sesion: "Desarrollo", actividades: "Analiza la fuente, contrasta perspectivas y sustenta una interpretación.", tiempo_min: 30, producto: "Análisis", instrumento: "Guía", formativa: "Retroalimentación", sumativa: "" },
    { tiempo_sesion: "Cierre", actividades: "Sintetiza hallazgos y formula una conclusión.", tiempo_min: 10, producto: "Conclusión", instrumento: "Lista", formativa: "Síntesis", sumativa: "Producto" }
  ] });
  expect(planning.profile).toBe("planeacionCompacta");
  expect(planning.orientation).toBe("landscape");
  expect(planning.children.filter((node) => node.type === "table")[1].columnWidths).toEqual([10, 37, 8, 12, 11, 14, 8]);
  expect(JSON.stringify(planning)).toMatch(/Inicio.*Desarrollo.*Cierre/);
  const { documentXml, stylesXml } = await inspect(planning);
  expect(documentXml).toMatch(/w:orient="landscape"/);
  expect(documentXml).toMatch(/<w:pgMar[^>]*w:top="504"[^>]*w:right="576"[^>]*w:bottom="504"[^>]*w:left="576"/);
  expect(documentXml).toContain('w:fill="3F6F55"');
  expect(documentXml).toContain('w:color w:val="FFFFFF"');
  expect(documentXml).not.toMatch(/w:trHeight|w:hRule/);
  expect(stylesXml).toContain('w:ascii="Arial"');
  expect(documentXml).toMatch(/w:tcW w:type="pct" w:w="1850"/);
});

test("checklist profile keeps complete criteria, narrow compliance columns and repeatable header", async () => {
  const { api } = owner();
  const checklist = api.adapters.listaCotejo({ tema: "Argumentación", materia: "Lengua", nivel: "Secundaria", total_puntos: 10, criterios: [
    { criterio: "Presenta una tesis clara y sustentada.", si: 2, no: 0 },
    { criterio: "Relaciona evidencias completas con la conclusión.", si: 2, no: 0 }
  ] });
  expect(checklist.profile).toBe("listaCotejo");
  const checklistTable = checklist.children.find((node) => node.type === "table");
  expect(checklistTable.columnWidths).toEqual([58, 8, 8, 26]);
  expect(JSON.stringify(checklist)).toContain("Presenta una tesis clara");
  expect(JSON.stringify(checklist)).toContain("Relaciona evidencias");
  expect(JSON.stringify(checklist)).toContain("Observaciones");
  expect(JSON.stringify(checklist)).toContain("Total: 10 puntos");
  const { documentXml, stylesXml } = await inspect(checklist);
  expect(documentXml).toContain("<w:tblHeader/>");
  expect(documentXml).toMatch(/w:tcW w:type="pct" w:w="2900"/);
  expect(documentXml).not.toMatch(/w:trHeight|w:hRule/);
  expect(stylesXml).toContain('w:ascii="Arial"');
});

test("exam profile normalizes question, option and resolved-answer prefixes without duplicate keys", async () => {
  const { api } = owner();
  const exam = { examen_ia: { titulo: "Examen", instrucciones_generales: "Lee y responde.", preguntas: [
    { pregunta: "1. Selecciona la respuesta correcta", opciones: ["A. Primera", "B) Segunda", "c) Tercera", "D. Cuarta"], respuesta_correcta: "B. Segunda" },
    { pregunta: "2) Explica el concepto", respuesta_correcta: "Respuesta privada" },
    { pregunta: "3. Relaciona", pares: [{ lado_a: "1. Concepto", lado_b: "A) Definición" }], respuesta_correcta: [{ Concepto: "Definición" }] },
    { pregunta: "1984 es parte real del contenido", respuesta_correcta: "Año conservado" }
  ] } };
  const student = api.adapters.exam(exam);
  expect(student.profile).toBe("examen");
  const serialized = JSON.stringify(student);
  expect(serialized).toContain("1. Selecciona la respuesta correcta");
  expect(serialized).not.toMatch(/1\. 1\.|2\. 2[.)]|3\. 3\./);
  expect(serialized).toMatch(/A\. Primera.*B\. Segunda.*C\. Tercera.*D\. Cuarta/s);
  expect(serialized).not.toMatch(/A\. A\.|B\. B[.)]|C\. c[.)]|D\. D\./i);
  expect(serialized).toContain("Columna A");
  expect(serialized).toContain("4. 1984 es parte real del contenido");
  expect(serialized).toContain("Respuesta privada");
  expect(serialized).not.toContain("Clave de respuestas");
  const optionList = student.children.find((node) => node.type === "list" && node.items?.[0] === "A. Primera");
  expect(optionList.plain).toBe(true);
  const { documentXml, stylesXml } = await inspect(student);
  expect(documentXml).not.toContain("w:numPr");
  expect(stylesXml).toContain('w:ascii="Arial"');
  expect(serialized.match(/Hoja de respuestas/g)).toHaveLength(1);
});

test("exam DOCX adds the resolved app answer sheet for mixed question types", async () => {
  const { api } = owner();
  const exam = { examen_ia: { titulo: "Evaluación mixta Ω", preguntas: [
    { tipo: "opcion_multiple", pregunta: "Selecciona una opción", opciones: ["A) 4", "B) 5.66", "C) 6", "D) 8"], respuesta_correcta: "B) B) 5.66" },
    { tipo: "verdadero_falso", pregunta: "Determina el valor de verdad", opciones: ["Verdadero", "Falso"], respuesta_correcta: "Verdadero" },
    { tipo: "pregunta_abierta", pregunta: "Explica <script>el caso</script>", respuesta_correcta: "Análisis & conclusión" },
    { tipo: "emparejamiento", pregunta: "Relaciona", pares: [{ lado_a: "Concepto", lado_b: "Definición" }, { lado_a: "Causa", lado_b: "Efecto" }], respuesta_correcta: [{ lado_a: "Concepto", lado_b: "Definición" }, { lado_a: "Causa", lado_b: "Efecto" }] },
    { tipo: "ordenacion_jerarquizacion", pregunta: "Ordena", elementos: ["Inicio", "Proceso", "Cierre"], respuesta_correcta: ["Inicio", "Proceso", "Cierre"] }
  ] } };
  const model = api.adapters.exam(exam);
  const serialized = JSON.stringify(model);
  expect(serialized).toContain("Hoja de respuestas");
  expect(serialized).toContain("Incluye cada pregunta con su respuesta correcta.");
  ["Pregunta 1", "Pregunta 2", "Pregunta 3", "Pregunta 4", "Pregunta 5"].forEach((label) => expect(serialized).toContain(label));
  expect(serialized.match(/Respuesta correcta/g)).toHaveLength(5);
  expect(serialized).toContain("B) 5.66");
  expect(serialized).not.toContain("B) B) 5.66");
  expect(serialized).toContain("Verdadero");
  expect(serialized).toContain("Análisis & conclusión");
  expect(serialized).toContain("Concepto - Definición");
  expect(serialized).toMatch(/1\. Inicio.*2\. Proceso.*3\. Cierre/s);
  expect(serialized).not.toMatch(/Marca tu respuesta|Escribe tu respuesta|☐|Clave de respuestas/);
  const pageBreakIndex = model.children.findIndex((node) => node.type === "pageBreak");
  const sheetIndex = model.children.findIndex((node) => node.type === "heading" && node.text === "Hoja de respuestas");
  expect(pageBreakIndex).toBeGreaterThan(-1);
  expect(sheetIndex).toBe(pageBreakIndex + 1);
  expect(model.children.filter((node) => node.type === "pageBreak")).toHaveLength(1);
  const { bytes, documentXml } = await inspect(model);
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
  expect(documentXml).toMatch(/<w:br w:type="page"\/>[\s\S]*Hoja de respuestas/);
  expect(documentXml).toContain("&lt;script&gt;el caso&lt;/script&gt;");
  expect(documentXml).toContain("Análisis &amp; conclusión");
  expect(documentXml).not.toMatch(/Marca tu respuesta|Escribe tu respuesta|☐|Clave de respuestas/);

});

test("annex keeps the unchanged default DOCX profile", () => {
  const { api } = owner();
  const anexo = api.adapters.anexo({ contenido: { titulo: "Anexo", secciones: [] } }, "v3");
  expect(anexo.profile).toBeUndefined();
  expect(api.STYLE_PROFILES.default.bodySize).toBe(22);
});

test("annex adapters cover v1, v2 and structured v3 content", async () => {
  const { api } = owner();
  const v1 = api.adapters.anexo({ contenido: { titulo_general: "Anexos", anexos: [{ numero: 1, titulo: "Ficha", contenido: [{ texto: "Histórico" }] }] } }, "v1");
  const v2 = api.adapters.anexo({ contenido: { titulo: "V2", datos_generales: {}, secciones: [{ id: "s", orden: 1, titulo: "Sección", bloques: [{ tipo: "texto", contenido: "Contenido" }] }] } }, "v2");
  const v3 = api.adapters.anexo({ contenido: { titulo: "V3", secciones: [{ id: "s", orden: 1, titulo: "Aplicación", bloques: [
    { tipo: "ejemplo_resuelto", enunciado: "Resuelve", pasos: ["Paso"], resultado: "x = 1", verificacion: ["1 = 1"], interpretacion: "Única", matrices: [{ titulo: "Matriz", columnas: ["x"], filas: [["1"]] }] },
    { tipo: "espacio_respuesta", etiqueta: "Respuesta", lineas: 3 }
  ] }] } }, "v3");
  expect(JSON.stringify(v1)).toContain("Histórico");
  expect(JSON.stringify(v2)).toContain("Contenido");
  const serialized = JSON.stringify(v3);
  expect(serialized).toContain("Procedimiento");
  expect(serialized).toContain("Comprobación");
  expect(serialized).toContain("Matriz");
  expect(serialized).toContain("answerLines");
  expect(serialized).not.toMatch(/slot_id|familia_problema|cobertura/);
  for (const model of [v1, v2, v3]) {
    const packageResult = await inspect(model);
    expect(packageResult.bytes.subarray(0, 2).toString()).toBe("PK");
    expect(packageResult.documentXml).not.toMatch(/undefined|null|\[object Object\]/);
  }
  expect((await inspect(v3)).documentXml).toContain("Comprobación");
});

test("classic pages load the local DOCX distribution before the owner and consumers", () => {
  for (const page of ["pages/dashboard.html", "pages/detalle.html"]) {
    const source = fs.readFileSync(path.join(ROOT, page), "utf8");
    const vendor = source.indexOf("docx-9.16.0.iife.js");
    const editorialText = source.indexOf("editorialText.js");
    const ownerIndex = source.indexOf("docxExport.js");
    const wrapper = source.indexOf("wordExport.js");
    expect(vendor).toBeGreaterThan(-1);
    expect(editorialText).toBeGreaterThan(vendor);
    expect(ownerIndex).toBeGreaterThan(editorialText);
    expect(wrapper).toBeGreaterThan(ownerIndex);
  }
});

test("the vendored browser distribution exposes the expected classic global", () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only" });
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/vendor/docx-9.16.0.iife.js"), "utf8"), dom.getInternalVMContext());
  expect(typeof dom.window.docx.Document).toBe("function");
  expect(typeof dom.window.docx.Packer.toBlob).toBe("function");
});

test("all active Word entry points use docx and converge on the canonical owner", () => {
  const files = [
    "js/ui/wordExport.js",
    "js/features/planeaciones/planeacion-download.js",
    "js/features/anexos/anexo-download.js",
    "js/features/anexos/anexo-preview.js",
    "js/features/examenes/exam-download.js",
    "js/features/listas-cotejo/lista-cotejo-download.js",
    "js/features/dashboard/dashboard-bootstrap.js",
    "js/pages/detalle.page.js"
  ];
  const source = files.map((file) => fs.readFileSync(path.join(ROOT, file), "utf8")).join("\n");
  expect(source).not.toContain("application/msword");
  expect(source).not.toMatch(/extension:\s*["']doc["']/);
  expect(source).toContain("DocxExport.download");
  expect(source).toContain("extension: \"docx\"");
  expect(fs.readFileSync(path.join(ROOT, "js/features/planeaciones/planeacion-download.js"), "utf8")).toContain("DocxExport.adapters.planeacion");
  expect(fs.readFileSync(path.join(ROOT, "js/features/examenes/exam-download.js"), "utf8")).toContain("DocxExport.adapters.exam");
  expect(fs.readFileSync(path.join(ROOT, "js/ui/wordExport.js"), "utf8")).toContain("DocxExport.adapters.listaCotejo");
  expect(fs.readFileSync(path.join(ROOT, "js/features/anexos/anexo-download.js"), "utf8")).toContain("DocxExport.adapters.anexo");
});
