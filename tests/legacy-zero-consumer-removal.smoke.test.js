const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

describe("Legacy zero-consumer removal", () => {
  const dashboard = readProjectFile("js/pages/dashboard.page.js");
  const explorer = readProjectFile("js/features/dashboard/legacy-explorer.js");
  const bibliotecaEvents = readProjectFile("js/features/biblioteca/biblioteca-events.js");
  const bibliotecaRender = readProjectFile("js/features/biblioteca/biblioteca-render.js");

  test("removes zero-consumer functions and their newly orphaned private helpers", () => {
    const removedFunctions = [
      "renderActividadCierreStatus",
      "renderActividadCierreControl",
      "hasInvalidExamQuestionCounts",
      "renderActividadesEvaluadasHtml",
      "getExamOptionLabel",
      "findPlantelIdForGrado",
      "getActividadCierreSelectLabel",
      "getActividadCierreSelectWidth",
      "findTemaById",
    ];

    removedFunctions.forEach((name) => {
      expect(dashboard).not.toMatch(new RegExp(`\\b${name}\\b`));
    });
  });

  test("removes impossible actions while preserving emitted archive actions", () => {
    const removedActions = [
      "archive-batch",
      "delete-plantel",
      "delete-grado",
      "delete-materia",
      "delete-unidad",
      "delete-tema",
      "delete-planeacion",
    ];

    removedActions.forEach((action) => {
      expect(dashboard).not.toContain(action);
      expect(explorer).not.toContain(action);
    });

    ["archive-plantel", "archive-grado", "archive-materia", "archive-unidad", "archive-planeacion"]
      .forEach((action) => {
        expect(explorer).toContain(`action: "${action}"`);
        expect(dashboard).toContain(`action === "${action}"`);
        expect(dashboard).toContain(`type === "${action}"`);
      });
  });

  test("keeps shared confirmation and current Biblioteca deletes", () => {
    ["renderDeleteConfirmModal", "openDeleteConfirm", "closeDeleteConfirm", "submitDeleteConfirm"]
      .forEach((name) => expect(dashboard).toMatch(new RegExp(`function ${name}\\b`)));

    ["eliminar-bloque", "eliminar-planeacion", "eliminar-examen", "eliminar-lista", "eliminar-anexo"]
      .forEach((action) => {
        expect(bibliotecaEvents).toContain(`case "${action}"`);
        expect(bibliotecaRender).toContain(`data-bib-action="${action}"`);
      });
  });
});
