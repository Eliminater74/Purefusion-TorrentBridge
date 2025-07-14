/* ========= Imports ========= */
import {
  clientList,
  loadOptions,
  saveOptions,
} from '../util.js';

/* ========= Globals ========= */
let options;
const saveButton   = document.querySelector('#save-options');
const serverSelect = document.querySelector('#server-list');

/* ========= Helpers ========= */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $all = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

const isLabelsSupported = (servers) =>
  servers.some((s) => {
    const client = clientList.find((c) => c.id === s.application);
    return client?.clientCapabilities?.includes('label');
  });

/* === Permission helper === */
async function requestOriginPermission(hostname) {
  // ensure scheme & trailing slash
  const origin = hostname.match(/^https?:\/\//)
    ? hostname
    : `http://${hostname}`;
  return new Promise((res) => {
    chrome.permissions.request({ origins: [`${origin}*`] }, (granted) => res(granted));
  });
}

/* ========= Persist ========= */
async function persistOptions() {
  // —— globals
  options.globals.contextMenu        = ~~$('[name="contextmenu"]:checked').value;
  options.globals.catchUrls          = $('#catchurls').checked;
  options.globals.addPaused          = $('#addpaused').checked;
  options.globals.addAdvanced        = $('#addadvanced').checked;
  options.globals.enableNotifications= $('#enablenotifications').checked;

  options.globals.labels = $('#labels').value
    .split(/\n/g).map((l) => l.trim()).filter(Boolean);

  // —— server‑specific
  const idx      = ~~serverSelect.value;
  const srvElm   = {
    name       : $('#name').value,
    application: $('#application').value,
    hostname   : $('#hostname').value.trim().replace(/\/?$/, '/'),
    username   : $('#username').value,
    password   : $('#password').value,
    directories: $('#directories').value.split(/\n/g).map((d) => d.trim()).filter(Boolean),
    clientOptions: {},
  };

  // collect any dynamic client options
  $all('[id^="clientOptions"]').forEach((el) => {
    const key = el.id.match(/\[(.+?)]$/)[1];
    srvElm.clientOptions[key] = el.checked;
  });

  /* ——— request host permission if we don't already have it ——— */
  const granted = await requestOriginPermission(srvElm.hostname);
  if (!granted) {
    alert('Permission denied. Server not saved.');
    return;
  }

  // save + UI
  options.servers[idx] = srvElm;
  saveOptions(options);
  saveButton.setAttribute('disabled', 'true');
}

/* ========= Restore options/UI ========= */
function restoreOptions() {
  // enable save‑button dirty‑state tracking
  $all('textarea, input, select:not(#server-list)').forEach((el) =>
    el.addEventListener('input', () => saveButton.removeAttribute('disabled'), { passive: true })
  );

  // placeholders, i18n, populate client dropdown
  $('#labels').placeholder      = 'Label\nAnother label';
  $('#directories').placeholder = '/home/user/downloads\n/data/incomplete';

  $all('[data-i18n]').forEach((el) =>
    (el.textContent = chrome.i18n.getMessage(el.dataset.i18n))
  );

  clientList.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name;
    $('#application').appendChild(opt);
  });

  loadOptions().then((o) => {
    options = o;
    $(`[name="contextmenu"][value="${options.globals.contextMenu}"]`).checked = true;
    $('#catchurls').checked          = options.globals.catchUrls;
    $('#addpaused').checked          = options.globals.addPaused;
    $('#addadvanced').checked        = options.globals.addAdvanced;
    $('#enablenotifications').checked= options.globals.enableNotifications;
    $('#labels').value               = options.globals.labels.join('\n');

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
    o.value = id; o.textContent = s.name;
    serverSelect.appendChild(o);
  });
  const add = document.createElement('option');
  add.value = 'add'; add.textContent = chrome.i18n.getMessage('addServerAction');
  serverSelect.appendChild(add);
  serverSelect.value = sel;
}

function restoreServer(id) {
  const s = options.servers[~~id];
  serverSelect.value = id;
  options.globals.currentServer = ~~id;
  saveOptions(options);          // persist current index

  $('#name').value        = s.name;
  $('#application').value = s.application;
  $('#hostname').value    = s.hostname;
  $('#username').value    = s.username;
  $('#password').value    = s.password;
  $('#directories').value = s.directories.join('\n');

  $('#application').dispatchEvent(new Event('change'));

  // enable / disable remove button
  $('#remove-server').toggleAttribute('disabled', options.servers.length <= 1);
}

/* ========= Server list edits ========= */
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
  restoreServerList(); restoreServer(0); saveButton.removeAttribute('disabled');
}

/* ========= Validation ========= */
const validURL = (str) => {
  try { new URL(str.match(/^https?:\/\//) ? str : `http://${str}`); return true; }
  catch { return false; }
};

/* ========= Dynamic UI handlers ========= */
$('#application').addEventListener('change', (e) => {
  const c = clientList.find((cl) => cl.id === e.target.value);
  if (!c) return;

  $('#hostname').placeholder = c.addressPlaceholder;
  if (!$('#hostname').value || clientList.some((cl) => cl.addressPlaceholder === $('#hostname').value))
    $('#hostname').value = c.addressPlaceholder;

  // safe panel toggles
  const show = (sel, on) => { const p = $(`[data-panel="${sel}"]`); if (p) p.style.display = on ? 'flex' : 'none'; };

  show('directories', c.clientCapabilities?.includes('path'));
  show('label', isLabelsSupported(options.servers) || c.clientCapabilities?.includes('label'));

  $('#username').toggleAttribute('disabled', c.id === 'deluge');

  /* build client‑specific options */
  const panel = $('[data-panel="clientOptions"]');
  panel.innerHTML = '';                 // clear
  panel.style.display = c.clientOptions ? 'flex' : 'none';

  c.clientOptions?.forEach((opt) => {
    const wrap   = document.createElement('div');
    wrap.className= 'panel-formElements-item browser-style';

    const chk    = document.createElement('input');
    chk.type     = 'checkbox';
    chk.id       = `clientOptions[${opt.name}]`;
    chk.checked  = !!options.servers[options.globals.currentServer].clientOptions[opt.name];
    chk.addEventListener('input', () => saveButton.removeAttribute('disabled'), { passive: true });

    const lbl    = document.createElement('label');
    lbl.htmlFor  = chk.id;
    lbl.textContent = opt.description;

    wrap.append(chk, lbl);
    panel.appendChild(wrap);
  });
});

/* ========= Live hostname validation ========= */
$('#hostname').addEventListener('input', (e) => {
  const txt = e.target.value.trim().replace(/\/?$/, '/');
  e.target.style.borderColor = validURL(txt) ? '' : 'red';
});

/* ========= Event wiring ========= */
serverSelect.addEventListener('change', (e) =>
  e.target.value === 'add' ? addServer() : restoreServer(e.target.value)
);
$('#remove-server').addEventListener('click', (e) => { e.preventDefault(); removeServer(serverSelect.value); });
$('#save-options').addEventListener('click', async (e) => {
  e.preventDefault();
  const host = $('#hostname').value.trim().replace(/\/?$/, '/');
  if (!validURL(host)) return alert('Server address is invalid');
  await persistOptions();
  restoreServerList();
});

document.addEventListener('DOMContentLoaded', restoreOptions);
console.log('✅ options.js loaded (with dynamic permissions)');
