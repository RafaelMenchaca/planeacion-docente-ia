# 📦 CHANGELOG

Historial de cambios para la aplicación Educativo IA.

## [v1.9-frontend-hierarchy-explorer] - 2026-02-28

### 🚀 Novedades
- Dashboard convertido en explorador jerárquico multi-plantel:
  Planteles → Grados → Materias → Unidades → Temas.
- Vista responsive: árbol colapsable en desktop y navegación tipo carpetas en móvil.
- Vista de Unidad con flujo completo:
  agregar temas (staging) + botón separado “Generar planeaciones (N)” con estados por tema.
- Acceso directo a detalle de planeación usando relación Tema → Planeación (`tema_id`).

### 🧭 UX
- Onboarding con estados vacíos (sin plantel por defecto): CTA para crear Plantel y continuar jerarquía.
- Breadcrumbs para contexto y navegación rápida.

### 🧩 Compatibilidad
- Se mantiene `detalle.html` como editor principal; navegación nueva inicia desde el dashboard jerárquico.


## [v1.8-Frontend-Refactor-Static-Hosting] - 2026-02-01

### 🚀 Novedades principales
- Refactor completo del **frontend en JavaScript vanilla modular**, alineado con el backend refactorizado.
- Consumo estable del backend limpio sin cambios en endpoints existentes.
- Compatibilidad total con **GitHub Pages (Project Pages)** sin redirecciones ni hacks.
- Carga consistente del landing page (`index.html`) desde la raíz del proyecto.

### 🎨 Mejoras de experiencia (UX)
- Navegación pública y privada completamente funcional desde cualquier página.
- Navbar y footer compartidos cargados dinámicamente sin duplicación de código.
- Corrección de rutas de navegación para evitar errores por profundidad de carpetas.
- Flujo de navegación estable tras refresh, acceso directo por URL o deep links.

### 🧠 Arquitectura Frontend
- Separación clara de responsabilidades:
  - `api/` → llamadas HTTP al backend
  - `services/` → lógica de negocio frontend
  - `ui/` → renderizado y manejo de DOM
  - `pages/` → controladores por página
  - `core/` → configuración global y utilidades
- Introducción de namespaces por página (ej. `window.planeacionPage`) para evitar contaminación global.
- Eliminación de archivos legacy y duplicados (`planeacion.js`).
- `main.js` consolidado como orquestador único de inicialización por página.

### 🧩 Hosting estático y rutas
- Alineación de la estructura del proyecto con las reglas de **GitHub Pages**.
- Uso de `BASE_PATH` dinámico para soportar despliegue como *Project Page*.
- Normalización de enlaces internos mediante `data-href` y reescritura dinámica.
- Desactivación explícita de Jekyll mediante archivo `.nojekyll` para servir archivos estáticos correctamente.
- Eliminación de comportamientos inconsistentes donde GitHub Pages mostraba `README.md` en la primera carga.

### 🧰 Técnicos
- Eliminación de dependencias implícitas en rutas relativas (`../`).
- Código frontend preparado para futura migración a frameworks modernos (React / Next.js) sin reescritura de lógica.
- Sin cambios destructivos en backend ni base de datos.

### 🧩 Próximos pasos
- Documentar arquitectura frontend + backend en README técnico.
- Mejorar UX del flujo batch (estados de carga, errores parciales).
- Aplicar el mismo patrón de navegación a componentes privados.
- Evaluar migración futura a stack moderno cuando el producto lo requiera.


## [v1.7-Batch-Planeacion-Unidad] - 2026-01-18

### 🚀 Novedades principales
- Nuevo flujo de planeación por **Unidad** con soporte para **múltiples temas en un solo submit**.
- Generación de **N planeaciones por N temas**, agrupadas bajo un mismo origen `[materia | nivel | unidad]`.
- Introducción del concepto **Batch** para agrupar planeaciones creadas juntas.
- Nueva vista `batch.html` para listar planeaciones generadas en conjunto.

### 🎨 Mejoras de experiencia (UX)
- Rediseño completo del formulario de planeación.
- Eliminación de **Subtema** y **Sesiones** del input.
- Campo **Unidad** numérico con validación mínima.
- Agregado dinámico de temas con duración individual.
- Bloqueo automático de **materia, nivel y unidad** al agregar el primer tema.
- Sincronización total entre **desktop y mobile** sin pérdida de estado.
- Feedback visual claro al generar planeaciones (estado de éxito por batch).

