// =========================================================
// Biblioteca loader/reconcile owner
// Fase 7 — Sesión 7.2
// =========================================================

(function initBibliotecaLoader(global) {
function normalizeGeneratedPlaneaciones(result) {
  if (Array.isArray(result?.planeaciones)) return result.planeaciones;

  const records = [];
  if (Array.isArray(result?.resultados)) records.push(...result.resultados);
  if (Array.isArray(result?.results)) records.push(...result.results);

  return records
    .filter(item => item?.planeacion_id)
    .map(item => ({
      id: item.planeacion_id,
      tema_id: item.tema_id || null,
      tema: item.titulo || item.tema || "Planeacion",
      duracion: item.duracion || null,
      status: item.status || "ready",
      batch_id: result?.batch_id || null
    }));
}

function mergePlaneaciones(existing, incoming) {
  const byId = new Map();
  (Array.isArray(existing) ? existing : []).forEach(item => {
    const id = normalizeBibliotecaId(item?.id);
    if (id) byId.set(id, item);
  });
  (Array.isArray(incoming) ? incoming : []).forEach(item => {
    const id = normalizeBibliotecaId(item?.id || item?.planeacion_id);
    if (!id) return;
    byId.set(id, {
      ...item,
      id,
      batch_id: item.batch_id || item.batchId || null
    });
  });
  return [...byId.values()];
}

function applyOptimisticPlaneacionesToConjunto(batchId, planeaciones) {
  const safeBatchId = normalizeBibliotecaId(batchId);
  if (!safeBatchId) return;

  const pending = bibliotecaState.pendingConjunto;
  let conjunto = findConjuntoById(safeBatchId);

  if (!conjunto && pending) {
    conjunto = {
      ...pending,
      id: safeBatchId,
      tempId: undefined,
      isPending: false,
      status_ui: "ready",
      batch_id: safeBatchId
    };
    bibliotecaState.conjuntos = [conjunto, ...bibliotecaState.conjuntos];
    bibliotecaState.expandedIds.delete(pending.tempId);
    BibliotecaTabs.clearActiveTab(pending.tempId);
    if (normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(pending.tempId)) {
      BibliotecaSelection.setSelectedConjuntoId(safeBatchId);
    }
    bibliotecaState.pendingConjunto = null;
  }

  if (!conjunto) return;

  conjunto.isPending = false;
  conjunto.status_ui = "ready";
  conjunto.planeaciones = mergePlaneaciones(conjunto.planeaciones, planeaciones || []);
  conjunto.total_planeaciones = conjunto.planeaciones.length;
  BibliotecaSelection.setSelectedConjuntoId(safeBatchId);
  BibliotecaTabs.setActiveTab(safeBatchId, "planeaciones");
}

function applyGenerationResultToPendingItems(batchId, result) {
  const safeBatchId = normalizeBibliotecaId(batchId);
  if (!safeBatchId) return;

  const pending = BibliotecaPlaneacionesPending.get(safeBatchId);
  if (!pending) return;

  const records = [
    ...(Array.isArray(result?.resultados) ? result.resultados : []),
    ...(Array.isArray(result?.results) ? result.results : [])
  ];

  records.forEach((record, index) => {
    const itemIndex = Number.isFinite(Number(record?.index)) ? Number(record.index) - 1 : index;
    const target = pending.items[itemIndex];
    if (!target) return;
    target.status = record.status || "ready";
    target.statusLabel = typeof statusLabelFromTone === "function"
      ? statusLabelFromTone(target.status)
      : target.status;
    target.message = record.message || "";
  });

  if (Number(result?.success_count || 0) > 0) {
    pending.items.forEach(item => {
      if (item.status === "pending" || item.status === "generating") {
        item.status = "ready";
        item.statusLabel = typeof statusLabelFromTone === "function" ? statusLabelFromTone("ready") : "Listo";
      }
    });
  }

  if (Number(result?.error_count || 0) > 0) {
    pending.error = `${result.error_count} planeacion(es) no se pudieron generar.`;
  }
}

async function finishBibliotecaPlaneacionesGeneration(result) {
  const batchId = getGenerationBatchId(result);
  const planeaciones = normalizeGeneratedPlaneaciones(result);

  if (batchId) {
    if (!BibliotecaPlaneacionesPending.get(batchId) && Number(result?.error_count || 0) > 0) {
      const progressItems = Array.isArray(window.explorerState?.progress?.items)
        ? window.explorerState.progress.items
        : [];
      BibliotecaPlaneacionesPending.set(batchId, {
        items: progressItems.map(item => ({
          titulo: item.titulo || "",
          status: item.status || "pending",
          statusLabel: item.statusLabel || "",
          message: item.message || ""
        })),
        error: `${result.error_count} planeacion(es) no se pudieron generar.`
      });
    }
    applyGenerationResultToPendingItems(batchId, result || {});
    applyOptimisticPlaneacionesToConjunto(batchId, planeaciones);
    if (Number(result?.error_count || 0) === 0) {
      BibliotecaPlaneacionesPending.delete(batchId);
    }
    BibliotecaSelection.setSelectedConjuntoId(batchId);
    BibliotecaTabs.setActiveTab(batchId, "planeaciones");
  }

  renderBibliotecaContent();

  await loadAndRenderBiblioteca({
    silent: true,
    targetBatchId: batchId,
    activeTab: "planeaciones"
  });
}

async function loadAndRenderBiblioteca(options = {}) {
  const silent = options.silent === true;
  const targetBatchId = normalizeBibliotecaId(options.targetBatchId);
  const targetActiveTab = options.activeTab || "planeaciones";

  // Capture pending info before clearing (for reconciliation after quick-create)
  const prevTempId    = bibliotecaState.pendingConjunto?.tempId || null;
  const wasSelected   = prevTempId ? normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(prevTempId) : false;
  const prevActiveTab = prevTempId ? (BibliotecaTabs.getActiveTab(prevTempId) || "planeaciones") : null;
  const prevSelectedId = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId());
  const prevConjuntos = getAllConjuntosForSidebar();

  if (!silent) {
    bibliotecaState.pendingConjunto = null;
    bibliotecaState.loading = true;
  }
  bibliotecaState.error   = "";
  if (!silent) renderBibliotecaContent();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const data    = await apiBibliotecaConjuntos(session.access_token);
    const newList = Array.isArray(data) ? data : [];

    // Reconciliation: map tempId expanded state to the newly created real conjunto
    if (prevTempId) {
      BibliotecaTabs.clearActiveTab(prevTempId);
      if (wasSelected) {
        const prevIds     = new Set(prevConjuntos.map(c => normalizeBibliotecaId(c.id)));
        const newConjunto = targetBatchId
          ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
          : newList.find(c => !prevIds.has(normalizeBibliotecaId(c.id)));
        if (newConjunto) {
          BibliotecaSelection.setSelectedConjuntoId(normalizeBibliotecaId(newConjunto.id));
          BibliotecaTabs.setActiveTab(newConjunto.id, prevActiveTab);
        }
      }
    }

    if (targetBatchId) {
      const target = newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId);
      if (target) {
        BibliotecaSelection.setSelectedConjuntoId(normalizeBibliotecaId(target.id));
        BibliotecaTabs.setActiveTab(target.id, targetActiveTab);
      }
    }

    bibliotecaState.conjuntos = newList;
    bibliotecaState.loading   = false;
    bibliotecaState.pendingConjunto = null;

    const selectedStillExists = findConjuntoById(BibliotecaSelection.getSelectedConjuntoId());
    if (!selectedStillExists) {
      const fallback = targetBatchId
        ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
        : newList.find(c => normalizeBibliotecaId(c.id) === prevSelectedId) || newList[0] || null;
      BibliotecaSelection.setSelectedConjuntoId(fallback ? normalizeBibliotecaId(fallback.id) : null);
      if (fallback && !BibliotecaTabs.getActiveTab(fallback.id)) {
        BibliotecaTabs.setActiveTab(fallback.id, "planeaciones");
      }
    }

    renderBibliotecaContent();
  } catch (error) {
    console.error("[biblioteca] Error al cargar conjuntos:", error);
    bibliotecaState.loading = false;
    bibliotecaState.error   = error.message || "Error al cargar la biblioteca.";
    renderBibliotecaContent();
  }
}

  global.BibliotecaLoader = Object.freeze({
    load: loadAndRenderBiblioteca,
    finishPlaneacionesGeneration: finishBibliotecaPlaneacionesGeneration,
    normalizeGeneratedPlaneaciones,
    applyOptimisticPlaneacionesToConjunto,
    applyGenerationResultToPendingItems
  });
})(window);
