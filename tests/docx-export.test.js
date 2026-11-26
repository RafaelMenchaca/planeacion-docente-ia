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
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/ui/docxExport.js"), "utf8"), dom.getInternalVMContext());
  return { dom, api: dom.window.DocxExport };
}

async function inspect(model) {
  const { api } = owner();
  const blob = await api.createBlob(model);
  const bytes = Buffer.from(await blob.arrayBuffer());
  const zip = await JSZip.loadAsync(bytes);
  const documentXml = await zip.file("word/document.xml").async("string");
  return { blob, bytes, zip, documentXml };
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

test("resource adapters preserve their contractual content without leaking answers", async () => {
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
  expect(student).not.toContain("Clave de respuestas");
  expect(JSON.stringify(api.adapters.exam(exam, { includeAnswers: true }))).toContain("Clave de respuestas");

  const checklist = api.adapters.listaCotejo({ tema: "Tema", criterios: [{ criterio: "Explica" }] });
  expect(JSON.stringify(checklist)).toContain("Observaciones");
  expect(JSON.stringify(checklist)).toContain("Explica");
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
    const ownerIndex = source.indexOf("docxExport.js");
    const wrapper = source.indexOf("wordExport.js");
    expect(vendor).toBeGreaterThan(-1);
    expect(ownerIndex).toBeGreaterThan(vendor);
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
