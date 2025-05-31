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

- 🔧 Sección principal lading page, login page, dashboard page
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
| Backend           | Node.js + Express *(plan futuro)* |
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
├── .gitignore                # Ignora variables sensibles como .env
├── assets/
│   ├── portada.jpg           # Imagen de portada principal
│   ├── calendar.svg          # Ícono ilustrativo
│   ├── check.svg             # Íconos de beneficios
│   └── click.svg             # Ícono de llamada a la acción
├── components/               
│   ├── footer.html           # Archivo de footer
│   ├── navbar.html           # Archivo de navbar 
│   └── plan-list.html        # Archivo de lista de planeaciones (dasboard)
├── css/
│   ├── index.css             # Estilos para la landing page
│   ├── dashboard.css         # Estilos para el editor de planeaciones
│   ├── login.css             # Estilos para el login
│   └── planeacion.css        # Estilos para pagina de planeacion
├── js/
│   ├── dashboard.js          # Archivo reservado para interactividad futura
│   ├── login.js              # Funcionalidad para login (no base de datos)
│   ├── detalle.js
│   └── planeacion.js         # Funcionalidad de la planeacion
├── dashboard.html            # Página principal (home)
├── detalle.html
├── index.html                # Página principal (landing page)
├── login.html                # Pagina para login
├── planeacion.html           # Pagina para la planeacion
├── CHANGELOG.md
└── README.md

```
---

## 📌 Funcionalidades Principales (MVP)

- ⏳ Crear y editar cajas de texto  
- ⏳ Generar contenido automático con IA  
- ⏳ Personalizar logos y nombre de institución  
- ⏳ Exportar planeación a PDF y Word *(próximamente)*  
- ⏳ Panel de usuario con historial de planeaciones  
- ⏳ Soporte multiformato (COBAC, SEP, UNAM, etc)

---

## 📄 Licencia

Proyecto en desarrollo.  
Todos los derechos reservados por **Rafael Menchaca, Juan Zuñiga**.  
Prohibida su distribución sin autorización.

---

## ✨ Contribuciones

Si deseas colaborar, puedes abrir un **issue** o hacer un **fork** de este repositorio.  
Se aceptan mejoras en la interfaz, backend o diseño de prompts para IA educativa.