/* ========= Imports ========= */
import CloudTorrentApi  from './lib/cloudtorrent.js';
import DelugeApi        from './lib/deluge.js';
import FloodApi         from './lib/flood.js';
import QBittorrentApi   from './lib/qbittorrent.js';
import RuTorrentApi     from './lib/rutorrent.js';
import TixatiApi        from './lib/tixati.js';
import TransmissionApi  from './lib/transmission.js';
import UTorrentApi      from './lib/utorrent.js';
import VuzeWebUIApi     from './lib/vuze_webui.js';

/* ========= Client Registry ========= */
export const clientList = [
  { id: 'biglybt', name: 'BiglyBT', addressPlaceholder: 'http://127.0.0.1:9091/', clientCapabilities: ['paused','path','httpAuth'] },
  { id: 'cloudtorrent', name: 'Cloud Torrent', addressPlaceholder: 'http://127.0.0.1:3000/', clientCapabilities: ['httpAuth'] },
  { id: 'deluge', name: 'Deluge Web UI', addressPlaceholder: 'http://127.0.0.1:8112/', clientCapabilities: ['paused','label','path'] },
  { id: 'flood', name: 'Flood', addressPlaceholder: 'http://127.0.0.1:3000/', clientCapabilities: ['paused','label','path'] },
  {
    id: 'rutorrent',
    name: 'ruTorrent',
    addressPlaceholder: 'http://127.0.0.1/',
    clientCapabilities: ['paused','label','path','rss','httpAuth'],
    clientOptions: [
      { name: 'fast_resume', description: chrome.i18n.getMessage('skipHashCheckOption') }
    ]
  },
  { id: 'tixati', name: 'Tixati', addressPlaceholder: 'http://127.0.0.1:8888/', clientCapabilities: ['paused','httpAuth'] },
  { id: 'transmission', name: 'Transmission', addressPlaceholder: 'http://127.0.0.1:9091/', clientCapabilities: ['paused','path','httpAuth'] },
  { id: 'utorrent', name: 'uTorrent', addressPlaceholder: 'http://127.0.0.1:8112/gui/' },
  { id: 'vuze_remoteui', name: 'Vuze Web Remote', addressPlaceholder: 'http://127.0.0.1:9091/', clientCapabilities: ['paused','path','httpAuth'] },
  { id: 'vuze_webui', name: 'Vuze HTML Web UI', addressPlaceholder: 'http://127.0.0.1:6886/', clientCapabilities: ['httpAuth'] },
  { id: 'vuze_webui_100', name: 'Vuze HTML Web UI (<1.0.0)', addressPlaceholder: 'http://127.0.0.1:6886/' },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    addressPlaceholder: 'http://127.0.0.1:8080/',
    clientCapabilities: ['paused','label','path','rss'],
    clientOptions: [
      { name: 'sequentialDownload', description: chrome.i18n.getMessage('sequentialDownloadOption') },
      { name: 'firstLastPiecePrio', description: chrome.i18n.getMessage('firstLastPiecePriorityOption') }
    ]
  },
  { id: 'qbittorrent_404', name: 'qBittorrent (<=4.0.4)', addressPlaceholder: 'http://127.0.0.1:8080/' }
];

/* ========= Factory ========= */
export function getClient(srv) {
  const apiMap = {
    biglybt         : TransmissionApi,
    cloudtorrent    : CloudTorrentApi,
    deluge          : DelugeApi,
    flood           : FloodApi,
    rutorrent       : RuTorrentApi,
    tixati          : TixatiApi,
    transmission    : TransmissionApi,
    utorrent        : UTorrentApi,
    vuze_remoteui   : TransmissionApi,
    vuze_webui      : VuzeWebUIApi,
    vuze_webui_100  : VuzeWebUIApi,
    qbittorrent     : QBittorrentApi,
    qbittorrent_404 : QBittorrentApi
  };

  const api = apiMap[srv.application];
  if (!api) throw new Error('No client found');

  const config = (srv.application === 'vuze_webui_100' || srv.application === 'qbittorrent_404')
    ? { apiVersion: 1, ...srv }
    : srv;

  return new api(config);
}

/* ========= Options Storage ========= */
export function loadOptions() {
  const defaults = {
    globals: {
      currentServer      : 0,
      addPaused          : false,
      addAdvanced        : false,
      contextMenu        : 1,
      catchUrls          : true,
      enableNotifications: true,
      retryOnFail        : false,
      labels             : []
    },
    servers: [
      {
        name         : 'Default',
        application  : clientList[0].id,
        hostname     : '',
        username     : '',
        password     : '',
        directories  : [],
        clientOptions: {}
      }
    ]
  };

  return new Promise(res => {
    chrome.storage.sync.get(['globals', 'servers'], stored => {
      const merged = structuredClone(defaults);
      deepMerge(merged, stored);

      // Ensure at least one server exists
      if (!Array.isArray(merged.servers) || merged.servers.length === 0) {
        merged.servers.push(structuredClone(defaults.servers[0]));
      }

      // Sanitize known fields (optional)
      merged.globals.retryOnFail = !!merged.globals.retryOnFail;

      res(merged);
    });
  });
}

export const saveOptions = opts => chrome.storage.sync.set(opts);

/* ========= URL Helpers ========= */
export const isMagnetUrl = url => /^magnet:/i.test(url);
export const isTorrentUrl = url => whitelist.some(rx => rx.test(url));

export const getMagnetUrlName = url => {
  const dn = new URLSearchParams(url.substring(7)).get('dn');
  return dn || false;
};

export const getTorrentName = blob => new Promise(resolve => {
  const reader = new FileReader();
  reader.onerror = () => resolve(false);
  reader.onload = () => {
    const match = reader.result.match(/name(\d+):/);
    if (!match) return resolve(false);

    const [, length] = match;
    let text = '', idx = match.index + match[0].length, bytes = 0;
    while (bytes < +length) {
      const ch = reader.result.charAt(idx + text.length);
      text += ch;
      bytes += unescape(encodeURI(ch)).length;
    }
    resolve(text);
  };
  reader.readAsText(blob);
});

/* ========= Deep Merge (Safe) ========= */
function deepMerge(target, src) {
  Object.keys(src).forEach(k => {
    if (
      typeof target[k] === 'object' &&
      typeof src[k] === 'object' &&
      target[k] !== null &&
      src[k] !== null &&
      !Array.isArray(target[k]) &&
      !Array.isArray(src[k])
    ) {
      deepMerge(target[k], src[k]);
    } else {
      target[k] = src[k];
    }
  });
}

/* ========= URL Construction ========= */
export function getURL({ hostname, username, password, application }) {
  const client = clientList.find(c => c.id === application);
  const url = new URL(hostname);
  if (client?.clientCapabilities?.includes('httpAuth')) {
    url.username = username || '';
    url.password = password || '';
  }
  return url.toString();
}

/* ========= Torrent URL Whitelist ========= */
const whitelist = [
  /\.torrent($|\?)/i,
  /\/torrents\.php\?action=download&id=\d+/i,
  /\/dl\/.+?\/\?jackett_apikey=[a-f0-9]{32}&path=/i,
  /\/download\.php\?id=[a-f0-9]{40}&f=.+?&key=/i,
  /\/torrents\/download\/\d+/i,
  /^https:\/\/anidex\.info\/dl\/\d+$/i,
  /^https:\/\/animebytes\.tv\/torrent\/\d+\/download\/$/i
];
