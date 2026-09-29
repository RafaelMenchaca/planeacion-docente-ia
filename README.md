# Educativo IA Frontend

Frontend estático de Educativo IA / Planea para crear, consultar y descargar planeaciones, anexos, listas de cotejo y exámenes.

La versión 3.0 está desplegada y estable. **Biblioteca es el único flujo visual principal del área privada.**

## Flujo funcional

Biblioteca se carga dentro de `pages/dashboard.html` y permite:

- crear y seleccionar bloques o conjuntos;
- agregar temas y generar planeaciones;
- generar anexos, listas de cotejo y exámenes;
- consultar previews, descargar y eliminar recursos;
- mostrar progreso y reconciliar resultados de generación.

El flujo principal es:

```text
Dashboard → Biblioteca → Quick Create → owner del recurso
```

El Explorer visual jerárquico antiguo fue retirado. Las tablas, IDs, caches, loaders y endpoints jerárquicos siguen activos cuando soportan Quick Create, persistencia, contratos técnicos o Archivados.

## Stack

- HTML multipágina y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Tailwind CSS y Bootstrap donde los carga la página.
- Supabase JS para autenticación y Storage puntual.
- `fetch` para la API backend.
- Jest y JSDOM para pruebas automatizadas.

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `pages/` | Páginas públicas, privadas, redirects y vistas auxiliares. |
| `components/` | Fragmentos de layout público y privado. |
| `css/` | Estilos compartidos y por página. |
| `js/core/` | Configuración, Supabase y utilidades. |
| `js/api/` | Transporte HTTP por dominio. |
| `js/services/` | Sesión y orquestación compartida. |
| `js/pages/` | Estado e inicialización por página. |
| `js/features/` | Owners de Biblioteca, Dashboard y recursos. |
| `js/ui/` | UI compartida y exportaciones. |
| `tests/` | Pruebas Jest/JSDOM. |

## Arquitectura de Biblioteca

- `biblioteca.page.js`: state físico y coordinación.
- `biblioteca-loader.js`: carga y reconciliación.
- `biblioteca-render.js`: sidebar, detalle, tabs y cards.
- `biblioteca-modal-render.js`: modales y confirmación.
- `biblioteca-events.js`: búsqueda y actions.
- `quick-create.js`: creación rápida y jerarquía técnica.
- `dashboard-bootstrap.js`: layout, bindings e inicialización.
- `js/features/{recurso}/`: generación, preview, download y delete por dominio.

`dashboard.page.js` conserva state técnico compartido, caches/loaders jerárquicos y helpers. `window.explorerState` es un contrato clásico compartido; su nombre no implica que exista un Explorer visual.

## Páginas relevantes

| Página | Uso |
| --- | --- |
| `index.html` y páginas públicas | Sitio público. |
| `pages/login.html` | Acceso con Supabase Auth. |
| `pages/dashboard.html` | Contenedor de Biblioteca. |
| `pages/detalle.html` | Detalle y edición de planeación. |
| `pages/archivados.html` | Flujo separado de Archivados. |
| `pages/batch.html`, `pages/planeacion.html` | Redirects compatibles al Dashboard. |
| `pages/dashboard_tailwind.html` | URL directa histórica; no forma parte de la navegación principal. |

No existe `pages/biblioteca.html`.

### Contención temporal de formularios públicos

Registro, recuperación y contacto aún no tienen integración. Sus controles se mantienen en grupos HTML sin `<form>` ni atributos `name`, con botones `type="button"` deshabilitados y avisos visibles asociados mediante `aria-describedby`. Así, clic y Enter no pueden producir un envío nativo, incluso sin JavaScript. Registro tampoco conserva los campos ocultos de autocompletado. Las tres páginas incluyen un enlace estático a login para usuarios existentes.

Al conectar cada flujo, conservar los IDs y labels, definir su handler y destino real, y mantener una protección sin JavaScript antes de restaurar la capacidad de envío. Esta contención no implementa Auth, correo ni contacto. Verificación manual: completar solo con valores sintéticos; intentar clic y Enter en cada página con scripts habilitados y deshabilitados; comprobar que no hay navegación/envío ni valores en la URL, que el aviso es legible y que login sigue accesible por teclado.

## Configuración

`js/core/config.js` define `window.API_BASE_URL`:

- `localhost` o `127.0.0.1`: `http://localhost:3000`;
- otros hosts: `https://api.educativoia.com`.

No copiar secretos o credenciales a la documentación. La configuración pública de Supabase no autoriza exponer service role.

## Desarrollo local

```bash
npm install
npm test -- --runInBand
```

Sirve los archivos estáticos con un servidor local y mantén disponible el backend en la URL configurada.

## Developer documentation

- Entornos y esquema: [inventario y evidencia pendiente en backend](../backend/docs/ENVIRONMENT_SCHEMA_READINESS.md) (checkout hermano; inspección local, sin certificar aislamiento).
- Storage y Auth de pruebas: [guía canónica de preparación 02D.1](../backend/docs/test-environment/STORAGE_AUTH_READINESS.md) (consumidores de carga manual, policies, bucket pendiente e inventario Auth; sin cambios funcionales).
- Planes y consumo: [contrato canónico en el repositorio backend](../backend/docs/PRODUCT_PLANS_CONSUMPTION.md) (checkout hermano `backend/`; reglas documentadas, todavía no implementadas).
- Reglas para agentes: [`AGENTS.md`](AGENTS.md)
- Arquitectura actual: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Mapa de código: [`docs/FRONTEND_MAP.md`](docs/FRONTEND_MAP.md)
- Pruebas: [`docs/TESTING.md`](docs/TESTING.md)
- Historial de versiones: [`CHANGELOG.md`](CHANGELOG.md)

El archivo histórico del refactor está separado en `docs/archive/refactor-2026/` y no es lectura requerida para desarrollo normal.
