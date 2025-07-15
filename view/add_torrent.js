/* ========= Imports ========= */
import { clientList, loadOptions } from '../util.js';

/* ========= Helpers ========= */
const $    = (q, ctx = document) => ctx.querySelector(q);
const $all = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ========= Globals ========= */
let options;

/* ========= Init ========= */
document.addEventListener('DOMContentLoaded', async () => {
  await restoreOptions();
});

/* ========= Restore UI ========= */
async function restoreOptions() {
  const urlParams = new URLSearchParams(window.location.search);
  $('#url').value = urlParams.get('url') || '';

  // i18n text
  $all('[data-i18n]').forEach(el => {
    el.textContent = chrome.i18n.getMessage(el.dataset.i18n);
  });

  options = await loadOptions();

  $('#addpaused').checked = options.globals.addPaused;

  // Populate server list
  options.servers.forEach((srv, idx) => {
    $('#server').append(
      new Option(srv.name, idx)
    );
  });

  // Populate global labels
  options.globals.labels.forEach(label => {
    $('#labels').append(new Option(label, label));
  });

  // Pre‑select current server
  selectServer(options.globals.currentServer);
}

/* ========= Capability helper ========= */
const supports = (client, cap) =>
  client?.clientCapabilities?.includes(cap);

/* ========= Server switch handler ========= */
function selectServer(serverId) {
  const srvIdx  = Number(serverId);
  $('#server').value = srvIdx;

  const srv    = options.servers[srvIdx];
  const client = clientList.find(c => c.id === srv.application);

  /* --- Directories panel --- */
  const dirSel = $('#downloadLocation');
  dirSel.innerHTML = '<option value="">' + chrome.i18n.getMessage('defaultOption') + '</option>';

  if (supports(client, 'path')) {
    srv.directories.forEach(dir => dirSel.append(new Option(dir, dir)));
    dirSel.disabled = false;
  } else {
    dirSel.disabled = true;
  }

  /* --- Labels panel --- */
  const labelSel = $('#labels');
  labelSel.disabled = !supports(client, 'label');

  /* --- Paused checkbox --- */
  $('#addpaused').disabled = !supports(client, 'paused');
}

/* ========= Event bindings ========= */
$('#server').addEventListener('change', e => selectServer(e.target.value));

$('#add-torrent').addEventListener('click', e => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);

  const opts = {
    paused:   $('#addpaused').checked,
    label:    $('#labels').value || undefined,
    path:     $('#downloadLocation').value || undefined,
    server:   $('#server').value ? Number($('#server').value) : undefined
  };

  chrome.runtime.sendMessage({
    type: 'addTorrent',
    url: params.get('url'),
    referer: params.get('referer'),
    options: opts
  });

  window.close();
});
