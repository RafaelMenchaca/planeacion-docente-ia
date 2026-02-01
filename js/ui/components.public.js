function getBasePath() {
  // Para URLs tipo:
  // https://usuario.github.io/repo/
  const parts = window.location.pathname.split('/');
  return parts.length > 1 ? `/${parts[1]}` : '';
}

// Exponemos BASE_PATH globalmente
window.BASE_PATH = getBasePath();

function fixLinks(scope = document) {
  scope.querySelectorAll('[data-href]').forEach(link => {
    const path = link.getAttribute('data-href');
    link.setAttribute('href', `${window.BASE_PATH}${path}`);
  });
}

async function loadComponent(id, file) {
  const response = await fetch(file);
  const content = await response.text();
  const container = document.getElementById(id);

  if (!container) return;

  container.innerHTML = content;

  // Normaliza links dentro del componente cargado
  fixLinks(container);
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", `${window.BASE_PATH}/components/navbar_public.html`);
  loadComponent("footer", `${window.BASE_PATH}/components/footer_public.html`);
});
