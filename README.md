# Educativo IA Frontend

Frontend estático de Educativo IA para crear, consultar y descargar planeaciones, anexos, listas de cotejo y exámenes.

## Flujo funcional vigente

**Biblioteca es el único flujo visual principal vigente del área privada.** Se carga dentro de `pages/dashboard.html` y permite:

- agrupar recursos en bloques o conjuntos;
- crear temas y generar planeaciones;
- consultar, previsualizar, descargar y eliminar recursos;
- generar anexos, listas de cotejo y exámenes;
- mostrar progreso y feedback de generación;
- navegar entre los tabs del bloque seleccionado.

El antiguo explorador visual `plantel → grado → materia → unidad → tema` permanece parcialmente en código como legado y compatibilidad. No es una experiencia paralela soportada ni debe recibir funciones nuevas. Las tablas, IDs y endpoints jerárquicos pueden seguir activos como soporte técnico, persistencia o dependencia de Archivados.

## Stack

- HTML y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Tailwind CSS y Bootstrap donde el código actual los carga.
- Supabase JS para autenticación y operaciones puntuales de Storage.
- `fetch` para consumir el backend.
- Jest y JSDOM para las pruebas existentes.

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `pages/` | Páginas públicas, privadas, redirects y vistas auxiliares. |
| `js/core/` | Configuración, cliente Supabase y utilidades. |
| `js/api/` | Wrappers HTTP por recurso. |
| `js/services/` | Autenticación y orquestación frontend. |
| `js/pages/` | Estado e inicialización por página. |
| `js/ui/` | Componentes, helpers, previews y descargas. |
| `tests/` | Pruebas automatizadas existentes. |

La carpeta `js/features/` no existe en el estado auditado. No debe crearse con módulos vacíos; cualquier extracción debe responder a una responsabilidad real de Biblioteca.

## Páginas relevantes

| Página | Estado actual |
| --- | --- |
| `index.html` y páginas públicas | Sitio público. |
| `pages/login.html` | Acceso con Supabase Auth. |
| `pages/dashboard.html` | Contenedor del flujo principal Biblioteca. |
| `pages/detalle.html` | Detalle y edición de planeación. |
| `pages/archivados.html` | Flujo separado con dependencias jerárquicas; no equivale al flujo principal. |
| `pages/batch.html`, `pages/planeacion.html` | Redirigen a `dashboard.html`. |
| `pages/dashboard_tailwind.html` | Página histórica sin consumidor de navegación confirmado; no activar ni eliminar sin auditoría. |

No existe `pages/biblioteca.html`: Biblioteca se inicializa desde `js/pages/biblioteca.page.js` dentro del dashboard.

## Inicio del dashboard

`pages/dashboard.html` carga `dashboard.page.js`, después `biblioteca.page.js` y finalmente `main.js`. Al existir `window.initBiblioteca`, `initDashboardPage()` activa Biblioteca, llama su inicializador y retorna antes de hidratar el explorador visual antiguo.

`dashboard.page.js` sigue aportando estado y wrappers consumidos por Biblioteca. Esa dependencia es compatibilidad técnica y deuda de refactor, no evidencia de dos modos vigentes.

## Configuración

`js/core/config.js` define `window.API_BASE_URL`:

- `localhost` o `127.0.0.1`: `http://localhost:3000`;
- otros hosts: `https://api.educativoia.com`.

No copiar claves, tokens ni valores privados a la documentación. La configuración pública de Supabase no autoriza exponer service role.

## Desarrollo local

```bash
npm install
npm test
```

Para servir los archivos estáticos puede usarse un servidor local. El backend debe estar disponible en la URL configurada.

## Documentación obligatoria

- Reglas: [`AGENTS.md`](AGENTS.md)
- Arquitectura actual: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Método de refactor: [`docs/refactor/REFACTOR_PLAYBOOK.md`](docs/refactor/REFACTOR_PLAYBOOK.md)
- Estado de sesión: [`docs/refactor/SESSION_HANDOFF.md`](docs/refactor/SESSION_HANDOFF.md)
- Pruebas manuales: [`docs/refactor/TEST_MATRIX.md`](docs/refactor/TEST_MATRIX.md)

Los contratos de datos, generación IA, jobs, métricas, RLS y persistencia viven en el repositorio backend enlazado desde `AGENTS.md`.
