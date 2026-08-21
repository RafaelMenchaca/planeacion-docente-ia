const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

describe("Legacy zero-consumer removal", () => {
  const dashboard = readProjectFile("js/pages/dashboard.page.js");
  const bibliotecaEvents = readProjectFile("js/features/biblioteca/biblioteca-events.js");
  const bibliotecaRender = readProjectFile("js/features/biblioteca/biblioteca-render.js");

  test("mantiene retiradas las funciones cero-consumer de 9.2", () => {
    [
      "renderActividadCierreStatus",
      "renderActividadCierreControl",
      "hasInvalidExamQuestionCounts",
      "renderActividadesEvaluadasHtml",
      "getExamOptionLabel",
      "findPlantelIdForGrado",
      "getActividadCierreSelectLabel",
      "getActividadCierreSelectWidth",
      "findTemaById"
    ].forEach((name) => expect(dashboard).not.toMatch(new RegExp(`\\b${name}\\b`)));
  });

  test("retira el dispatcher archive del fallback sin tocar deletes de Biblioteca", () => {
    ["archive-plantel", "archive-grado", "archive-materia", "archive-unidad", "archive-planeacion"]
      .forEach((action) => expect(dashboard).not.toContain(action));

    ["eliminar-bloque", "eliminar-planeacion", "eliminar-examen", "eliminar-lista", "eliminar-anexo"]
      .forEach((action) => {
        expect(bibliotecaEvents).toContain(`case "${action}"`);
        expect(bibliotecaRender).toContain(`data-bib-action="${action}"`);
      });
  });
});
