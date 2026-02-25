let isProfileMenuBound = false;

async function loadPrivateComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const hasContent = target.children.length > 0 || target.textContent.trim().length > 0;
  if (hasContent) return;

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`No se pudo cargar componente: ${path}`);
  }

  target.innerHTML = await res.text();
}

function closeProfileMenu() {
  const menu = document.getElementById("profile-menu");
  const toggle = document.getElementById("profile-menu-toggle");
  if (!menu || !toggle) return;

  menu.classList.add("hidden");
  toggle.setAttribute("aria-expanded", "false");
}

function showProfileNotice(message, tone = "info") {
  const toneMap = {
    info: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  };

  const toast = document.createElement("div");
  toast.className = `fixed right-4 top-4 z-[80] rounded-lg border px-3 py-2 text-sm shadow-lg ${toneMap[tone] || toneMap.info}`;
  toast.textContent = message;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

async function hydrateNavbarUser() {
  const menuEmailEl = document.getElementById("profile-menu-email");
  if (!menuEmailEl || !window.supabase?.auth) return;

  try {
    const { data } = await window.supabase.auth.getUser();
    if (data?.user?.email) {
      menuEmailEl.textContent = data.user.email;
    }
  } catch {
    menuEmailEl.textContent = "Mi cuenta";
  }
}

async function handleProfileAction(action) {
  if (action === "logout") {
    try {
      await window.supabase?.auth?.signOut();
      window.location.href = "login.html";
      return;
    } catch {
      showProfileNotice("No se pudo cerrar sesion.", "danger");
      return;
    }
  }

  const labels = {
    perfil: "Ver perfil",
    configuracion: "Configuracion",
    suscripcion: "Suscripcion",
    facturacion: "Facturacion",
    notificaciones: "Notificaciones"
  };

  showProfileNotice(`${labels[action] || "Esta opcion"} estara disponible pronto.`, "info");
}

function bindProfileMenu() {
  const toggle = document.getElementById("profile-menu-toggle");
  const menu = document.getElementById("profile-menu");
  if (!toggle || !menu) return;

  if (!toggle.dataset.bound) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
    toggle.dataset.bound = "1";
  }

  if (!menu.dataset.bound) {
    menu.querySelectorAll("button[data-profile-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        closeProfileMenu();
        await handleProfileAction(button.getAttribute("data-profile-action"));
      });
    });
    menu.dataset.bound = "1";
  }

  if (!isProfileMenuBound) {
    document.addEventListener("click", (event) => {
      if (menu.classList.contains("hidden")) return;

      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        closeProfileMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    });

    isProfileMenuBound = true;
  }
}

async function initPrivateChrome() {
  try {
    await Promise.all([
      loadPrivateComponent("navbar-placeholder", "../components/navbar.html"),
      loadPrivateComponent("footer-placeholder", "../components/footer.html")
    ]);
  } catch (error) {
    console.error("Error cargando navbar/footer:", error);
  }

  await hydrateNavbarUser();
  bindProfileMenu();
}

document.addEventListener("DOMContentLoaded", () => {
  initPrivateChrome();
});

window.initPrivateChrome = initPrivateChrome;
window.closeProfileMenu = closeProfileMenu;
