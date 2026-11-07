const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const testApi = global.describe ? global : require("node:test");
const { describe, test } = testApi;
const ROOT = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function createStorage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); }
  };
}

function createHarness() {
  const callbacks = [];
  const sessions = { current: null };
  const visible = { textContent: "" };
  const window = {
    localStorage: createStorage(),
    location: { href: "dashboard.html" },
    document: { getElementById: (id) => id === "visible" ? visible : null },
    console,
    setTimeout: () => 0
  };
  window.window = window;
  window.supabase = {
    auth: {
      getSession: async () => ({ data: { session: sessions.current } }),
      onAuthStateChange: (callback) => callbacks.push(callback)
    }
  };
  const context = vm.createContext(window);
  vm.runInContext(read("js/services/auth.service.js"), context, { filename: "js/services/auth.service.js" });
  vm.runInContext(read("js/services/planeaciones.service.js"), context, { filename: "js/services/planeaciones.service.js" });

  return {
    window,
    visible,
    auth(event, id) {
      sessions.current = id ? { user: { id } } : null;
      callbacks[0](event, sessions.current);
    }
  };
}

describe("03E2 browser session isolation", () => {
  test("Archivados is namespaced by the canonical authenticated UUID", () => {
    const harness = createHarness();
    const { window } = harness;
    window.localStorage.setItem("educativo.archivedHierarchy.registry", JSON.stringify({ hidden: { planteles: ["legacy"] } }));
    window.localStorage.setItem("educativo.global.theme", "light");

    harness.auth("SIGNED_IN", "user-a");
    window.registerArchivedHierarchyScope({ type: "plantel", id: "plantel-a" });
    assert.equal(window.isArchivedHierarchyScopeHidden("plantel", "plantel-a"), true);

    harness.auth("SIGNED_IN", "user-b");
    assert.equal(window.isArchivedHierarchyScopeHidden("plantel", "plantel-a"), false);
    assert.equal(window.isArchivedHierarchyScopeHidden("plantel", "legacy"), false);
    window.registerArchivedHierarchyScope({ type: "plantel", id: "plantel-b" });

    harness.auth("SIGNED_IN", "user-a");
    assert.equal(window.isArchivedHierarchyScopeHidden("plantel", "plantel-a"), true);
    assert.equal(window.isArchivedHierarchyScopeHidden("plantel", "plantel-b"), false);
    assert.equal(window.localStorage.getItem("educativo.global.theme"), "light");
  });

  test("no session fails closed and never attributes the legacy global key", () => {
    const { window } = createHarness();
    window.localStorage.setItem("educativo.archivedHierarchy.registry", JSON.stringify({ hidden: { planteles: ["legacy"] } }));

    assert.deepEqual(Array.from(window.getArchivedHierarchyRegistrySnapshot().hidden.planteles), []);
    window.registerArchivedHierarchyScope({ type: "plantel", id: "anonymous-write" });
    assert.deepEqual([...Array(window.localStorage.length)].map((_, index) => window.localStorage.key(index)), ["educativo.archivedHierarchy.registry"]);
  });

  test("logout and direct subject change invalidate memory and visible UI", () => {
    const harness = createHarness();
    const { window, visible } = harness;
    const memory = { rows: ["A"], pending: true };
    const reasons = [];
    visible.textContent = "Datos de A";
    window.BrowserSessionState.registerReset((reason) => {
      reasons.push(reason);
      memory.rows = [];
      memory.pending = false;
      visible.textContent = "";
    });

    harness.auth("SIGNED_IN", "user-a");
    const contextA = window.BrowserSessionState.captureContext();
    harness.auth("SIGNED_IN", "user-b");
    assert.deepEqual(reasons, ["SUBJECT_CHANGED"]);
    assert.deepEqual(memory, { rows: [], pending: false });
    assert.equal(visible.textContent, "");
    assert.equal(window.BrowserSessionState.isCurrentContext(contextA), false);

    assert.doesNotThrow(() => {
      harness.auth("SIGNED_OUT", null);
      harness.auth("SIGNED_OUT", null);
    });
    assert.equal(window.BrowserSessionState.getSubjectId(), null);
    assert.deepEqual(reasons, ["SUBJECT_CHANGED", "SIGNED_OUT"]);
  });

  test("the three UI owners register resets without changing script order", () => {
    const dashboard = read("pages/dashboard.html");
    const authIndex = dashboard.indexOf("auth.service.js");
    const dashboardIndex = dashboard.indexOf("dashboard.page.js");
    const bibliotecaIndex = dashboard.indexOf("biblioteca.page.js");

    assert.ok(authIndex > -1);
    assert.ok(authIndex < dashboardIndex);
    assert.ok(dashboardIndex < bibliotecaIndex);
    assert.match(read("js/pages/dashboard.page.js"), /registerReset\(resetExplorerSessionState\)/);
    assert.match(read("js/pages/biblioteca.page.js"), /registerReset\(resetBibliotecaSessionState\)/);
    assert.match(read("js/pages/archivados.page.js"), /registerReset\(resetArchivedSessionState\)/);
    assert.match(read("js/features/biblioteca/biblioteca-loader.js"), /isCurrentContext\(context\)/);
    assert.match(read("js/pages/archivados.page.js"), /isCurrentContext\(context\)/);
    assert.match(read("js/pages/dashboard.page.js"), /explorerSessionContextIsCurrent\(context\)/);
  });
});
