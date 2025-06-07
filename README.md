# 🧠 Planeación Escolar con IA – Generador Inteligente de Planeaciones Docentes

📍 **Visita el sitio en vivo:**  
👉 [https://rafaelmenchaca.github.io/planeacion-docente-ia/](https://rafaelmenchaca.github.io/planeacion-docente-ia/)

Este proyecto busca transformar el proceso de planeación académica para docentes, permitiendo generar, editar y exportar formatos oficiales de planeación con asistencia de inteligencia artificial.

---

## 🚀 Descripción del Proyecto

Una plataforma web donde el profesor:
- Elige o construye su formato de planeación escolar (como el del COBAC o SEP).
- Selecciona campos o cajas de texto editables.
- Usa inteligencia artificial para generar automáticamente contenido relevante: objetivos, progresiones, actividades, competencias, etc.
- Personaliza el documento con los logotipos y datos de su institución.
- Exporta su planeación en **PDF** o **Word** con formato profesional.

---

## 🎯 Público Objetivo

- Escuelas públicas y privadas (primaria, secundaria, media superior).
- Docentes y coordinadores académicos.
- Instituciones educativas que deseen optimizar el tiempo de planeación.

---

## 🌟 Avances recientes

 - 🔧 Sección principal landing page, login page, dashboard page
- ✅ Header reorganizado para mejorar visual en dispositivos móviles
- 📱 Diseño adaptable en pantallas móviles, tablets y escritorio
- 🚀 Despliegue del sitio en **GitHub Pages**

---

## 🛠️ Stack Tecnológico

| Componente        | Tecnología              |
|-------------------|--------------------------|
| Frontend          | HTML, CSS (modularizado) |
| Estilos           | CSS personalizado (sin frameworks por ahora) |
| Animaciones/UX    | En desarrollo            |
| Backend           | Node.js + Express |
| Base de datos     | PostgreSQL o MongoDB *(plan futuro)* |
| IA Generativa     | OpenAI API *(plan futuro)* |
| Exportación       | PDF/Word *(próximamente)* |
| Autenticación     | Firebase/Auth0 *(plan futuro)* |
| Almacenamiento    | AWS S3 / GCS *(plan futuro)* |
| Infraestructura   | GitHub Pages *(temporal para frontend)*|

---

## 📦 Estructura del Proyecto

```bash

/Educativo_ia                 # 🔰 Nombre del proyecto raíz
├── assets/                   # Archivos visuales e íconos
│   ├── calendar.svg          # Ícono ilustrativo
│   ├── check.svg             # Íconos de beneficios
│   ├── click.svg             # Ícono de llamada a la acción
│   └── portada.jpg           # Imagen de portada principal
├── components/               
│   ├── footer.html           # Pie de página
│   └── navbar.html           # Barra de navegación
├── css/
│   ├── dashboard.css         # Estilos para el dashboard de planeaciones
│   ├── index.css             # Estilos para la landing page
│   ├── login.css             # Estilos para la pantalla de login
│   ├── planeacion.css        # Estilos para formulario de planeación
│   └── tabla.css             # Estilos para tablas con sesiones
├── js/
│   ├── auth.js               # Protege rutas y maneja login persistente
│   ├── config.js             # Config global con API_BASE_URL
│   ├── dashboard.js          # Interactividad futura para dashboard
│   ├── detalle.js            # Muestra detalles de planeación con estructura
│   ├── login.js              # Login sin base de datos (modo local)
│   ├── navbar.js             # Carga navbar en páginas protegidas
│   ├── planeacion.js         # Genera planeaciones y las guarda en Supabase
│   └── supabaseClient.js     # Conexión con Supabase Auth y DB
├── node_modules/             # Dependencias instaladas por npm
├── test/
│   └── planeacion.test.js    # Test para funciones de planeación (en progreso)
├── .gitignore                # Ignora variables sensibles como .env
├── CHANGELOG.md              # Registro de versiones del proyecto
├── dashboard.html            # Vista protegida con lista de planeaciones
├── detalle.html              # Muestra detalles completos de cada planeación
├── index.html                # Página de aterrizaje (landing)
├── login.html                # Pantalla de acceso con email/contraseña
├── package.json              # Configuración del proyecto Node.js
├── planeacion.html           # Formulario paso a paso para crear planeaciones
└── README.md                 # Instrucciones del proyecto

```
La carpeta `components/` solo incluye `footer.html` y `navbar.html`, utilizados para modularizar la navegación y el pie de página.
---

## 📌 Funcionalidades Principales (MVP)

- ⏳ Crear y editar cajas de texto  
- ⏳ Generar contenido automático con IA  
- ⏳ Personalizar logos y nombre de institución  
- ⏳ Exportar planeación a PDF y Word *(próximamente)*  
- ⏳ Panel de usuario con historial de planeaciones
- ⏳ Soporte multiformato (COBAC, SEP, UNAM, etc)

---

## 🧪 Pruebas

Ejecuta las pruebas unitarias con **Jest** para validar la lógica del formulario.

```bash
npm install
npm test
```

---

## 📄 Licencia

Proyecto en desarrollo.  
Todos los derechos reservados por **Rafael Menchaca, Juan Zuñiga**.  
Prohibida su distribución sin autorización.

---

## ✨ Contribuciones

Si deseas colaborar, puedes abrir un **issue** o hacer un **fork** de este repositorio.  
Se aceptan mejoras en la interfaz, backend o diseño de prompts para IA educativa.