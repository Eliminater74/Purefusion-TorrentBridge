/* ================================================================
   Purefusion TorrentBridge — Popup Dashboard Logic
   Features: server switch, status, history, magnet add + preview,
             drag & drop, theme toggle, auto-close
   ================================================================ */

import { clientList, loadOptions, saveOptions, getClient, getURL, isMagnetUrl, getMagnetUrlName } from '../util.js';

/* ====== DOM Refs ====== */
const $ = (q) => document.querySelector(q);
const serverSwitch = $('#server-switch');
const statusDot    = $('#status-dot');
const statusClient = $('#status-client');
const statusBadge  = $('#status-badge');
const historyList  = $('#history-list');
const emptyState   = $('#empty-state');
const magnetInput  = $('#magnet-input');
const sendBtn      = $('#btn-send-magnet');
const magnetPreview = $('#magnet-preview');
const dropZone     = $('#drop-zone');
const toastBox     = $('#toast-container');

/* ====== State ====== */
let options;

/* ====== Init ====== */
document.addEventListener('DOMContentLoaded', async () => {
  options = await loadOptions();

  applyTheme(options.globals.darkMode);
  populateServerSwitch();
  renderStatus();
  await renderHistory();
  renderVersion();

  /* --- Server Quick-Switch (#1) --- */
  serverSwitch.addEventListener('change', () => {
    const newIdx = Number(serverSwitch.value);
    options.globals.currentServer = newIdx;
    saveOptions(options);
    renderStatus();
    showToast(`Switched to ${options.servers[newIdx].name}`, 'success');
  });

  /* --- Quick Action Buttons --- */
  $('#btn-webui').addEventListener('click', () => {
    const srv = options.servers[options.globals.currentServer];
    if (srv?.hostname) {
      chrome.tabs.create({ url: getURL(srv) });
      window.close();
    } else {
      showToast('No server configured', 'error');
    }
  });

  $('#btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  $('#btn-history').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('view/history.html') });
    window.close();
  });

  $('#btn-paste').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && isMagnetUrl(text)) {
        magnetInput.value = text;
        sendBtn.disabled = false;
        updateMagnetPreview(text);
        magnetInput.focus();
      } else {
        showToast('No magnet link in clipboard', 'error');
      }
    } catch {
      showToast('Clipboard access denied', 'error');
    }
  });

  $('#btn-theme').addEventListener('click', () => {
    const isDark = document.body.dataset.theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    options.globals.darkMode = newTheme;
    chrome.storage.sync.set({ globals: options.globals });
  });

  $('#btn-clear-history').addEventListener('click', async () => {
    await chrome.storage.local.set({ transferHistory: [] });
    renderHistory();
    showToast('History cleared', 'success');
  });

  /* --- Magnet Input with Preview (#7) --- */
  magnetInput.addEventListener('input', () => {
    const val = magnetInput.value.trim();
    const valid = isMagnetUrl(val);
    sendBtn.disabled = !valid;
    if (valid) {
      updateMagnetPreview(val);
    } else {
      magnetPreview.style.display = 'none';
    }
  });

  /* --- Send Magnet + Auto-close (#11) --- */
  sendBtn.addEventListener('click', () => {
    const url = magnetInput.value.trim();
    if (!isMagnetUrl(url)) return;
    sendBtn.disabled = true;
    sendBtn.textContent = '…';
    chrome.runtime.sendMessage({ type: 'addTorrent', url }, () => {
      showToast('Magnet sent to client!', 'success');
      magnetInput.value = '';
      magnetPreview.style.display = 'none';
      sendBtn.textContent = 'Send';
      // Auto-close after brief delay so user sees the toast
      setTimeout(() => window.close(), 1200);
    });
  });

  /* --- Drag & Drop .torrent files (#3) --- */
  ['dragenter', 'dragover'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drop-zone--active');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drop-zone--active');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.torrent')) {
      showToast('Only .torrent files are supported', 'error');
      return;
    }

    // Read file as blob and send to background
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: 'application/x-bittorrent' });
      // Send via background message
      chrome.runtime.sendMessage({
        type: 'addTorrentFile',
        fileName: file.name,
        data: Array.from(new Uint8Array(reader.result))
      }, (response) => {
        if (response?.ok !== false) {
          showToast(`Uploading: ${file.name}`, 'success');
          setTimeout(() => {
            renderHistory();
          }, 2000);
        } else {
          showToast(response?.error || 'Upload failed', 'error');
        }
      });
    };
    reader.readAsArrayBuffer(file);
  });

  // Also allow clicking the drop zone to select a file
  dropZone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.torrent';
    input.addEventListener('change', () => {
      if (input.files[0]) {
        const evt = new DragEvent('drop', {
          dataTransfer: new DataTransfer()
        });
        // Simulate drop by reading the file directly
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          chrome.runtime.sendMessage({
            type: 'addTorrentFile',
            fileName: file.name,
            data: Array.from(new Uint8Array(reader.result))
          }, (response) => {
            if (response?.ok !== false) {
              showToast(`Uploading: ${file.name}`, 'success');
              setTimeout(() => renderHistory(), 2000);
            } else {
              showToast(response?.error || 'Upload failed', 'error');
            }
          });
        };
        reader.readAsArrayBuffer(file);
      }
    });
    input.click();
  });
});

