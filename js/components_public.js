async function loadComponent(id, file) {
  const response = await fetch(file);
  const content = await response.text();
  document.getElementById(id).innerHTML = content;
}

// Cargar navbar y footer en todas las páginas
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "components/navbar_public.html");
  loadComponent("footer", "components/footer_public.html");
});
