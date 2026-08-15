// Owner del wiring estructural vigente de Biblioteca.
// Script clásico: consume coordinación, state surfaces y features definidos antes.

// ---- EVENT HANDLERS ----

function onBibliotecaSearch(event) {
  bibliotecaState.searchQuery = event.target.value;
  renderBibliotecaSidebarListInPlace();
}

function onBibliotecaClick(event) {
  const btn = event.target.closest("[data-bib-action]");
  if (!btn) return;

  const action       = btn.dataset.bibAction;
  const conjuntoId   = btn.dataset.conjuntoId;
  const tab          = btn.dataset.tab;
  const examenId     = btn.dataset.examenId;
  const listaId      = btn.dataset.listaId;
  const anexoId      = btn.dataset.anexoId;
  const planeacionId = btn.dataset.planeacionId;

  switch (action) {
    case "select-conjunto": {
      setSelectedConjunto(conjuntoId);
      updateBibliotecaSidebarActive();
      renderBibliotecaDetailInPlace();
      break;
    }

    case "toggle-expand": {
      setSelectedConjunto(conjuntoId);
      updateBibliotecaSidebarActive();
      renderBibliotecaDetailInPlace();
      break;
    }

    case "switch-tab": {
      setSelectedConjunto(conjuntoId, { tab });
      renderBibliotecaDetailInPlace();
      break;
    }

    case "agregar-planeacion": {
      const cj = findConjuntoById(conjuntoId);
      if (cj) openBibliotecaAgregarModal(cj);
      break;
    }

    case "generar-examen": {
      const conjunto = findConjuntoById(conjuntoId);
      if (conjunto) openBibliotecaExamModal(conjunto);
      break;
    }

    case "generar-lista": {
      const conjunto = findConjuntoById(conjuntoId);
      if (conjunto) openBibliotecaListaModal(conjunto);
      break;
    }

    case "crear-planeaciones": {
      if (typeof openQuickCreatePanel === "function") {
        openQuickCreatePanel().catch(console.error);
      }
      break;
    }

    case "retry": {
      loadAndRenderBiblioteca();
      break;
    }

    case "ver-examen": {
      if (examenId) openBibliotecaExamenPreview(examenId);
      break;
    }

    case "ver-lista": {
      if (listaId) openBibliotecaListaPreview(listaId);
      break;
    }

    case "descargar-planeacion": {
      if (planeacionId) bibDescargarPlaneacion(planeacionId);
      break;
    }

    case "descargar-examen": {
      if (examenId) bibDescargarExamen(examenId);
      break;
    }

    case "descargar-lista": {
      if (listaId) bibDescargarLista(listaId);
      break;
    }

    case "abrir-modal-anexos": {
      const cj = findConjuntoById(conjuntoId);
      if (cj) openBibliotecaAnexoCreateModal(cj);
      break;
    }

    case "generar-anexo": {
      if (planeacionId && conjuntoId) bibGenerarAnexo(planeacionId, conjuntoId);
      break;
    }

    case "ver-anexo": {
      if (anexoId) openBibliotecaAnexoPreview(anexoId);
      break;
    }

    case "descargar-anexo": {
      if (anexoId) bibDescargarAnexo(anexoId);
      break;
    }

    case "regenerar-anexo": {
      if (anexoId && conjuntoId && planeacionId) bibRegenerarAnexo(anexoId, conjuntoId, planeacionId);
      break;
    }

    case "eliminar-bloque": {
      if (conjuntoId) bibEliminarBloque(conjuntoId);
      break;
    }

    case "eliminar-planeacion": {
      if (planeacionId && conjuntoId) bibEliminarPlaneacion(planeacionId, conjuntoId);
      break;
    }

    case "eliminar-examen": {
      if (examenId && conjuntoId) bibEliminarExamen(examenId, conjuntoId);
      break;
    }

    case "eliminar-lista": {
      if (listaId && conjuntoId) bibEliminarLista(listaId, conjuntoId);
      break;
    }

    case "eliminar-anexo": {
      if (anexoId && conjuntoId) bibEliminarAnexo(anexoId, conjuntoId);
      break;
    }
  }
}

// Superficie léxica pequeña; preserva timing y duplicabilidad histórica.
const BibliotecaEvents = Object.freeze({
  bind() {
    document.addEventListener("click", onBibliotecaClick);
  },
  bindSearch(searchInput) {
    searchInput.oninput = onBibliotecaSearch;
  },
  handleClick: onBibliotecaClick,
  handleSearch: onBibliotecaSearch
});