### 🧠 Arquitectura Frontend
- Estado centralizado para planeación (`estadoPlaneacion`).
- DOM deja de ser la fuente de verdad.
- Payload enviado al backend alineado 1:1 con el estado real.
- Navegación clara: `planeacion → batch → detalle`.

### 🧰 Backend y API
- Endpoint de generación refactorizado para múltiples temas.
- Inserción de múltiples planeaciones por submit.
- Nuevo endpoint seguro para listar planeaciones por `batch_id`.
- Filtrado por usuario con `requireAuth`.
- Uso consistente de `fecha_creacion` para ordenamiento.
- Eliminación definitiva de lógica obsoleta (subtema, sesiones).

### 🗄️ Base de datos (Supabase)
- Nueva columna `batch_id` para agrupar planeaciones.
- Nueva columna `unidad` integrada al modelo principal.
- Esquema alineado con el nuevo flujo de planeación.
- RLS respetado para accesos por usuario.

### ⚙️ Próximos pasos
- Dashboard agrupado por Unidad / Batch.
- Exportación de unidades completas.
- Mejora visual de la vista batch.


## [v1.6-IA-Integration-Release] - 2026-01-03

### 🚀 Novedades principales
- Integración real con **OpenAI GPT-4o-mini** para generación de planeaciones didácticas dinámicas.
- IA adaptada al contexto educativo mexicano (PAEC, producto, instrumento, evaluación).
- Mejor distribución de tiempos y lenguaje adecuado por nivel educativo.
- Backend optimizado con manejo de errores, fallback seguro y logs claros.
- Frontend totalmente integrado con flujo de IA real y Supabase.

### 🎨 Mejoras visuales
- Nuevo loader “Generando planeación con IA…” durante el proceso de generación.
- Botones de descarga **Word (.doc)** y **Excel (.xlsx)** agregados al flujo principal.
- Tabla de planeación optimizada: sin scroll horizontal, columnas fijas, y diseño profesional Bootstrap.

### 🧰 Funcionalidad completa
- Flujo completo: frontend → backend → IA → Supabase → visualización → descargas.
- Exportación a Word y Excel directamente desde `planeacion.html` y `detalle.html`.
- Mantenimiento de compatibilidad con Supabase JSONB.

### 🐞 Correcciones
- Corrección del error al cargar planeaciones en `detalle.html`.
- Botones de descarga conectados con listeners dinámicos para evitar problemas de alcance.

### ⚙️ Próximos pasos
- Edición libre de planeaciones desde `detalle.html`.
- Ajuste adaptativo de IA según nivel educativo.
- Exportaciones profesionales con logo e identidad institucional.

---

## [v1.5-public-pages-refactor] - 2025-09-20

### 🌐 Nuevas páginas públicas
- `beneficios.html`: página dedicada con 6 beneficios principales de la app, usando cards minimalistas con íconos.
- `como_funciona.html`: página explicativa con lista de pasos e íconos temáticos para mostrar el flujo de uso de la plataforma.
- `precios.html`: página de planes y precios con diseño basado en componentes Bootstrap y adaptado a colores institucionales.

### 🎨 Refinamiento visual
- Eliminado el fondo azul de los hero secundarios (`beneficios` y `como_funciona`), ahora con estilo minimalista en fondo claro.
- Tipografía regular (no bold) en títulos principales de estas páginas, manteniendo consistencia con `precios.html`.
- Ajustado espaciado superior e inferior en hero y secciones para dar más aire entre navbar, contenido y footer.

### 🧩 Modularización de componentes
- Navbar y footer públicos extraídos a `components/navbar_public.html` y `components/footer_public.html`.
- Se cargan dinámicamente con `components_public.js`, permitiendo mantener coherencia y simplificar mantenimiento entre páginas.

---

## [v1.4-detalle-planeacion-supabase] - 2025-06-06

### 🧾 Visualización detallada de planeaciones
- `detalle.html` ahora muestra toda la planeación en formato tabla, con sesiones por subtema.
- Estructura visual heredada de `planeacion.html` para mantener coherencia entre páginas.
- Las tablas incluyen: sesión, tiempo, momento, actividad, producto de aprendizaje, instrumento de evaluación y evaluación.

