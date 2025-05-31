# 📦 CHANGELOG

Historial de cambios para la aplicación Educativo IA.

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