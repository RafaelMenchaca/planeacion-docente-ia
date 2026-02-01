function getCurrentPage() {
  const path = window.location.pathname;
  return path.split("/").pop() || "index.html";
}

function isPrivatePage(page) {
  return ["dashboard.html", "planeacion.html", "detalle.html", "batch.html"].includes(page);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = getCurrentPage();

  if (isPrivatePage(page) && typeof window.protegerRuta === "function") {
    window.protegerRuta();
  }

  const initMap = {
    "dashboard.html": window.initDashboardPage,
    "planeacion.html": window.planeacionPage?.init,
    "detalle.html": window.initDetallePage,
    "batch.html": window.initBatchPage,
    "login.html": window.initLoginPage,
  };

  const init = initMap[page];
  if (typeof init === "function") {
    init();
  }
});
