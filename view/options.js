/* ================================================================
   Purefusion TorrentBridge — Options Page Logic
   Handles: settings persistence, connection test, import/export,
            toast notifications, dark mode, password toggle, reset
   ================================================================ */

import {
  clientList,
  loadOptions,
  saveOptions,
  getClient
} from '../util.js';

/* ========= Globals ========= */
let options;
const saveButton    = document.querySelector('#save-options');
const serverSelect  = document.querySelector('#server-list');

/* ========= Helpers ========= */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $all = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

const isLabelsSupported = (servers) =>
  servers.some((s) => {
    const client = clientList.find((c) => c.id === s.application);
    return client?.clientCapabilities?.includes('label');
  });

async function requestOriginPermission(hostname) {
  const origin = hostname.match(/^https?:\/\//)
    ? hostname
    : `http://${hostname}`;
  return new Promise((res) => {
    chrome.permissions.request({ origins: [`${origin}*`] }, (granted) => res(granted));
  });
}

/* ========= Toast Notifications ========= */
function showToast(msg, type = 'success') {
  const container = $('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ========= Theme ========= */
function applyTheme(mode) {
  let theme;
  if (mode === 'light') {
    theme = 'light';
  } else if (mode === 'dark') {
    theme = 'dark';
  } else {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.body.dataset.theme = theme;
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ========= Persist ========= */
async function persistOptions() {
  options.globals.contextMenu         = ~~$('[name="contextmenu"]:checked').value;
  options.globals.catchUrls           = $('#catchurls').checked;
  options.globals.addPaused           = $('#addpaused').checked;
  options.globals.addAdvanced         = $('#addadvanced').checked;
  options.globals.enableNotifications = $('#enablenotifications').checked;
  options.globals.retryOnFail         = $('#retryonfail').checked;

  options.globals.labels = $('#labels').value
    .split(/\n/g).map((l) => l.trim()).filter(Boolean);

  const idx    = ~~serverSelect.value;
  const srvElm = getFormServerConfig();

  $all('[id^="clientOptions"]').forEach((el) => {
    const key = el.id.match(/\[(.+?)]$/)[1];
    srvElm.clientOptions[key] = el.checked;
  });

  const granted = await requestOriginPermission(srvElm.hostname);
  if (!granted) {
    showToast('Permission denied — server not saved', 'error');
    return;
  }

  options.servers[idx] = srvElm;
  saveOptions(options);
  saveButton.setAttribute('disabled', 'true');
  showToast('Settings saved successfully!', 'success');
}

function getFormServerConfig() {
  return {
    name         : $('#name').value,
    application  : $('#application').value,
    hostname     : $('#hostname').value.trim().replace(/\/?$/, '/'),
    username     : $('#username').value,
    password     : $('#password').value,
    directories  : $('#directories').value.split(/\n/g).map((d) => d.trim()).filter(Boolean),
    clientOptions: {},
  };
}

/* ========= Restore ========= */
function restoreOptions() {
  // Enable save on any form change
  $all('textarea, input, select:not(#server-list)').forEach((el) =>
    el.addEventListener('input', () => saveButton.removeAttribute('disabled'), { passive: true })
  );

  // Also listen to toggle switches
  $all('.toggle-switch input').forEach((el) =>
    el.addEventListener('change', () => saveButton.removeAttribute('disabled'), { passive: true })
  );

  $('#labels').placeholder      = 'Label\nAnother label';
  $('#directories').placeholder = '/home/user/downloads\n/data/incomplete';

  // i18n
  $all('[data-i18n]').forEach((el) => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });

  // Populate client dropdown
  clientList.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    $('#application').appendChild(opt);
  });

  loadOptions().then((o) => {
    options = o;

    // Apply theme
    applyTheme(options.globals.darkMode);

    $(`[name="contextmenu"][value="${options.globals.contextMenu}"]`).checked = true;
    $('#catchurls').checked           = options.globals.catchUrls;
    $('#addpaused').checked           = options.globals.addPaused;
    $('#addadvanced').checked         = options.globals.addAdvanced;
    $('#enablenotifications').checked = options.globals.enableNotifications;
    $('#retryonfail').checked         = options.globals.retryOnFail;
    $('#labels').value                = (options.globals.labels || []).join('\n');

    restoreServerList();
    restoreServer(serverSelect.value);
  });

  saveButton.setAttribute('disabled', 'true');
}

function restoreServerList() {
  const sel = serverSelect.value || 0;
  serverSelect.innerHTML = '';
  options.servers.forEach((s, id) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = s.name;
    serverSelect.appendChild(o);
  });

  const add = document.createElement('option');
  add.value = 'add';
  add.textContent = chrome.i18n.getMessage('addServerAction') || '+ Add Server';
  serverSelect.appendChild(add);
  serverSelect.value = sel;
}

function restoreServer(id) {
  const s = options.servers[~~id];
  serverSelect.value = id;

  if (options.globals.currentServer !== ~~id) {
    options.globals.currentServer = ~~id;
    saveOptions(options);
  }

  $('#name').value        = s.name;
  $('#application').value = s.application;
  $('#hostname').value    = s.hostname;
  $('#username').value    = s.username;
  $('#password').value    = s.password;
  $('#directories').value = s.directories.join('\n');

  $('#application').dispatchEvent(new Event('change'));
  $('#remove-server').toggleAttribute('disabled', options.servers.length <= 1);

  // Reset connection status
  setConnectionStatus('idle', 'Ready');
}

/* ========= Server edits ========= */
function addServer() {
  options.servers.push({
    name: 'New server',
    application: clientList[0].id,
    hostname: '',
    username: '',
    password: '',
    directories: [],
    clientOptions: {}
  });
  restoreServerList();
  restoreServer(options.servers.length - 1);
  saveButton.removeAttribute('disabled');
}

function removeServer(id) {
  if (options.servers.length > 1) options.servers.splice(~~id, 1);
  if (options.globals.currentServer === ~~id) options.globals.currentServer = 0;
  restoreServerList();
  restoreServer(0);
  saveButton.removeAttribute('disabled');
  showToast('Server removed', 'info');
}

const validURL = (str) => {
  try {
    new URL(str.match(/^https?:\/\//) ? str : `http://${str}`);
    return true;
  } catch {
    return false;
  }
};

/* ========= Connection Status ========= */
function setConnectionStatus(state, text) {
  const el = $('#connection-status');
  if (!el) return;
  el.className = `connection-status connection-status--${state}`;
  // Keep the dot, update text
  el.innerHTML = `<span class="connection-status__dot"></span> ${text}`;
}

/* ========= Dynamic UI ========= */
$('#application').addEventListener('change', (e) => {
  const c = clientList.find((cl) => cl.id === e.target.value);
  if (!c) return;

  $('#hostname').placeholder = c.addressPlaceholder;
  if (
    !$('#hostname').value ||
    clientList.some((cl) => cl.addressPlaceholder === $('#hostname').value)
  ) {
    $('#hostname').value = c.addressPlaceholder;
  }

  const show = (sel, on) => {
    const p = $(`[data-panel="${sel}"]`);
    if (p) p.style.display = on ? 'flex' : 'none';
  };

  show('directories', c.clientCapabilities?.includes('path'));
  show('label', isLabelsSupported(options.servers) || c.clientCapabilities?.includes('label'));
  $('#username').toggleAttribute('disabled', c.id === 'deluge');

  const panel = $('[data-panel="clientOptions"]');
  panel.innerHTML = '';
  panel.style.display = c.clientOptions ? 'flex' : 'none';

  c.clientOptions?.forEach((opt) => {
    const wrap = document.createElement('div');
    wrap.className = 'toggle-item';

    const label = document.createElement('div');
    label.className = 'toggle-item__label';
    label.textContent = opt.description;

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-switch';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = `clientOptions[${opt.name}]`;
    chk.checked = !!options.servers[options.globals.currentServer].clientOptions[opt.name];
    chk.addEventListener('input', () => saveButton.removeAttribute('disabled'), { passive: true });

    const slider = document.createElement('span');
    slider.className = 'toggle-switch__slider';

    toggleLabel.append(chk, slider);
    wrap.append(label, toggleLabel);
    panel.appendChild(wrap);
  });
});

/* ========= Hostname Validation ========= */
$('#hostname').addEventListener('input', (e) => {
  const txt = e.target.value.trim().replace(/\/?$/, '/');
  const isValid = validURL(txt);
  e.target.style.borderColor = isValid ? '' : 'var(--danger)';
  e.target.style.boxShadow = isValid ? '' : '0 0 0 3px var(--danger-bg)';
});

/* ========= Password Toggle ========= */
$('#password-toggle').addEventListener('click', () => {
  const input = $('#password');
  const btn = $('#password-toggle');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
});

/* ========= Theme Toggle ========= */
$('#theme-toggle').addEventListener('click', () => {
  const isDark = document.body.dataset.theme === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  if (options) {
    options.globals.darkMode = newTheme;
    chrome.storage.sync.set({ globals: options.globals });
  }
});

/* ========= Events ========= */
serverSelect.addEventListener('change', (e) =>
  e.target.value === 'add' ? addServer() : restoreServer(e.target.value)
);

$('#remove-server').addEventListener('click', (e) => {
  e.preventDefault();
  removeServer(serverSelect.value);
});

$('#check-connection').addEventListener('click', async (e) => {
  e.preventDefault();
  const btn = e.target.closest('button');
  btn.disabled = true;
  setConnectionStatus('checking', 'Testing…');

  try {
    const srv = getFormServerConfig();
    const allowed = await requestOriginPermission(srv.hostname);
    if (!allowed) throw new Error('Host permission denied');

    const client = getClient(srv);
    await client.logIn();
    await client.logOut();

    setConnectionStatus('success', 'Connected');
    showToast('Connection successful!', 'success');
  } catch (err) {
    setConnectionStatus('fail', 'Failed');
    showToast(`Connection failed: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
});

/* ========= Import / Export ========= */
$('#export-settings').addEventListener('click', (e) => {
  e.preventDefault();
  loadOptions().then((opts) => {
    const data = JSON.stringify(opts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `purefusion-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showToast('Settings exported!', 'success');
  });
});

$('#import-settings').addEventListener('click', (e) => {
  e.preventDefault();
  $('#import-file').click();
});

$('#import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!imported.globals || !imported.servers) {
        throw new Error('Invalid settings format');
      }
      if (!Array.isArray(imported.servers)) throw new Error('Invalid servers list');

      saveOptions(imported).then(() => {
        showToast('Settings imported! Reloading…', 'success');
        setTimeout(() => restoreOptions(), 500);
      });
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});

/* ========= Reset to Defaults ========= */
$('#reset-defaults').addEventListener('click', (e) => {
  e.preventDefault();
  if (!confirm('Reset all settings to factory defaults? This cannot be undone.')) return;

  chrome.storage.sync.clear(() => {
    chrome.storage.local.clear(() => {
      showToast('All settings reset. Reloading…', 'info');
      setTimeout(() => restoreOptions(), 500);
    });
  });
});

/* ========= Save ========= */
$('#save-options').addEventListener('click', async (e) => {
  e.preventDefault();
  const host = $('#hostname').value.trim().replace(/\/?$/, '/');
  if (!validURL(host)) {
    showToast('Server address is invalid', 'error');
    return;
  }
  await persistOptions();
  restoreServerList();
});

/* ========= Init ========= */
document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  const manifest = chrome.runtime.getManifest();
  const verEl = document.getElementById('version-display');
  if (verEl) verEl.textContent = `Purefusion TorrentBridge v${manifest.version}`;
});

console.log('✅ options.js loaded (v2.0 – toasts, dark mode, password toggle, reset)');
