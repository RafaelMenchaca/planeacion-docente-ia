# 📦 CHANGELOG

Historial de cambios para la aplicación Educativo IA.

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