### 🧠 Datos pedagógicos conectados a Supabase
- Se visualiza correctamente el contenido guardado: objetivos, modalidad, metodologías, habilidades, estilos, trabajo, recursos y evaluación.
- Lógica condicional para mostrar “No especificado” o “Ninguno” cuando faltan datos.

### 🎨 Estilo de tabla centralizado
- Se creó `tabla.css` con estilos reutilizables para tablas de planeación.
- Eliminados `<style>` embebidos en `detalle.js` y `planeacion.js`, mejorando limpieza y mantenimiento.

### ✅ Mejoras funcionales
- `generarPlaneacion()` optimizada para reflejar con precisión los datos introducidos.
- Las sesiones por subtema se muestran dinámicamente según la duración y número indicado.

---

## [v1.3-auth-planeaciones] - 2025-05-31

### 🔐 Autenticación con Supabase
- Login funcional con correo y contraseña usando Supabase Auth.
- Sesión persistente y protegida con `auth.js`.
- Logout implementado desde navbar y protegido en múltiples pestañas abiertas.
- Redirección automática a login si no hay sesión activa en `dashboard`, `planeacion` o `detalle`.

### 📄 Generación de planeaciones mejorada
- Al finalizar la planeación, se muestra un resumen en pantalla sin redirigir al dashboard.
- Scroll automático hacia el resumen y botones finales visibles.
- Botones agregados:
  - `Volver al dashboard`
  - `Ver planeación` (redirige con ID dinámico a `detalle.html?id=X`)
- Prevención de múltiples envíos usando lógica `enviado = true` y desactivación de botón.

### 🛠️ Backend actualizado
- Ruta POST `/api/planeaciones` ahora devuelve el ID recién creado para usarlo en el frontend.
- Limpieza de código duplicado y mejora de control de errores.

### 🔎 Visualización en detalle.html
- `detalle.js` actualizado para mostrar los campos en texto legible, no como JSON crudo.
- Muestra correcta del nombre de materia, tema, nivel, duración, fecha y detalles pedagógicos.
- Manejadores para mostrar “No especificado” o “Ninguno” cuando falte información.

---

## [v1.2-dashboard-componentes] - 2025-05-18

### 🧱 Reestructuración de layout
- Dashboard reorganizado con sistema `flex` para ocupar toda la altura de la pantalla sin scroll global.
- El `<main>` se adapta dinámicamente al espacio entre el navbar y el footer.
- Separación visual agregada entre el contenido principal y el footer.

### 🧩 Modularización de componentes
- Encabezado (`tabla-encabezado`), lista de planeaciones (`tabla-scroll`) y botón “Crear nueva planeación” ahora estructurados como componentes independientes reutilizables.
- Se implementó sticky header para mantener los títulos de columnas visibles mientras se hace scroll en la lista.
- Estructura semántica y visual similar a una tabla tipo Excel con columnas: ID, Nombre, Fecha, Acciones.

### 🎨 Mejoras visuales y de interacción
- Efecto hover restaurado en cada fila de planeación (`.fila-planeacion`) con desplazamiento suave.
- Estilos personalizados para scrollbar, sin scroll horizontal innecesario.
- Colores adaptados a diseño institucional, incluyendo fondo del footer con `#4f46e5`.
- Se eliminó completamente el scroll vertical en el body.
- Cursor tipo flecha aplicado globalmente excepto en botones, enlaces e inputs.

---

## [v1.1-dashboard-responsive] - 2025-05-09

### 🆕 Nuevas funcionalidades
- Sidebar fijo para escritorio y versión hamburguesa para móviles/tablets.
- Comportamiento responsive mejorado para tamaños:
  - Mobile S (320px)
  - Mobile M (375px)
  - Mobile L (425px)
  - Tablet (768px)

### 🎨 Mejoras visuales
- Botón `+ Crear Nueva Planeación` separado del listado, ahora centrado y con tamaño propio.
- Se agregó scroll interno a la sección de planeaciones, evitando scroll general de la página.
- El botón de cerrar menú (×) ahora solo aparece en móvil/tablet.

---

## [v1.0] - 2025-05-01

- Landing page y login funcionales.
- Primera versión del dashboard con listado de planeaciones.

---