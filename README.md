# 🎓 Educativo IA – Generador Inteligente de Planeaciones Didácticas

📍 **Versión actual:** v1.6-ai-integration (Frontend) / v1.0-ai-backend  
🌐 **Sitio en vivo:** [https://rafaelmenchaca.github.io/planeacion-docente-ia/](https://rafaelmenchaca.github.io/planeacion-docente-ia/)  
👤 **Autor:** [Rafael Menchaca](https://rafaelmenchaca.com)

---

## 🚀 Descripción

**Educativo IA** es una aplicación web que permite a los docentes generar planeaciones didácticas completas con apoyo de **inteligencia artificial**.  
En lugar de redactar manualmente cada sección, la IA genera las actividades, productos, instrumentos de evaluación y tiempos, siguiendo la estructura académica oficial (PAEC y momentos de clase).

El sistema combina **automatización y personalización**, permitiendo que cada profesor conserve el control sobre su contenido.

---

## 🧩 Características principales

- 🤖 **IA real integrada** con GPT-4o-mini (OpenAI API)  
- 💾 **Guardado automático** en Supabase (PostgreSQL + JSONB)  
- 🧮 **Generación estructurada** en tres momentos:
  - Conocimientos previos  
  - Desarrollo  
  - Cierre  
- 📑 **Exportación profesional** a Word y Excel  
- 💬 **Feedback visual y loader IA** al generar planeaciones  
- 🎨 **UI tipo Excel mejorada**, limpia y responsive  
- 🔐 Autenticación local (Supabase Auth en desarrollo)

---

## 🧠 Objetivo

Transformar la planeación docente en un proceso ágil, guiado por IA y con formato profesional.  
Educativo IA busca ahorrar tiempo a los maestros y elevar la calidad del diseño pedagógico.

---

## 👥 Público objetivo

- Docentes de educación básica, media y superior.  
- Coordinadores académicos y planeadores escolares.  
- Instituciones que deseen estandarizar la planeación de clases.  

---

## 🛠️ Stack Tecnológico

| Módulo | Tecnología |
|--------|-------------|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap 5 |
| **Backend** | Node.js + Express |
| **Base de datos** | Supabase (PostgreSQL) |
| **IA** | OpenAI GPT-4o-mini |
| **Hosting** | Render (backend) + GitHub Pages (frontend) |

---

## 📦 Estado actual (v1.6 – IA Integration)

- ✅ Conexión estable entre frontend ↔ backend ↔ Supabase  
- ✅ IA funcional con generación automática coherente  
- ✅ Exportaciones Excel y Word con datos reales  
- ✅ Dashboard y detalle de planeaciones operativos  
- ✅ Diseño refinado tipo Excel profesional  

---

## 🧪 Pruebas y desarrollo local

```bash
# Clonar repositorio
git clone https://github.com/RafaelMenchaca/planeacion-docente-ia.git

# Instalar dependencias (solo si usas backend local)
npm install

# Ejecutar backend local
npm run dev
```

## 🤝 Contribuciones

Si deseas colaborar, puedes abrir un **issue** o hacer un **fork** de este repositorio.  
Se aceptan mejoras en la interfaz, backend o diseño de prompts para Educativo IA.

“La inteligencia artificial no reemplaza al maestro; lo libera para enfocarse en enseñar.” – Educativo IA


## 📄 Licencia
© 2026 Rafael Menchaca.
Proyecto en desarrollo por **Rafael Menchaca, Juan Zuñiga**
Todos los derechos reservados.