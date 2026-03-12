# Educativo IA Frontend

Frontend de Educativo IA, una aplicacion web para docentes que centraliza la creacion, consulta y edicion de planeaciones didacticas apoyadas por inteligencia artificial.

Este repositorio contiene la experiencia web publica y privada del producto: landing pages, autenticacion con Supabase, explorador academico por plantel/grado/materia/unidad, generacion de planeaciones por tema y vistas de detalle con exportacion.

## Alcance del repositorio

Este proyecto corresponde unicamente al frontend. La generacion de contenido con IA, la persistencia principal y la exportacion de ciertos archivos dependen de un backend HTTP externo consumido desde el navegador.

Funciones cubiertas en este repositorio:

- Sitio publico con paginas informativas, precios, beneficios y contacto.
- Login con Supabase Auth para acceder a las vistas privadas.
- Dashboard tipo explorador para navegar la jerarquia academica.
- Alta y eliminacion de planteles, grados, materias, unidades y temas.
- Generacion de una o varias planeaciones con seguimiento de progreso.
- Vista de detalle para revisar, editar y exportar planeaciones.
- Componentes HTML reutilizables cargados dinamicamente.

## Stack tecnico

- HTML5, CSS3 y JavaScript vanilla.
- Bootstrap 5 para la experiencia publica.
- Tailwind CSS para las vistas privadas y el dashboard.
- Supabase JS para autenticacion de usuarios.
- Jest + JSDOM para pruebas unitarias del frontend.
- PostCSS + Autoprefixer para la compilacion de estilos.

## Arquitectura general

La aplicacion sigue una organizacion simple por capas dentro de `js/`:

- `js/core/`: configuracion global, utilidades y cliente de Supabase.
- `js/api/`: llamadas `fetch` hacia el backend.
- `js/services/`: logica de sesion y orquestacion de operaciones.
- `js/pages/`: controladores por pagina.
- `js/ui/`: renderizado, componentes privados/publicos y exportacion.

La interfaz se divide en dos areas:

- Area publica: `index.html` y paginas de marketing en `pages/`.
- Area privada: `pages/dashboard.html`, `pages/batch.html` y `pages/detalle.html`, protegidas por sesion activa.

## Estructura del proyecto

Se muestra la estructura actual del proyecto. Se omiten `.git/` y `node_modules/` por brevedad:

```text
planeacion-docente-ia/
|-- .github/
|   `-- copilot-instructions.md
|-- assets/
|   |-- docente1.jpg
|   |-- docente2.jpg
|   |-- docente3.jpg
|   |-- docente4.jpg
|   |-- laptop.png
|   |-- paso1_v2.png
|   |-- paso2.png
|   |-- paso3.png
|   |-- paso4.png
|   `-- portada.jpg
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
|   |   |-- jerarquia.api.js
|   |   `-- planeaciones.api.js
|   |-- core/
|   |   |-- config.js
|   |   |-- supabase.client.js
|   |   `-- utils.js
|   |-- pages/
|   |   |-- batch.page.js
|   |   |-- dashboard-tailwind.page.js
|   |   |-- dashboard.page.js
|   |   |-- detalle.page.js
|   |   |-- login.page.js
|   |   `-- planeacion.page.js
|   |-- services/
|   |   |-- auth.service.js
|   |   |-- jerarquia.service.js
|   |   `-- planeaciones.service.js
|   |-- ui/
|   |   |-- batch.ui.js
|   |   |-- components.private.js
|   |   |-- components.public.js
|   |   |-- dashboard.ui.js
|   |   |-- detalle.ui.js
|   |   |-- planeacion.ui.js
|   |   `-- wordExport.js
|   `-- main.js
|-- pages/
|   |-- batch.html
|   |-- beneficios.html
|   |-- como_funciona.html
|   |-- contacto.html
|   |-- dashboard.html
|   |-- dashboard_tailwind.html
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
|-- package-lock.json
|-- package.json
|-- postcss.config.js
|-- README.md
`-- tailwind.config.js
```

## Flujo funcional principal

1. El usuario inicia sesion mediante Supabase.
2. El frontend protege las rutas privadas desde `js/main.js`.
3. El dashboard carga la jerarquia academica desde el backend.
4. Desde una unidad, el usuario agrega temas y dispara la generacion.
5. El backend responde con progreso y resultados por lote.
6. La planeacion puede revisarse en detalle, editarse y exportarse.

## Requisitos para desarrollo local

- Node.js 18 o superior.
- npm 9 o superior.
- Un backend compatible ejecutandose en `http://localhost:3000`.
- Acceso al proyecto de Supabase usado por la aplicacion.
- Un servidor estatico para servir el frontend por `http://localhost` o `http://127.0.0.1`.

## Configuracion actual

La configuracion del frontend hoy esta definida directamente en archivos del proyecto:

- `js/core/config.js` selecciona el backend local `http://localhost:3000` cuando la app se abre desde `localhost` o `127.0.0.1`; en cualquier otro caso usa el backend de produccion.
- `js/core/supabase.client.js` inicializa el cliente de Supabase con la URL y la clave publica anon.

Si se va a preparar el proyecto para produccion o para varios entornos, conviene externalizar estos valores en un mecanismo de configuracion por ambiente.

## Instalacion

```bash
npm install
```

## Scripts disponibles

```bash
npm test
npm run dev:css
npm run build:css
```

Descripcion rapida:

- `npm test`: ejecuta la suite de pruebas con Jest.
- `npm run dev:css`: recompila `css/tailwind.css` en modo watch.
- `npm run build:css`: genera la version minificada de `css/tailwind.css`.

## Como ejecutar el frontend

1. Levanta el backend en `http://localhost:3000`.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run dev:css` si vas a modificar estilos Tailwind.
4. Sirve esta carpeta con un servidor estatico en otro puerto, por ejemplo `5500`.
5. Abre `http://127.0.0.1:5500` en el navegador.

Ejemplo de servidor estatico:

```bash
npx serve . -l 5500
```

## Paginas relevantes

- `index.html`: landing principal.
- `pages/login.html`: acceso de usuarios.
- `pages/dashboard.html`: explorador academico y generacion de planeaciones.
- `pages/batch.html`: vista de resultados agrupados por lote.
- `pages/detalle.html`: revision, edicion y exportacion de una planeacion.

## Notas de mantenimiento

- `pages/planeacion.html` hoy redirige al dashboard; la experiencia activa de generacion vive en `pages/dashboard.html`.
- El proyecto mezcla Bootstrap y Tailwind de forma intencional segun el tipo de vista.
- Parte de la UI se compone cargando fragmentos HTML desde `components/`.

## Estado del proyecto

El repositorio ya cubre una experiencia funcional de frontend para autenticacion, exploracion de estructura academica y generacion asistida de planeaciones, pero sigue dependiendo de servicios externos para operar por completo.

## Licencia

Este repositorio no incluye una licencia OSS explicita. Si se va a distribuir o reutilizar fuera del equipo propietario, conviene definir una licencia formal.
