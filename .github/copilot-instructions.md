# Copilot Instructions for Educativo IA

## Project Overview
Educativo IA is a web application designed to assist educators in generating structured lesson plans using AI. The project integrates a frontend (HTML, CSS, JavaScript) with a backend (Node.js + Express) and a Supabase database. It leverages OpenAI's GPT-4o-mini for AI-driven content generation.

### Key Features:
- AI-assisted lesson plan generation.
- Integration with Supabase for data storage and authentication.
- Export functionality for Word and Excel.
- Responsive, Excel-like UI.

## Architecture
The project is structured into the following key components:

### Frontend:
- **HTML Templates**: Located in `pages/` (e.g., `dashboard.html`, `login.html`).
- **CSS**: Stylesheets in `css/` (e.g., `dashboard.css`, `global.css`).
- **JavaScript**: Organized under `js/`:
  - `core/`: Core utilities and configurations (e.g., `config.js`, `supabase.client.js`).
  - `pages/`: Page-specific logic (e.g., `dashboard.page.js`, `login.page.js`).
  - `services/`: API service wrappers (e.g., `auth.service.js`, `planeaciones.service.js`).
  - `ui/`: UI-specific scripts (e.g., `dashboard.ui.js`, `components.public.js`).

### Backend:
- Hosted separately (Node.js + Express). Not included in this repository.

### Database:
- Supabase (PostgreSQL) is used for data storage and authentication.

### AI Integration:
- OpenAI GPT-4o-mini is used for generating lesson plans.

## Developer Workflows

### Running the Project Locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/RafaelMenchaca/planeacion-docente-ia.git
   ```
2. Install dependencies (if using a local backend):
   ```bash
   npm install
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```

### Testing:
- Tests are located in `tests/` (e.g., `planeacion.test.js`).
- Use a testing framework like Jest or Mocha (not explicitly mentioned in the `README.md`).

## Project-Specific Conventions

### JavaScript:
- **Modular Structure**: Follow the folder structure for organizing code (e.g., `core/`, `services/`, `ui/`).
- **API Calls**: Use `services/` for all API interactions (e.g., `planeaciones.service.js`).
- **UI Logic**: Place UI-specific code in `ui/` (e.g., `dashboard.ui.js`).

### CSS:
- Use `global.css` for shared styles.
- Page-specific styles should go into their respective CSS files (e.g., `dashboard.css`).

### HTML:
- Templates are in `pages/`.
- Shared components (e.g., navbar, footer) are in `components/`.

## Integration Points

### Supabase:
- Configuration is in `js/core/supabase.client.js`.
- Used for authentication and data storage.

### OpenAI GPT-4o-mini:
- Integrated for generating lesson plans.
- Likely invoked in `services/` or `pages/` scripts.

### Export Functionality:
- Word and Excel export logic is in `js/ui/wordExport.js`.

## Examples

### Adding a New Page:
1. Create an HTML file in `pages/`.
2. Add a corresponding CSS file in `css/`.
3. Write JavaScript logic in `js/pages/`.
4. Update shared components (e.g., navbar) if necessary.

### Adding a New API Service:
1. Create a new file in `js/services/` (e.g., `newFeature.service.js`).
2. Follow the pattern in existing services (e.g., `auth.service.js`).
3. Use the service in the relevant `pages/` or `ui/` script.

---

For further details, refer to the `README.md` or explore the codebase.