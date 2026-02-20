const dashboardState = {
  planeaciones: [],
  batches: [],
  filteredBatches: [],
  selectedBatchId: null
};

async function injectComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error(`No se encontro el contenedor ${targetId}`);
  }

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`No se pudo cargar componente: ${path}`);
  }

  target.innerHTML = await res.text();
}

function normalizeBatchId(planeacion) {
  const rawBatchId = planeacion.batch_id ?? planeacion.batchId ?? planeacion.batch;
  if (rawBatchId === undefined || rawBatchId === null || rawBatchId === '') {
    return `single-${planeacion.id}`;
  }
  return String(rawBatchId);
}

function buildBatches(planeaciones) {
  const map = new Map();

  planeaciones.forEach((planeacion) => {
    const batchId = normalizeBatchId(planeacion);

    if (!map.has(batchId)) {
      map.set(batchId, {
        batch_id: batchId,
        materia: planeacion.materia || 'Sin materia',
        nivel: planeacion.nivel || '-',
        unidad: planeacion.unidad || '-',
        fecha: planeacion.created_at || planeacion.fecha_creacion || null,
        total: 0
      });
    }

    const batch = map.get(batchId);
    batch.total += 1;

    const candidateDate = planeacion.created_at || planeacion.fecha_creacion || null;
    if (candidateDate && (!batch.fecha || new Date(candidateDate) > new Date(batch.fecha))) {
      batch.fecha = candidateDate;
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a.fecha ? new Date(a.fecha).getTime() : 0;
    const bDate = b.fecha ? new Date(b.fecha).getTime() : 0;
    return bDate - aDate;
  });
}

function getPlaneacionesByBatch(batchId) {
  return dashboardState.planeaciones.filter((planeacion) => normalizeBatchId(planeacion) === batchId);
}

function renderBatchList() {
  const container = document.getElementById('batch-list');
  const count = document.getElementById('batch-count');

  if (!container || !count) return;

  const list = dashboardState.filteredBatches;
  count.textContent = String(list.length);

  if (list.length === 0) {
    container.innerHTML = '<p class="px-3 py-4 text-sm text-slate-500">No hay batches para mostrar.</p>';
    return;
  }

  container.innerHTML = list.map((batch) => {
    const isActive = dashboardState.selectedBatchId === batch.batch_id;
    const date = batch.fecha ? new Date(batch.fecha).toLocaleDateString('es-MX') : '-';

    return `
      <button
        data-batch-id="${batch.batch_id}"
        class="w-full text-left rounded-xl border px-3 py-3 mb-2 transition ${isActive ? 'batch-active' : 'batch-inactive hover:bg-slate-50'}"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-slate-900">${escapeHtml(batch.materia)}</p>
            <p class="text-xs text-slate-600">${escapeHtml(batch.nivel)} | Unidad ${escapeHtml(String(batch.unidad))}</p>
          </div>
          <span class="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">${batch.total}</span>
        </div>
        <p class="mt-2 text-xs text-slate-500">${date}</p>
      </button>
    `;
  }).join('');

  container.querySelectorAll('button[data-batch-id]').forEach((button) => {
    button.addEventListener('click', () => {
      dashboardState.selectedBatchId = button.getAttribute('data-batch-id');
      renderBatchList();
      renderPlaneacionesPanel();
    });
  });
}

function renderPlaneacionesPanel() {
  const panel = document.getElementById('planeaciones-panel');
  const title = document.getElementById('selected-title');
  const meta = document.getElementById('selected-meta');

  if (!panel || !title || !meta) return;

  if (!dashboardState.selectedBatchId) {
    title.textContent = 'Selecciona un batch';
    meta.textContent = '';
    panel.innerHTML = '<p class="text-sm text-slate-500">Selecciona un batch de la barra lateral para ver sus planeaciones.</p>';
    return;
  }

  const batch = dashboardState.batches.find((item) => item.batch_id === dashboardState.selectedBatchId);
  const planeaciones = getPlaneacionesByBatch(dashboardState.selectedBatchId);

  if (!batch || planeaciones.length === 0) {
    title.textContent = 'Batch sin datos';
    meta.textContent = '';
    panel.innerHTML = '<p class="text-sm text-slate-500">No se encontraron planeaciones para este batch.</p>';
    return;
  }

  title.textContent = `${batch.materia} | ${batch.nivel} | Unidad ${batch.unidad}`;
  meta.textContent = `${planeaciones.length} planeacion(es)`;

  panel.innerHTML = `
    <div class="overflow-hidden rounded-xl border border-slate-200">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-slate-700">
          <tr>
            <th class="px-3 py-2 text-left font-semibold">Tema</th>
            <th class="px-3 py-2 text-left font-semibold">Fecha</th>
            <th class="px-3 py-2 text-right font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          ${planeaciones.map((planeacion) => {
            const fecha = planeacion.created_at || planeacion.fecha_creacion;
            return `
              <tr>
                <td class="px-3 py-3 text-slate-800">${escapeHtml(planeacion.tema || 'Sin tema')}</td>
                <td class="px-3 py-3 text-slate-600">${fecha ? new Date(fecha).toLocaleDateString('es-MX') : '-'}</td>
                <td class="px-3 py-3 text-right">
                  <a href="detalle.html?id=${planeacion.id}" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">Ver planeacion</a>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function applyBatchSearch() {
  const input = document.getElementById('batch-search');
  if (!input) return;

  const query = input.value.trim().toLowerCase();
  dashboardState.filteredBatches = dashboardState.batches.filter((batch) => {
    if (!query) return true;
    return (batch.materia || '').toLowerCase().includes(query);
  });

  if (
    dashboardState.selectedBatchId &&
    !dashboardState.filteredBatches.some((batch) => batch.batch_id === dashboardState.selectedBatchId)
  ) {
    dashboardState.selectedBatchId = dashboardState.filteredBatches[0]
      ? dashboardState.filteredBatches[0].batch_id
      : null;
  }

  renderBatchList();
  renderPlaneacionesPanel();
}

function renderDataLoadError() {
  const count = document.getElementById('batch-count');
  const batchList = document.getElementById('batch-list');
  const selectedTitle = document.getElementById('selected-title');
  const selectedMeta = document.getElementById('selected-meta');
  const panel = document.getElementById('planeaciones-panel');

  if (count) count.textContent = '0';
  if (batchList) {
    batchList.innerHTML = '<p class="px-3 py-4 text-sm text-red-600">Error al cargar batches.</p>';
  }
  if (selectedTitle) selectedTitle.textContent = 'Error al cargar';
  if (selectedMeta) selectedMeta.textContent = '';
  if (panel) {
    panel.innerHTML = '<p class="text-sm text-red-600">Error al cargar planeaciones.</p>';
  }
}

async function hydrateDashboardData() {
  const payload = await obtenerPlaneaciones();
  const planeaciones = Array.isArray(payload) ? payload : (payload && payload.items ? payload.items : []);

  dashboardState.planeaciones = planeaciones;
  dashboardState.batches = buildBatches(planeaciones);
  dashboardState.filteredBatches = dashboardState.batches;
  dashboardState.selectedBatchId = dashboardState.filteredBatches[0]
    ? dashboardState.filteredBatches[0].batch_id
    : null;

  const searchInput = document.getElementById('batch-search');
  if (searchInput) {
    searchInput.addEventListener('input', applyBatchSearch);
  }

  renderBatchList();
  renderPlaneacionesPanel();
}

async function wireDashboardHeader() {
  const { data } = await supabase.auth.getUser();
  const emailEl = document.getElementById('dashboard-user-email');
  if (emailEl && data.user && data.user.email) {
    emailEl.textContent = data.user.email;
  }

  const logoutBtn = document.getElementById('dashboard-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'login.html';
    });
  }
}

async function initDashboardPage() {
  try {
    await injectComponent('dashboard-layout-root', '../components/layout.html');
    await Promise.all([
      injectComponent('dashboard-header-slot', '../components/header.html'),
      injectComponent('dashboard-sidebar-slot', '../components/sidebar.html')
    ]);
  } catch (error) {
    console.error('Error inicializando dashboard:', error);
    const root = document.getElementById('dashboard-layout-root');
    if (root) {
      root.innerHTML = '<div class="p-6 text-sm text-red-600">No se pudo cargar el dashboard.</div>';
    }
    return;
  }

  try {
    await wireDashboardHeader();
  } catch (error) {
    console.error('Error cargando header del dashboard:', error);
  }

  try {
    await hydrateDashboardData();
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error);
    renderDataLoadError();
  }
}

window.initDashboardPage = initDashboardPage;
