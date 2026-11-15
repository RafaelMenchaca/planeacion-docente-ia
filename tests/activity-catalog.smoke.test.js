const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "js/pages/dashboard.page.js"), "utf8");

const EXPECTED = {
  conocimientos_previos: [
    "Activación y diagnóstico", "Lluvia de ideas", "Preguntas detonadoras", "Cuestionario diagnóstico",
    "Quiz interactivo", "Estudio de caso", "Análisis de imágenes", "Análisis de videos",
    "Análisis de noticias", "Diálogo en parejas", "Cuadro SQA", "Mapa mental", "Red de conceptos",
    "Línea del tiempo", "Exploración de materiales", "Demostración experimental", "Observación del entorno"
  ],
  desarrollo: [
    "Construcción y aplicación del conocimiento", "Mapa conceptual", "Mapa mental", "Cuadro comparativo",
    "Cuadro sinóptico", "Diagrama de flujo", "Infografía", "Esquema explicativo", "Resumen",
    "Resolución de ejercicios", "Resolución de problemas", "Práctica de laboratorio", "Simulación digital",
    "Práctica informática", "Dibujo técnico", "Modelado a escala", "Lectura comentada", "Análisis de textos",
    "Investigación documental", "Matriz de análisis", "Reporte técnico", "Bitácora de trabajo",
    "Trabajo colaborativo", "Elaboración de prototipos", "Elaboración de maquetas", "Redacción de ensayos",
    "Elaboración de propuestas", "Producción audiovisual", "Presentación digital"
  ],
  cierre: [
    "Evaluación y retroalimentación", "Ticket de salida", "Cuestionario final", "Quiz de comprobación",
    "Ejercicio de aplicación", "Preguntas de comprensión", "Coevaluación", "Autoevaluación",
    "Reflexión individual", "Retroalimentación grupal", "Conclusiones grupales", "Exposición breve",
    "Galería de trabajos", "Debate grupal", "Mesa redonda", "Portafolio de evidencias",
    "Mapa de síntesis", "Cuadro de conclusiones"
  ]
};

function harness() {
  const dom = new JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" });
  const context = dom.getInternalVMContext();
  dom.window.escapeHtml = (value) => String(value ?? "");
  vm.runInContext(source, context, { filename: "js/pages/dashboard.page.js" });
  return context;
}

test("mantiene el catálogo exacto, ordenado y específico por momento", () => {
  const context = harness();
  const actual = vm.runInContext(
    "Object.fromEntries(Object.entries(ACTIVIDADES_DIDACTICAS_POR_MOMENTO).map(([k,v]) => [k, [...v]]))",
    context
  );
  expect(JSON.parse(JSON.stringify(actual))).toEqual(EXPECTED);
  expect(actual.conocimientos_previos).toHaveLength(17);
  expect(actual.desarrollo).toHaveLength(29);
  expect(actual.cierre).toHaveLength(18);
  expect(actual.conocimientos_previos).toContain("Mapa mental");
  expect(actual.desarrollo).toContain("Mapa mental");
  expect(actual.desarrollo).not.toContain("Activación y diagnóstico");
  expect(actual.cierre).not.toContain("Activación y diagnóstico");
});

test("genera opciones con sentinel y conserva textos en el payload", () => {
  const context = harness();
  const optionValues = vm.runInContext(`(() => {
    const holder = document.createElement("select");
    holder.innerHTML = buildActividadDidacticaOptions("", "cierre");
    return [...holder.options].map((option) => option.value);
  })()`, context);
  expect([...optionValues]).toEqual(["", ...EXPECTED.cierre]);

  const payload = vm.runInContext(`buildTemaActividadesPayload({ actividades_momentos: {
    conocimientos_previos: "Activación y diagnóstico",
    desarrollo: "Construcción y aplicación del conocimiento",
    cierre: "Evaluación y retroalimentación"
  }})`, context);
  expect(JSON.parse(JSON.stringify(payload))).toEqual({
    actividades_momentos: {
      conocimientos_previos: "Activación y diagnóstico",
      desarrollo: "Construcción y aplicación del conocimiento",
      cierre: "Evaluación y retroalimentación"
    },
    actividad_cierre: "Evaluación y retroalimentación"
  });
});
