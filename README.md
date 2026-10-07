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

Al conectar cada flujo, conservar los IDs y labels, definir su handler y destino real, y mantener una protección sin JavaScript antes de restaurar la capacidad de envío. Esta contención no implementa Auth, correo ni contacto: registro, recuperación y contacto siguen deliberadamente inactivos hasta sus sesiones funcionales.

**Validación manual completada y aprobada — evidencia proporcionada por el usuario el 2026-09-30.** Contención del commit `b4314ce` (`fix(auth): prevent native submission of inactive public forms`), probada en [registro](pages/registro.html), [recuperación](pages/recuperar.html) y [contacto](pages/contacto.html), servidos desde `http://127.0.0.1:5500`, con Chrome de escritorio en Windows. Se probaron JavaScript habilitado y JavaScript deshabilitado desde DevTools, con los mismos resultados:

- Avisos de función no disponible visibles; botones deshabilitados omitidos al navegar con Tab y sin posibilidad de activarlos.
- Enter en inputs no envía ni navega; en selectores conserva la selección normal y en el textarea de contacto crea una nueva línea.
- Enlaces a iniciar sesión accesibles y funcionales mediante Enter.
- URLs limpias, sin emails, contraseñas ni datos de formularios; ninguna solicitud de registro, recuperación o contacto ni mensajes falsos de éxito.

La protección se mantuvo sin JavaScript y no depende de `preventDefault`. En Network, con Preserve log, se observaron cargas de `login.html`, scripts Auth y una solicitud de refresh token **después de activar expresamente el enlace de inicio de sesión**. Corresponden al login existente, no a los botones contenidos ni a Enter en los controles. Esta evidencia aprueba únicamente la contención; no acredita implementación ni validación funcional de registro, recuperación o contacto. El agente registra la prueba aportada, sin atribuirse su ejecución.

## Configuración

`js/core/config.js` valida una configuración explícita compartida por Login y páginas privadas. Local (`localhost:5500` o `127.0.0.1:5500`) exige `js/core/config.local.js`, copiado del [ejemplo público](js/core/config.local.example.js) y excluido de Git: solo proyecto Supabase de pruebas y API local en 3000. El placeholder impide arrancar hasta completarlo localmente; nunca poner claves privadas en frontend.

Producción se limita a HTTPS en `educativoia.com`, `www.educativoia.com` y `planeacion-docente-ia.vercel.app`. Previews, LAN, IPv6, file: y hosts desconocidos fallan cerrados; no hay fallback productivo. Consultar el [contrato y procedimiento canónico 02E](../backend/docs/ENVIRONMENT_SCHEMA_READINESS.md#02e--aislamiento-operativo-en-código-2026-10-04) para variables, errores, comprobación sanitizada y pruebas manuales pendientes. `window.EDUCATIVO_ENVIRONMENT` muestra solo ambiente/proyecto/API; no imprimir EDUCATIVO_CONFIG ni claves.

No copiar secretos o credenciales a la documentación. La configuración pública de Supabase no autoriza exponer service role.

## Desarrollo local

```bash
npm install
npm test -- --runInBand
```

Sirve los archivos estáticos con un servidor local y mantén disponible el backend en la URL configurada.

Comprobación de configuración sin dependencias, red ni credenciales: `node --test tests/environment-config.cjs`. No iniciar pruebas conectadas hasta completar la configuración local de ambos repositorios y comprobar sus destinos siguiendo la guía 02E. Los scripts clásicos conservan el orden de los owners, precedidos por config.local.js → config.js → SDK → cliente → Auth.

## Developer documentation

- Entornos y esquema: [inventario y evidencia pendiente en backend](../backend/docs/ENVIRONMENT_SCHEMA_READINESS.md) (checkout hermano; inspección local, sin certificar aislamiento).
- Storage y Auth de pruebas: [guía canónica 02D.2](../backend/docs/test-environment/STORAGE_AUTH_READINESS.md) (bucket configurado estructuralmente e inventario Auth; pruebas funcionales pendientes).
- Planes y consumo: [contrato canónico en el repositorio backend](../backend/docs/PRODUCT_PLANS_CONSUMPTION.md) (checkout hermano `backend/`; reglas documentadas, todavía no implementadas).
- Reglas para agentes: [`AGENTS.md`](AGENTS.md)
- Arquitectura actual: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Mapa de código: [`docs/FRONTEND_MAP.md`](docs/FRONTEND_MAP.md)
- Pruebas: [`docs/TESTING.md`](docs/TESTING.md)
- Historial de versiones: [`CHANGELOG.md`](CHANGELOG.md)

El archivo histórico del refactor está separado en `docs/archive/refactor-2026/` y no es lectura requerida para desarrollo normal.
