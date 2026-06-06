# Educativo IA Frontend

Frontend de Educativo IA, una aplicacion web para docentes que centraliza la creacion, consulta y exportacion de planeaciones didacticas, examenes, anexos y listas de cotejo asistidos por inteligencia artificial.

La **Biblioteca** es el flujo principal del area privada: agrupa todos los documentos generados por unidad academica y permite ver, descargar o eliminar cada documento desde un solo lugar.

## Alcance del repositorio

Este proyecto corresponde unicamente al frontend. La generacion de contenido con IA, la persistencia y la exportacion de archivos dependen de un backend HTTP externo consumido desde el navegador.

Funciones cubiertas en este repositorio:

- Sitio publico: landing page, beneficios, como funciona, precios y contacto.
- Login, registro y recuperacion de contrasena con Supabase Auth.
- Dashboard tipo explorador para navegar la jerarquia academica (planteles → grados → materias → unidades → temas).
- Alta y eliminacion de cada nivel de la jerarquia.
- Generacion de planeaciones por tema con seguimiento de progreso por lote.
- **Biblioteca**: vista central que agrupa los documentos de cada unidad en cuatro tabs: Planeaciones, Anexos, Listas de cotejo y Examenes.
  - Acciones por documento: ver detalle, descargar (Word), eliminar.
  - Modal de nombre de archivo antes de cualquier descarga.
  - Generacion de anexos seleccionados directamente desde la Biblioteca.
- Vista de archivados con opciones de restaurar o eliminar de forma permanente.
- Detalle de planeacion con edicion y exportacion a Word y Excel.
- Componentes HTML reutilizables (navbar, footer, sidebar) cargados dinamicamente.
- Toast notifications para feedback de operaciones (reemplaza `alert()` nativo).

## Stack tecnico

- HTML5, CSS3 y JavaScript vanilla.
- Bootstrap 5 para la experiencia publica.
- Tailwind CSS para las vistas privadas y el dashboard.
- Supabase JS para autenticacion de usuarios.
- Jest + JSDOM para pruebas unitarias del frontend.
- PostCSS + Autoprefixer para la compilacion de estilos.

## Arquitectura general

La aplicacion sigue una organizacion por capas dentro de `js/`:

- `js/core/`: configuracion global, utilidades y cliente de Supabase.
- `js/api/`: llamadas `fetch` hacia el backend, una por dominio.
- `js/services/`: logica de sesion y orquestacion de operaciones.
- `js/pages/`: controladores por pagina.
- `js/ui/`: renderizado, componentes y helpers de interfaz.

La interfaz se divide en dos areas:

- Area publica: `index.html` y paginas de marketing en `pages/`.
- Area privada: `pages/dashboard.html`, `pages/biblioteca.html`, `pages/archivados.html`, `pages/detalle.html`, protegidas por sesion activa.

## Estructura del proyecto

```text
planeacion-docente-ia/
|-- assets/
|-- components/
|   |-- footer.html
|   |-- footer_public.html
|   |-- header.html
|   |-- layout.html
|   |-- navbar.html
|   |-- navbar_public.html
|   `-- sidebar.html
|-- css/
|   |-- base.css
|   |-- batch.css
|   |-- dashboard.css
|   |-- dashboard_tailwind.css
|   |-- detalle.css
|   |-- global.css
|   |-- index.css
|   |-- login.css
|   |-- planeacion.css
|   `-- tailwind.css
|-- js/
|   |-- api/
|   |   |-- anexos.api.js
|   |   |-- biblioteca.api.js
|   |   |-- examenes.api.js
|   |   |-- jerarquia.api.js
|   |   |-- listas_cotejo.api.js
|   |   `-- planeaciones.api.js
|   |-- core/
|   |   |-- config.js
|   |   |-- supabase.client.js
|   |   `-- utils.js
|   |-- pages/
|   |   |-- archivados.page.js
|   |   |-- batch.page.js
|   |   |-- biblioteca.page.js
|   |   |-- dashboard.page.js
|   |   |-- detalle.page.js
|   |   |-- login.page.js
|   |   `-- planeacion.page.js
|   |-- services/
|   |   |-- auth.service.js
|   |   |-- examenes.service.js
|   |   |-- jerarquia.service.js
|   |   |-- listas_cotejo.service.js
|   |   `-- planeaciones.service.js
|   |-- ui/
|   |   |-- batch.ui.js
|   |   |-- components.private.js
|   |   |-- components.public.js
|   |   |-- dashboard.ui.js
|   |   |-- detalle.ui.js
|   |   |-- planeacion.ui.js
|   |   |-- shared.ui.js
|   |   `-- wordExport.js
|   `-- main.js
|-- pages/
|   |-- archivados.html
|   |-- batch.html
|   |-- beneficios.html
|   |-- como_funciona.html
|   |-- contacto.html
|   |-- dashboard.html
|   |-- detalle.html
|   |-- login.html
|   |-- planeacion.html
|   |-- precios.html
|   |-- recuperar.html
|   `-- registro.html
|-- tests/
|   `-- planeacion.test.js
|-- .gitignore
|-- .nojekyll
|-- CHANGELOG.md
|-- index.html
|-- package.json
|-- postcss.config.js
|-- README.md
`-- tailwind.config.js
```

## Modulos API

Cada archivo en `js/api/` encapsula las llamadas `fetch` hacia un dominio del backend:

| Archivo | Descripcion |
|---|---|
| `planeaciones.api.js` | Generacion y consulta de planeaciones |
| `biblioteca.api.js` | Conjuntos/batches de la Biblioteca |
| `anexos.api.js` | Generacion y consulta de anexos |
| `examenes.api.js` | Generacion y consulta de examenes |
| `listas_cotejo.api.js` | Generacion y consulta de listas de cotejo |
| `jerarquia.api.js` | CRUD de la jerarquia academica |

## Flujo funcional principal

1. El usuario inicia sesion mediante Supabase.
2. `js/main.js` protege las rutas privadas y carga el controlador de pagina correspondiente.
3. El dashboard carga la jerarquia academica desde el backend.
4. Desde una unidad el usuario agrega temas y dispara la generacion de planeaciones.
5. Una vez generadas, accede a la **Biblioteca** de esa unidad para ver todos sus documentos agrupados por tabs.
6. Desde la Biblioteca puede descargar (Word), eliminar, o generar anexos para las planeaciones del conjunto.
7. El detalle de cada planeacion permite revision, edicion y exportacion adicional.
8. Documentos archivados se gestionan desde `pages/archivados.html`.

## Requisitos para desarrollo local

- Node.js 18 o superior.
- npm 9 o superior.
- El backend de Educativo IA ejecutandose en `http://localhost:3000`.
- Acceso al proyecto de Supabase usado por la aplicacion.
- Un servidor estatico para servir el frontend (por ejemplo en el puerto 5500).

