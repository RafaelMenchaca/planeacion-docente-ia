const browserSessionResetters = new Set();
let browserSessionSubjectId = null;
let browserSessionRevision = 0;

function normalizeSessionSubjectId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function resetBrowserSessionState(reason) {
  browserSessionRevision += 1;
  browserSessionResetters.forEach((reset) => {
    try {
      reset(reason);
    } catch (error) {
      console.error("No se pudo limpiar un owner de estado de sesion.", error);
    }
  });
  window.currentUser = null;
}

function synchronizeBrowserSession(session, event = "SESSION_SYNC") {
  const nextSubjectId = normalizeSessionSubjectId(session?.user?.id);
  const subjectChanged =
    browserSessionSubjectId !== null &&
    nextSubjectId !== null &&
    browserSessionSubjectId !== nextSubjectId;
  const signedOut = event === "SIGNED_OUT" || nextSubjectId === null;

  if (subjectChanged || (signedOut && browserSessionSubjectId !== null)) {
    resetBrowserSessionState(subjectChanged ? "SUBJECT_CHANGED" : "SIGNED_OUT");
  }

  browserSessionSubjectId = nextSubjectId;
  window.currentUser = session?.user || null;
  return nextSubjectId;
}

const BrowserSessionState = Object.freeze({
  registerReset(reset) {
    if (typeof reset !== "function") return () => {};
    browserSessionResetters.add(reset);
    return () => browserSessionResetters.delete(reset);
  },
  getSubjectId() {
    return browserSessionSubjectId;
  },
  captureContext() {
    return `${browserSessionRevision}:${browserSessionSubjectId || "anonymous"}`;
  },
  isCurrentContext(context) {
    return context === this.captureContext() && browserSessionSubjectId !== null;
  },
  clear(reason = "MANUAL_CLEAR") {
    resetBrowserSessionState(reason);
    browserSessionSubjectId = null;
  }
});

// Verifica si hay sesion activa
async function protegerRuta() {
  const { data } = await supabase.auth.getSession();

  if (!data.session || !data.session.user) {
    synchronizeBrowserSession(null);
    window.location.href = "login.html";
    return;
  }

  synchronizeBrowserSession(data.session);
}

async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    synchronizeBrowserSession(null);
    window.location.href = "login.html";
    return null;
  }
  synchronizeBrowserSession(session);
  return session;
}

// Escuchar cambios de sesion
supabase.auth.onAuthStateChange((event, session) => {
  synchronizeBrowserSession(session, event);

  // Solo redirigir si el evento es SIGNED_OUT
  if (event === "SIGNED_OUT") {
    if (window.AppUI && window.AppUI.showToast) {
      window.AppUI.showToast("Sesión cerrada correctamente. Redirigiendo al login...", "info");
      setTimeout(function () { window.location.href = "login.html"; }, 1500);
    } else {
      window.location.href = "login.html";
    }
  }
});

// Exportar funciones globalmente
window.protegerRuta = protegerRuta;
window.requireSession = requireSession;
window.BrowserSessionState = BrowserSessionState;
