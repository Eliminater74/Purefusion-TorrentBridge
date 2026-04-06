/* ================================================================
   Purefusion TorrentBridge — Transfer History Page Logic
   Filterable, sortable table with stats and CSV export
   ================================================================ */

import { loadOptions } from '../util.js';

/* ====== DOM Refs ====== */
const $ = (q) => document.querySelector(q);
const tbody        = $('#history-body');
const emptyState   = $('#empty-state');
const filterStatus = $('#filter-status');
const filterServer = $('#filter-server');

/* ====== State ====== */
let allHistory = [];
let sortField  = 'timestamp';
let sortDir    = -1; // -1 = descending (newest first)

/* ====== Init ====== */
document.addEventListener('DOMContentLoaded', async () => {
  const options = await loadOptions();
  applyTheme(options.globals.darkMode);
  renderVersion();

  allHistory = await loadHistory();
  populateServerFilter(allHistory);
  renderStats(allHistory);
  renderTable();

  // Event listeners
  filterStatus.addEventListener('change', renderTable);
  filterServer.addEventListener('change', renderTable);

  // Sort headers
  document.querySelectorAll('.history-table th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDir *= -1;
      } else {
        sortField = field;
        sortDir = -1;
      }
      // Update visual
      document.querySelectorAll('.history-table th').forEach((h) => h.classList.remove('sorted'));
      th.classList.add('sorted');
      th.querySelector('.sort-arrow').textContent = sortDir === -1 ? '▼' : '▲';
      renderTable();
    });
  });

  // Clear all
  $('#btn-clear').addEventListener('click', async () => {
    if (!confirm('Delete all transfer history? This cannot be undone.')) return;
    await chrome.storage.local.set({ transferHistory: [] });
    allHistory = [];
    renderStats(allHistory);
    renderTable();
    showToast('History cleared', 'success');
  });

  // Export CSV
  $('#btn-export-csv').addEventListener('click', () => {
    exportCSV(getFilteredData());
  });

  // Theme toggle
  $('#theme-toggle').addEventListener('click', () => {
    const isDark = document.body.dataset.theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    options.globals.darkMode = newTheme;
    chrome.storage.sync.set({ globals: options.globals });
  });
});

/* ====== Data ====== */
function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['transferHistory'], (data) => {
      resolve(data.transferHistory || []);
    });
  });
}

/* ====== Filters ====== */
function getFilteredData() {
  let data = [...allHistory];

  const statusVal = filterStatus.value;
  if (statusVal !== 'all') {
    data = data.filter((t) => t.status === statusVal);
  }

  const serverVal = filterServer.value;
  if (serverVal !== 'all') {
    data = data.filter((t) => t.server === serverVal);
  }

  // Sort  
  data.sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (sortField === 'timestamp') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }
    if (aVal < bVal) return -1 * sortDir;
    if (aVal > bVal) return 1 * sortDir;
    return 0;
  });

  return data;
}

/* ====== Render ====== */
function renderTable() {
  const data = getFilteredData();
  tbody.innerHTML = '';

  if (data.length === 0) {
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';

  data.forEach((item) => {
    const tr = document.createElement('tr');

    const time = new Date(item.timestamp).toLocaleString();
    const statusClass = item.status === 'success' ? 'success' : 'fail';

    tr.innerHTML = `
      <td style="white-space:nowrap;">${escapeHtml(time)}</td>
      <td class="name-cell" title="${escapeHtml(item.name || item.url || '')}">${escapeHtml(item.name || 'Unknown')}</td>
      <td>${escapeHtml(item.server || '—')}</td>
      <td><span class="status-pill status-pill--${statusClass}">${item.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStats(history) {
  const today = new Date().toDateString();
  const total = history.length;
  const success = history.filter((t) => t.status === 'success').length;
  const fail = history.filter((t) => t.status === 'fail').length;
  const todayCount = history.filter((t) => new Date(t.timestamp).toDateString() === today).length;

  $('#stat-total').textContent = total;
  $('#stat-success').textContent = success;
  $('#stat-fail').textContent = fail;
  $('#stat-today').textContent = todayCount;
}

function populateServerFilter(history) {
  const servers = [...new Set(history.map((t) => t.server).filter(Boolean))];
  servers.sort();
  servers.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    filterServer.appendChild(opt);
  });
}

/* ====== CSV Export ====== */
function exportCSV(data) {
  const headers = ['Timestamp', 'Name', 'Server', 'Status', 'URL', 'Error'];
  const rows = data.map((t) => [
    t.timestamp,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${(t.server || '').replace(/"/g, '""')}"`,
    t.status,
    `"${(t.url || '').replace(/"/g, '""')}"`,
    `"${(t.error || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `torrentbridge-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  showToast('History exported as CSV', 'success');
}

/* ====== Theme ====== */
function applyTheme(mode) {
  let theme;
  if (mode === 'light') theme = 'light';
  else if (mode === 'dark') theme = 'dark';
  else theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.body.dataset.theme = theme;
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function renderVersion() {
  const manifest = chrome.runtime.getManifest();
  const el = $('#version-display');
  if (el) el.textContent = `Purefusion TorrentBridge v${manifest.version}`;
}

/* ====== Toast ====== */
function showToast(msg, type = 'success') {
  const container = $('#toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ====== Utility ====== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
