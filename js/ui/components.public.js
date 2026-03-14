function getBasePath() {
  const { pathname, protocol } = window.location;

  if (protocol === "file:") {
    return "";
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] || "";
  const localFolders = new Set(["pages", "components", "css", "js", "assets"]);

  if (!first || localFolders.has(first) || first.includes(".")) {
    return "";
  }

  return `/${first}`;
}

window.BASE_PATH = getBasePath();

function fixLinks(scope = document) {
  scope.querySelectorAll("[data-href]").forEach((link) => {
    const path = link.getAttribute("data-href");
    if (!path) return;
    link.setAttribute("href", `${window.BASE_PATH}${path}`);
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
    toggle.setAttribute("aria-expanded", "false");
  };

  const syncDesktopState = () => {
    if (window.innerWidth >= 1024) {
      menu.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
    } else if (toggle.getAttribute("aria-expanded") !== "true") {
      menu.classList.add("hidden");
    }
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("hidden", isOpen);
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
    tasks.push(loadComponent("navbar", `${window.BASE_PATH}/components/navbar_public.html`));
  }

  if (document.getElementById("footer")) {
    tasks.push(loadComponent("footer", `${window.BASE_PATH}/components/footer_public.html`));
  }

  try {
    await Promise.all(tasks);
  } catch (error) {
    console.error("Error cargando componentes públicos:", error);
  }

  applySelectPlaceholderState();
});

window.applySelectPlaceholderState = applySelectPlaceholderState;