/* ====== Server Switch (#1) ====== */
function populateServerSwitch() {
  serverSwitch.innerHTML = '';
  options.servers.forEach((srv, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = srv.name || `Server ${idx + 1}`;
    serverSwitch.appendChild(opt);
  });
  serverSwitch.value = options.globals.currentServer;
}

/* ====== Status ====== */
async function renderStatus() {
  const svrIdx = options.globals.currentServer;
  const srv = options.servers[svrIdx];

  if (!srv?.hostname) {
    statusClient.textContent = 'Open Settings to add a server';
    statusDot.className = 'status-dot status-dot--disconnected';
    return;
  }

  const client = clientList.find((c) => c.id === srv.application);
  statusClient.textContent = client?.name || srv.application;

  // Show today's transfer count
  const history = await loadHistory();
  const today = new Date().toDateString();
  const todayCount = history.filter(
    (t) => new Date(t.timestamp).toDateString() === today
  ).length;
  statusBadge.textContent = todayCount;

  // Check permissions and try connection
  try {
    const hasScheme = /^https?:\/\//i.test(srv.hostname);
    const url = new URL(hasScheme ? srv.hostname : `http://${srv.hostname}`);
    const origin = `${url.origin}/*`;

    const hasPermission = await new Promise((resolve) => {
      chrome.permissions.contains({ origins: [origin] }, (has) => resolve(has));
    });

    if (!hasPermission) {
      statusDot.className = 'status-dot status-dot--connected';
      statusClient.textContent = (client?.name || srv.application) + ' (not verified)';
      return;
    }

    statusDot.className = 'status-dot status-dot--checking';
    const conn = getClient(srv);
    await conn.logIn();
    await conn.logOut();
    statusDot.className = 'status-dot status-dot--connected';
  } catch (e) {
    console.warn('[TorrentBridge] popup connection test failed:', e.message);
    statusDot.className = 'status-dot status-dot--connected';
    statusClient.textContent = (client?.name || srv.application) + ' (configured)';
  }
}

/* ====== Magnet Preview (#7) ====== */
function updateMagnetPreview(url) {
  const name = getMagnetUrlName(url);
  if (name) {
    magnetPreview.innerHTML = `📄 <span class="magnet-preview__name">${escapeHtml(name)}</span>`;
    magnetPreview.style.display = '';
  } else {
    magnetPreview.innerHTML = '🧲 Magnet link detected';
    magnetPreview.style.display = '';
  }
}

/* ====== Transfer History ====== */
async function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['transferHistory'], (data) => {
      resolve(data.transferHistory || []);
    });
  });
}

async function renderHistory() {
  const history = await loadHistory();
  const recent = history.slice(-5).reverse();

  historyList.innerHTML = '';

  if (recent.length === 0) {
    emptyState.style.display = '';
    historyList.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  historyList.style.display = '';

  recent.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'history-item';

    const icon = item.status === 'success' ? '✅' : '❌';
    const statusClass = item.status === 'success' ? 'success' : 'fail';
    const ago = timeAgo(item.timestamp);

    el.innerHTML = `
      <span class="history-item__icon">${icon}</span>
      <div class="history-item__info">
        <div class="history-item__name" title="${escapeHtml(item.name || item.url || 'Unknown')}">${escapeHtml(item.name || 'Unknown torrent')}</div>
        <div class="history-item__meta">${escapeHtml(item.server || '—')} · ${ago}</div>
      </div>
      <span class="history-item__status history-item__status--${statusClass}">${item.status}</span>
    `;
    historyList.appendChild(el);
  });
}

/* ====== Theme ====== */
function applyTheme(mode) {
  let theme;
  if (mode === 'light') theme = 'light';
  else if (mode === 'dark') theme = 'dark';
  else theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.body.dataset.theme = theme;
  const themeBtn = $('#btn-theme');
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ====== Version ====== */
function renderVersion() {
  const manifest = chrome.runtime.getManifest();
  const el = $('#footer-version');
  if (el) el.textContent = `Purefusion TorrentBridge v${manifest.version}`;
}

/* ====== Toast ====== */
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  toastBox.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ====== Utility ====== */
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
