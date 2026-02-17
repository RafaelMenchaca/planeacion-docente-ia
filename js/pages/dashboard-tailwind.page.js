const state = {
  planeaciones: [],
  batches: [],
  filteredBatches: [],
  selectedBatchId: null
};

function normalizeBatchId(p) {
  const rawBatchId = p.batch_id ?? p.batchId ?? p.batch;
  if (rawBatchId === undefined || rawBatchId === null || rawBatchId === '') {
    return `single-${p.id}`;
  }
  return String(rawBatchId);
}

function buildBatches(planeaciones) {
  const map = new Map();

  planeaciones.forEach((p) => {
    const batchId = normalizeBatchId(p);
    if (!map.has(batchId)) {
      map.set(batchId, {
        batch_id: batchId,
        materia: p.materia || 'Sin materia',
        nivel: p.nivel || '-',
        unidad: p.unidad || '-',
        fecha: p.created_at || p.fecha_creacion || null,
        total: 0
      });
    }

    const current = map.get(batchId);
    current.total += 1;

    const nextDate = p.created_at || p.fecha_creacion || null;
    if (nextDate && (!current.fecha || new Date(nextDate) > new Date(current.fecha))) {
      current.fecha = nextDate;
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
    const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
    return fb - fa;
  });
}

function getBatchPlaneaciones(batchId) {
  return state.planeaciones.filter((p) => normalizeBatchId(p) === batchId);
}

function renderBatches() {
  const container = document.getElementById('batch-list');
  const count = document.getElementById('batch-count');
  const list = state.filteredBatches;

  count.textContent = String(list.length);

  if (list.length === 0) {
    container.innerHTML = '<p class="px-3 py-4 text-sm text-slate-500">No hay batches para mostrar.</p>';
    return;
  }

  container.innerHTML = list.map((b) => {
    const active = state.selectedBatchId === b.batch_id;
    const date = b.fecha ? new Date(b.fecha).toLocaleDateString('es-MX') : '-';

    return `
      <button
        data-batch-id="${b.batch_id}"
        class="w-full text-left rounded-xl border px-3 py-3 mb-2 transition ${active ? 'batch-active' : 'batch-inactive hover:bg-slate-50'}"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-slate-900">${escapeHtml(b.materia)}</p>
            <p class="text-xs text-slate-600">${escapeHtml(b.nivel)} | Unidad ${escapeHtml(String(b.unidad))}</p>
          </div>
          <span class="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">${b.total}</span>
        </div>
        <p class="mt-2 text-xs text-slate-500">${date}</p>
      </button>
    `;
  }).join('');

  container.querySelectorAll('button[data-batch-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedBatchId = btn.getAttribute('data-batch-id');
      renderBatches();
      renderPlaneaciones();
    });
  });
}

function renderPlaneaciones() {
  const panel = document.getElementById('planeaciones-panel');
  const title = document.getElementById('selected-title');
  const meta = document.getElementById('selected-meta');

  if (!state.selectedBatchId) {
    title.textContent = 'Selecciona un batch';
    meta.textContent = '';
    panel.innerHTML = '<p class="text-sm text-slate-500">Selecciona un batch de la barra lateral para ver sus planeaciones.</p>';
    return;
  }

  const batch = state.batches.find((b) => b.batch_id === state.selectedBatchId);
  const planeaciones = getBatchPlaneaciones(state.selectedBatchId);

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
          ${planeaciones.map((p) => {
            const fecha = p.created_at || p.fecha_creacion;
            return `
              <tr>
                <td class="px-3 py-3 text-slate-800">${escapeHtml(p.tema || 'Sin tema')}</td>
                <td class="px-3 py-3 text-slate-600">${fecha ? new Date(fecha).toLocaleDateString('es-MX') : '-'}</td>
                <td class="px-3 py-3 text-right">
                  <a href="detalle.html?id=${p.id}" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">Ver planeacion</a>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function applySearch() {
  const q = document.getElementById('batch-search').value.trim().toLowerCase();
  state.filteredBatches = state.batches.filter((b) => {
    if (!q) return true;
    return (b.materia || '').toLowerCase().includes(q);
  });

  if (state.selectedBatchId && !state.filteredBatches.some((b) => b.batch_id === state.selectedBatchId)) {
    state.selectedBatchId = state.filteredBatches[0] ? state.filteredBatches[0].batch_id : null;
  }

  renderBatches();
  renderPlaneaciones();
}

async function initDashboardTailwindPage() {
  await protegerRuta();

  const { data } = await supabase.auth.getUser();
  const emailEl = document.getElementById('usuario-email');
  if (emailEl && data.user && data.user.email) {
    emailEl.textContent = data.user.email;
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'login.html';
    });
  }

  const payload = await obtenerPlaneaciones();
  const planeaciones = Array.isArray(payload) ? payload : (payload && payload.items ? payload.items : []);

  state.planeaciones = planeaciones;
  state.batches = buildBatches(planeaciones);
  state.filteredBatches = state.batches;
  state.selectedBatchId = state.filteredBatches[0] ? state.filteredBatches[0].batch_id : null;

  document.getElementById('batch-search').addEventListener('input', applySearch);

  renderBatches();
  renderPlaneaciones();
}

document.addEventListener('DOMContentLoaded', initDashboardTailwindPage);