## Configuracion

`js/core/config.js` selecciona automaticamente el backend segun el hostname:

- `localhost` o `127.0.0.1` → `http://localhost:3000`
- Cualquier otro host → `https://educativo-backend.onrender.com`

No se requiere ningun archivo `.env` en el frontend. La clave publica anon de Supabase esta en `js/core/supabase.client.js` (es la clave publica de solo lectura, no la service role).

## Instalacion

```bash
npm install
```

## Scripts disponibles

```bash
npm test           # Ejecuta la suite de pruebas con Jest
npm run dev:css    # Recompila css/tailwind.css en modo watch
npm run build:css  # Genera la version minificada de css/tailwind.css
```

## Como ejecutar el frontend localmente

1. Levanta el backend en `http://localhost:3000`.
2. Instala dependencias con `npm install`.
3. Si vas a modificar estilos Tailwind ejecuta `npm run dev:css` en una terminal aparte.
4. Sirve esta carpeta con un servidor estatico en el puerto 5500.

```bash
npx serve . -l 5500
```

5. Abre `http://127.0.0.1:5500` en el navegador.
6. Inicia sesion con una cuenta de Supabase valida para acceder a las vistas privadas.

## Paginas relevantes

| Pagina | Descripcion |
|---|---|
| `index.html` | Landing principal |
| `pages/login.html` | Acceso de usuarios |
| `pages/registro.html` | Registro de nuevos usuarios |
| `pages/dashboard.html` | Explorador academico y generacion de planeaciones |
| `pages/archivados.html` | Documentos archivados con restore y eliminacion permanente |
| `pages/detalle.html` | Revision, edicion y exportacion de una planeacion |
| `pages/batch.html` | Vista legacy de resultados agrupados por lote |

La Biblioteca se carga como vista dentro del dashboard principal, controlada por `js/pages/biblioteca.page.js`.

## Relacion con el backend

El frontend consume la API REST del backend de Educativo IA. Los endpoints disponibles estan documentados en el README del repositorio de backend (`educativo_backend/Educativo-Backend/`).

La URL base del backend se configura automaticamente en `js/core/config.js` segun el entorno.

## Despliegue en GitHub Pages

El proyecto se despliega como GitHub Pages (Project Page). Puntos relevantes:

- `.nojekyll` en la raiz desactiva el procesamiento de Jekyll para que los archivos estaticos se sirvan correctamente.
- `js/core/config.js` detecta el hostname para apuntar al backend de produccion automaticamente.
- Antes de desplegar, ejecutar `npm run build:css` para generar el CSS de produccion.

## Notas de mantenimiento

- `js/ui/shared.ui.js` contiene helpers de UI reutilizados entre `biblioteca.page.js` y `dashboard.page.js` (toasts, modales, utilidades de renderizado).
- `dashboard.page.js` tiene aproximadamente 4,500 lineas y es candidato a refactor por modulos.
- El proyecto mezcla Bootstrap y Tailwind de forma intencional: Bootstrap para paginas publicas, Tailwind para el area privada.
- `pages/planeacion.html` y `js/planeacion.js` son archivos legacy; el flujo activo de generacion vive en `pages/dashboard.html`.
- `pages/batch.html` sigue existiendo pero el punto de entrada principal de los resultados es la Biblioteca.

## Licencia

Este repositorio no incluye una licencia OSS explicita. Si se va a distribuir o reutilizar fuera del equipo propietario, conviene definir una licencia formal.
