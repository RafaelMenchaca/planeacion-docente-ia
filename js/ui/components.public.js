function getCurrentPublicScript() {
  if (document.currentScript?.src) {
    return document.currentScript;
  }

  return Array.from(document.scripts).find(
    (script) => script.src && script.src.includes("/js/ui/components.public.js")
  ) || null;
}

function getPublicAppBaseUrl() {
  const script = getCurrentPublicScript();

  if (script?.src) {
    return new URL("../../", script.src);
  }

  const isNestedPublicPage = window.location.pathname.includes("/pages/");
  return new URL(isNestedPublicPage ? "../" : "./", window.location.href);
}

const PUBLIC_APP_BASE_URL = getPublicAppBaseUrl();

window.BASE_PATH = PUBLIC_APP_BASE_URL.protocol === "file:"
  ? ""
  : PUBLIC_APP_BASE_URL.pathname.replace(/\/$/, "");

function resolvePublicUrl(path = "") {
  const normalizedPath = String(path).replace(/^\/+/, "");
  return new URL(normalizedPath, PUBLIC_APP_BASE_URL).href;
}

function fixLinks(scope = document) {
  scope.querySelectorAll("[data-href]").forEach((link) => {
    const path = link.getAttribute("data-href");
    if (!path) return;
    link.setAttribute("href", resolvePublicUrl(path));
  });
}

function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function bindPublicMenu(scope = document) {
  const menu = scope.querySelector("[data-public-menu]");
  const toggle = scope.querySelector("[data-public-menu-toggle]");
  if (!menu || !toggle || toggle.dataset.bound === "1") return;

  const closeMenu = () => {
    menu.classList.add("hidden");
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const syncDesktopState = () => {
    if (window.innerWidth >= 1024) {
      menu.classList.remove("hidden");
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "true");
    } else if (toggle.getAttribute("aria-expanded") === "true") {
      menu.classList.remove("hidden");
      menu.classList.add("is-open");
    } else {
      menu.classList.add("hidden");
      menu.classList.remove("is-open");
    }
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("hidden", isOpen);
    menu.classList.toggle("is-open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", syncDesktopState);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && window.innerWidth < 1024) {
      closeMenu();
    }
  });

  syncDesktopState();
  toggle.dataset.bound = "1";
}

function markActivePublicLinks(scope = document) {
  const currentPage = getCurrentPage();
  scope.querySelectorAll("[data-public-link]").forEach((link) => {
    const target = link.getAttribute("data-public-link");
    const isActive = target === currentPage;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function hydratePublicYear(scope = document) {
  scope.querySelectorAll("[data-public-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function applySelectPlaceholderState(scope = document) {
  scope.querySelectorAll("select.public-select").forEach((select) => {
    const sync = () => {
      select.dataset.placeholder = !select.value ? "true" : "false";
    };

    if (select.dataset.placeholderBound !== "1") {
      select.addEventListener("change", sync);
      select.dataset.placeholderBound = "1";
    }

    sync();
  });
}

async function loadComponent(id, file) {
  const container = document.getElementById(id);
  if (!container) return;

  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`No se pudo cargar componente: ${file}`);
  }

  container.innerHTML = await response.text();
  fixLinks(container);
  markActivePublicLinks(container);
  bindPublicMenu(container);
  hydratePublicYear(container);
}

document.addEventListener("DOMContentLoaded", async () => {
  const tasks = [];

  if (document.getElementById("navbar")) {
    tasks.push(loadComponent("navbar", resolvePublicUrl("components/navbar_public.html")));
  }

  if (document.getElementById("footer")) {
    tasks.push(loadComponent("footer", resolvePublicUrl("components/footer_public.html")));
  }

  try {
    await Promise.all(tasks);
  } catch (error) {
    console.error("Error cargando componentes públicos:", error);
  }

  applySelectPlaceholderState();
});

window.applySelectPlaceholderState = applySelectPlaceholderState;
