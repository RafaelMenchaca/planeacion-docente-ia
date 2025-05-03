# 🧠 Planeación Escolar con IA – Generador Inteligente de Planeaciones Docentes

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

## 🛠️ Stack Tecnológico

| Componente        | Tecnología              |
|-------------------|--------------------------|
| Frontend          | React.js + Next.js       |
| Estilos           | Tailwind CSS             |
| Animaciones/UX    | Framer Motion / React DnD|
| Backend           | Node.js + Express        |
| Base de datos     | PostgreSQL o MongoDB     |
| IA Generativa     | OpenAI API (GPT-4 Turbo) |
| Exportación       | react-pdf / docx-js / Puppeteer |
| Autenticación     | Firebase Auth / Auth0    |
| Almacenamiento    | AWS S3 / Google Cloud    |
| Infraestructura   | Vercel o Render          |

---

## 📦 Estructura Inicial del Proyecto

```bash
/Educativo_ia                 # 🔰 Nombre del proyecto raíz (actualizado)
/                             # (Directorio principal del repositorio)
├── css/                      # Estilos separados por vista
│   ├── index.css             # Estilos para index.html
│   └── editor.css            # Estilos para editor.html
├── js/                       # Lógica futura en JavaScript
│   └── (vacío por ahora)     
├── assets/                   # Carpeta de imágenes, íconos, etc.
│   └── (vacío por ahora)
├── editor.html               # Página del editor de planeaciones
├── index.html                # Página de inicio (dashboard)
├── README.md                 # Documentación del proyecto
├── .git/                     # Carpeta interna de Git (automática)
└── .gitignore                # Ignora archivos sensibles
    └── .env                  # Variables de entorno privadas (NO subir a GitHub)

```
---

## 📌 Funcionalidades Principales (MVP)

- ✅ Crear y editar cajas de texto  
- ✅ Generar contenido automático con IA  
- ✅ Personalizar logos y nombre de institución  
- ✅ Exportar planeación a PDF y Word  
- ⏳ Panel de usuario con historial de planeaciones  
- ⏳ Soporte multiformato (COBAC, SEP, UNAM, etc)

---

## 📄 Licencia

Proyecto en desarrollo.  
Todos los derechos reservados por **Rafael Menchaca**.  
Prohibida su distribución sin autorización.

---

## ✨ Contribuciones

Si deseas colaborar, puedes abrir un **issue** o hacer un **fork** de este repositorio.  
Se aceptan mejoras en la interfaz, backend o diseño de prompts para IA educativa.
