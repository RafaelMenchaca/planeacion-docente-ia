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
      window.QuickCreate?.open().catch(console.error);
      break;
    }

    case "retry": {
      loadAndRenderBiblioteca();
      break;
    }

    case "ver-examen": {
      if (examenId) window.ExamPreview.openBiblioteca(examenId);
      break;
    }

    case "ver-lista": {
      if (listaId) window.ListaCotejoPreview.openBiblioteca(listaId);
      break;
    }

    case "descargar-planeacion": {
      if (planeacionId) window.PlaneacionDownload.downloadFromBiblioteca(planeacionId);
      break;
    }

    case "descargar-examen": {
      if (examenId) window.ExamDownload.downloadFromBiblioteca(examenId);
      break;
    }

    case "descargar-lista": {
      if (listaId) window.ListaCotejoDownload.downloadBiblioteca(listaId);
      break;
    }

    case "abrir-modal-anexos": {
      const cj = findConjuntoById(conjuntoId);
      if (cj) openBibliotecaAnexoCreateModal(cj);
      break;
    }

    case "ver-anexo": {
      if (anexoId) window.AnexoPreview.open(anexoId);
      break;
    }

    case "descargar-anexo": {
      if (anexoId) window.AnexoDownload.downloadBiblioteca(anexoId);
      break;
    }

    case "eliminar-bloque": {
      if (conjuntoId) window.BibliotecaBlockDelete.deleteFromBiblioteca(conjuntoId);
      break;
    }

    case "eliminar-planeacion": {
      if (planeacionId && conjuntoId) window.PlaneacionDelete.deleteFromBiblioteca(planeacionId, conjuntoId);
      break;
    }

    case "eliminar-examen": {
      if (examenId && conjuntoId) window.ExamDelete.deleteFromBiblioteca(examenId, conjuntoId);
      break;
    }

    case "eliminar-lista": {
      if (listaId && conjuntoId) window.ListaCotejoDelete.deleteFromBiblioteca(listaId, conjuntoId);
      break;
    }

    case "eliminar-anexo": {
      if (anexoId && conjuntoId) window.AnexoDelete.deleteFromBiblioteca(anexoId, conjuntoId);
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
