# Testing

Guía operativa para validar features, fixes y deuda técnica del frontend.

## Automatizado

Desde la raíz del frontend:

```bash
npm test -- --runInBand
```

La suite actual usa Jest y JSDOM. No declarar una prueba como ejecutada si no se corrió realmente.

Para JavaScript modificado también validar sintaxis con:

```bash
node --check ruta/al/archivo.js
```

## Regresión principal

Seleccionar el subconjunto relacionado con el cambio:

- Auth: login, sesión y logout.
- Dashboard/Biblioteca: carga, selección de bloque, búsqueda y tabs.
- Quick Create: abrir/cerrar, crear bloque y reutilizar jerarquía técnica.
- Agregar tema: pending, progreso, resultado y reconcile.
- Planeación: generación, detalle/back, descarga y delete.
- Anexo: generación, preview, descarga y delete.
- Lista de cotejo: selección, generación/skipped, preview, descarga y delete.
- Examen: selección, creación de job, polling, preview, descarga y delete.
- Bloque: delete y selección posterior.
- Archivados: restauración y eliminación permanente cuando el cambio lo afecte.
- Consola/Network: sin errores nuevos, requests duplicados ni listeners dobles.

## Cuándo ejecutar regresión completa

Ejecutar toda la suite automatizada y la regresión manual principal cuando cambien:

- state o selección de Biblioteca;
- loader/reconcile;
- Quick Create o jerarquía técnica;
- generation o polling;
- events, render o modal render de Biblioteca;
- payloads o adaptadores API;
- previews, downloads o deletes compartidos;
- orden de scripts o globals clásicos.

Para un cambio documental basta validar links y `git diff --check`, salvo que la documentación describa comandos o rutas cuya existencia deba comprobarse.
