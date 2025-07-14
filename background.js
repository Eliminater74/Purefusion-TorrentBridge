/* ========= Imports ========= */
import {
  clientList,
  loadOptions,
  saveOptions,
  getClient,
  isTorrentUrl,
  isMagnetUrl,
  getTorrentName,
  getMagnetUrlName,
  getURL
} from './util.js';

/* ========= Constants ========= */
const APP_NAME = 'Purefusion TorrentBridge';
const ICON_48  = 'icon/icon_48.png';

/* ========= Globals ========= */
let options = {};

/* ========= Service‑worker lifecycle logs ========= */
chrome.runtime.onInstalled.addListener(() =>
  console.log(`[${APP_NAME}] service worker installed`)
);
chrome.runtime.onStartup.addListener(() =>
  console.log(`[${APP_NAME}] service worker started`)
);

/* ========= Load user options, then build menus ========= */
loadOptions()
  .then((loaded) => {
    options = loaded;
    buildMenus();
    registerListeners();
  })
  .catch((e) => console.error(`[${APP_NAME}] failed to load options`, e));

/* ========= Helpers ========= */
const isConfigured = () =>
  options.servers?.[options.globals.currentServer]?.hostname;

/* ========= Context‑menu builders ========= */
const buildMenus = () => {
  chrome.contextMenus.removeAll(() => {
    createDefaultMenu();
    if (options.servers.length > 1) createServerSelectionMenu();
    if (options.globals.contextMenu && isConfigured()) createMainLinkMenus();
  });
};

const createDefaultMenu = () => {
  chrome.contextMenus.create({
    id: 'catch-urls',
    type: 'checkbox',
    checked: options.globals.catchUrls,
    title: chrome.i18n.getMessage('catchUrlsOption') || 'Catch URLs',
    contexts: ['action']
  });

  chrome.contextMenus.create({
    id: 'add-paused',
    type: 'checkbox',
    checked: options.globals.addPaused,
    title: chrome.i18n.getMessage('addPausedOption') || 'Add Paused',
    contexts: ['action']
  });
};

const createServerSelectionMenu = () => {
  const ctx = ['action'];
  if (options.globals.contextMenu) ctx.push('page');

  options.servers.forEach((srv, idx) =>
    chrome.contextMenus.create({
      id: `current-server-${idx}`,
      type: 'radio',
      checked: idx === options.globals.currentServer,
      title: srv.name,
      contexts: ctx
    })
  );
  chrome.contextMenus.create({ type: 'separator', contexts: ['action'] });
};

const createMainLinkMenus = () => {
  const srv = options.servers[options.globals.currentServer];
  const client = clientList.find((c) => c.id === srv.application);

  chrome.contextMenus.create({
    id: 'add-torrent',
    title: chrome.i18n.getMessage('addTorrentAction') || 'Add Torrent',
    contexts: ['link']
  });

  if (client?.clientCapabilities?.includes('paused')) {
    chrome.contextMenus.create({
      id: 'add-torrent-paused',
      title:
        chrome.i18n.getMessage('addTorrentPausedAction') || 'Add Torrent (Paused)',
      contexts: ['link']
    });
  }
  if (client?.clientCapabilities?.includes('rss')) {
    chrome.contextMenus.create({
      id: 'add-rss-feed',
      title: chrome.i18n.getMessage('addRssFeedAction') || 'Add RSS Feed',
      contexts: ['selection', 'link']
    });
  }
};

/* ========= Click / message listeners ========= */
const registerListeners = () => {
  chrome.contextMenus.onClicked.addListener(handleMenuClick);

  chrome.action.onClicked.addListener(() => {
    if (isConfigured()) {
      chrome.tabs.create({
        url: getURL(options.servers[options.globals.currentServer])
      });
    } else {
      chrome.runtime.openOptionsPage();
    }
  });

  chrome.runtime.onMessage.addListener((req, sender) => {
    if (req.type === 'addTorrent') {
      addTorrent(req.url, sender?.url || null);
    }
  });
};

