(function initCuadernilloTypes(global) {
  const items = Object.freeze([
    Object.freeze({
      id: "ejercicios_aplicacion",
      label: "Cuadernillo de ejercicios y aplicación",
      enfoque: "Practicar y resolver",
      objetivo: "Desarrollar habilidades y conocimientos mediante ejercicios progresivos, procedimientos y resolución de problemas.",
      orden: 1
    }),
    Object.freeze({
      id: "actividades_integradoras",
      label: "Cuadernillo de actividades integradoras",
      enfoque: "Analizar, crear y resolver",
      objetivo: "Promover la aplicación de conocimientos mediante situaciones problemáticas, análisis, actividades prácticas y elaboración de productos.",
      orden: 2
    }),
    Object.freeze({
      id: "aprendizaje_guiado",
      label: "Cuadernillo de aprendizaje guiado",
      enfoque: "Aprender y comprender",
      objetivo: "Proporcionar al estudiante toda la información teórica y explicativa necesaria para estudiar un tema de manera autónoma.",
      orden: 3
    })
  ]);
  const byId = new Map(items.map((item) => [item.id, item]));

  global.CuadernilloTypes = Object.freeze({
    all() {
      return items;
    },
    isValid(id) {
      return typeof id === "string" && byId.has(id);
    },
    get(id) {
      return byId.get(id) || null;
    }
  });
})(window);