const handleMenuClick = (info) => {
  switch (info.menuItemId) {
    case 'catch-urls':
      return toggleCatchUrls();
    case 'add-paused':
      return toggleAddPaused();
    case 'add-torrent':
      return addTorrent(info.linkUrl, info.pageUrl);
    case 'add-torrent-paused':
      return addTorrent(info.linkUrl, info.pageUrl, { paused: true });
    case 'add-rss-feed':
      return addRssFeed(info.linkUrl || info.selectionText?.trim());
    default: {
      const serverSel = info.menuItemId.match(/^current-server-(\d+)$/);
      if (serverSel) setCurrentServer(Number(serverSel[1]));
    }
  }
};

/* ========= Core torrent / RSS handlers ========= */
const addTorrent = (url, referer = null, opts = {}) => {
  opts = { paused: false, path: null, label: null, ...opts };
  const svrIdx = opts.server ?? options.globals.currentServer;
  const svr = options.servers[svrIdx];
  const conn = getClient(svr);

  const done = (name) =>
    notify(
      chrome.i18n.getMessage('torrentAddedNotification') + (name ? ' ' + name : '')
    );

  const fail = (e) =>
    notify(
      chrome.i18n.getMessage(
        'torrentAddError',
        e?.message?.includes('NetworkError') ? 'Network error' : e.message
      )
    );

  if (isMagnetUrl(url)) {
    conn
      .logIn()
      .then(() => conn.addTorrentUrl(url, opts))
      .then(() => {
        done(getMagnetUrlName(url));
        conn.logOut();
      })
      .catch((e) => {
        conn.removeEventListeners();
        fail(e);
      });
  } else {
    fetchTorrent(url, referer)
      .then(({ torrent, torrentName }) =>
        conn
          .logIn()
          .then(() => conn.addTorrent(torrent, opts))
          .then(() => {
            done(torrentName);
            conn.logOut();
          })
      )
      .catch((e) => {
        conn.removeEventListeners();
        fail(e);
      });
  }
};

const fetchTorrent = async (url, referer) => {
  const headers = new Headers({ Accept: 'application/x-bittorrent,*/*;q=0.9' });
  if (referer) headers.append('Referer', referer);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(
      chrome.i18n.getMessage(
        'torrentFetchError',
        `${res.status}: ${res.statusText}`
      )
    );
  }

  const ct = res.headers.get('content-type') || '';
  if (!/(application\/x-bittorrent|application\/octet-stream)/i.test(ct)) {
    throw new Error(
      chrome.i18n.getMessage('torrentParseError', `Type: ${ct}`)
    );
  }

  const blob = await res.blob();
  return { torrent: blob, torrentName: await getTorrentName(blob) };
};

const addRssFeed = (url) => {
  const svr = options.servers[options.globals.currentServer];
  const conn = getClient(svr);
  conn
    .logIn()
    .then(() => conn.addRssFeed(url))
    .then(() => notify(chrome.i18n.getMessage('rssFeedAddedNotification')))
    .catch((e) => notify(e.message))
    .finally(() => conn.logOut());
};

/* ========= UI helpers ========= */
const notify = (msg) => {
  if (!options?.globals?.enableNotifications) return;
  chrome.notifications.create(
    {
      type: 'basic',
      iconUrl: chrome.runtime.getURL(ICON_48),
      title: APP_NAME,
      message: msg
    },
    (id) => setTimeout(() => chrome.notifications.clear(id), 3000)
  );
};

/* ========= Option toggles ========= */
const setCurrentServer = (id) => {
  options.globals.currentServer = id;
  saveOptions(options);
};
const toggleCatchUrls = () => {
  options.globals.catchUrls = !options.globals.catchUrls;
  saveOptions(options);
};
const toggleAddPaused = () => {
  options.globals.addPaused = !options.globals.addPaused;
  saveOptions(options);
};
