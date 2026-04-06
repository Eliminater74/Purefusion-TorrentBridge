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
const MAX_HISTORY = 50;

/* ========= Globals ========= */
let options = {};

/* ========= Service-worker lifecycle logs ========= */
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
    updateBadge();
  })
  .catch((e) => console.error(`[${APP_NAME}] failed to load options`, e));

/* ========= Helpers ========= */
const isConfigured = () =>
  options.servers?.[options.globals.currentServer]?.hostname;

/** Normalize a user-entered hostname to an origin pattern for permissions */
function normalizeOrigin(hostname) {
  try {
    const hasScheme = /^https?:\/\//i.test(hostname);
    const url = new URL(hasScheme ? hostname : `http://${hostname}`);
    return `${url.origin}/*`; // e.g., https://seedbox.example.com/*
  } catch {
    return null;
  }
}

/** Ensure we have host permission for this origin; request if missing */
function ensureHostPermission(origin) {
  return new Promise((resolve) => {
    if (!origin) return resolve(false);
    chrome.permissions.contains({ origins: [origin] }, (has) => {
      if (has) return resolve(true);
      chrome.permissions.request({ origins: [origin] }, (granted) => resolve(!!granted));
    });
  });
}

/* ========= Transfer History ========= */
async function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['transferHistory'], (data) => {
      resolve(data.transferHistory || []);
    });
  });
}

async function addHistoryEntry(entry) {
  const history = await loadHistory();
  history.push({
    url: entry.url || '',
    name: entry.name || 'Unknown',
    status: entry.status || 'success',   // 'success' | 'fail'
    error: entry.error || null,
    server: entry.server || '',
    timestamp: new Date().toISOString()
  });
  // Keep only last MAX_HISTORY entries
  while (history.length > MAX_HISTORY) history.shift();
  await chrome.storage.local.set({ transferHistory: history });
  updateBadge();
}

/* ========= Badge ========= */
async function updateBadge() {
  try {
    const history = await loadHistory();
    const today = new Date().toDateString();
    const todayCount = history.filter(
      (t) => t.status === 'success' && new Date(t.timestamp).toDateString() === today
    ).length;
    const failCount = history.filter(
      (t) => t.status === 'fail' && new Date(t.timestamp).toDateString() === today
    ).length;

    const text = todayCount > 0 ? String(todayCount) : '';
    chrome.action.setBadgeText({ text });

    // Badge color coding (#8): green if last was success, red if last was fail
    const lastEntry = history[history.length - 1];
    const badgeColor = (lastEntry?.status === 'fail' && failCount > 0) ? '#ff6b6b' : '#6c5ce7';
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  } catch (e) {
    console.warn(`[${APP_NAME}] badge update failed:`, e);
  }
}

/* ========= Context-menu builders ========= */
const buildMenus = () => {
  chrome.contextMenus.removeAll(() => {
    createDefaultMenu();
    if (options.servers.length > 1) createServerSelectionMenu();

    if (options.globals.contextMenu) {
      if (isConfigured()) {
        createMainLinkMenus();
      } else {
        createConfigureMenu();
      }
    }
  });
};

const createDefaultMenu = () => {
  chrome.contextMenus.create({
    id: 'catch-urls',
    type: 'checkbox',
    checked: options.globals.catchUrls,
    title: chrome.i18n.getMessage('catchUrlsOption') || 'Catch URLs',
    contexts: ['action']
  }, () => {
    if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
  });

  chrome.contextMenus.create({
    id: 'add-paused',
    type: 'checkbox',
    checked: options.globals.addPaused,
    title: chrome.i18n.getMessage('addPausedOption') || 'Add Paused',
    contexts: ['action']
  }, () => {
    if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
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
    }, () => {
      if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
    })
  );
  chrome.contextMenus.create({ type: 'separator', contexts: ['action'] });
};

const createConfigureMenu = () => {
  chrome.contextMenus.create({
    id: 'open-options',
    title: 'Configure TorrentBridge...',
    contexts: ['link', 'page', 'selection']
  }, () => {
    if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
  });
};

const createMainLinkMenus = () => {
  const srv = options.servers[options.globals.currentServer];
  const client = clientList.find((c) => c.id === srv.application);

  chrome.contextMenus.create({
    id: 'add-torrent',
    title: chrome.i18n.getMessage('addTorrentAction') || 'Add Torrent',
    contexts: ['link']
  }, () => {
    if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
  });

  if (client?.clientCapabilities?.includes('paused')) {
    chrome.contextMenus.create({
      id: 'add-torrent-paused',
      title:
        chrome.i18n.getMessage('addTorrentPausedAction') || 'Add Torrent (Paused)',
      contexts: ['link']
    }, () => {
      if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
    });
  }
  if (client?.clientCapabilities?.includes('rss')) {
    chrome.contextMenus.create({
      id: 'add-rss-feed',
      title: chrome.i18n.getMessage('addRssFeedAction') || 'Add RSS Feed',
      contexts: ['selection', 'link']
    }, () => {
      if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
    });
  }

  // Label submenu (#4)
  if (client?.clientCapabilities?.includes('label') && options.globals.labels?.length > 0) {
    chrome.contextMenus.create({
      id: 'add-with-label',
      title: 'Add with Label',
      contexts: ['link']
    }, () => {
      if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
    });

    options.globals.labels.forEach((label, idx) => {
      chrome.contextMenus.create({
        id: `add-label-${idx}`,
        parentId: 'add-with-label',
        title: label,
        contexts: ['link']
      }, () => {
        if (chrome.runtime.lastError) console.error('Menu error:', chrome.runtime.lastError);
      });
    });
  }
};

/* ========= Click / message listeners ========= */
const registerListeners = () => {
  chrome.contextMenus.onClicked.addListener(handleMenuClick);

  /* Popup replaces action.onClicked, so no listener needed */

  /* ---- Message API ---- */
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    switch (req.type) {
      case 'addTorrent':
        addTorrent(req.url, req.referer || sender?.url || null, req.options || {})
          .then(() => sendResponse({ ok: true }))
          .catch((e) => sendResponse({ ok: false, error: e.message }));
        return true; // async response

      case 'getStatus': {
        const srv = options.servers[options.globals.currentServer];
        sendResponse({
          server: srv?.name || 'Not configured',
          client: srv?.application || null,
          hostname: srv?.hostname || null
        });
        return false;
      }

      case 'addTorrentFile': {
        // Handle drag-and-drop .torrent file from popup (#3)
        const fileData = new Uint8Array(req.data);
        const blob = new Blob([fileData], { type: 'application/x-bittorrent' });
        const svrIdx = options.globals.currentServer;
        const svr = options.servers[svrIdx];
        const svrName = svr?.name || 'Unknown';

        (async () => {
          try {
            const origin = normalizeOrigin(svr?.hostname || '');
            await ensureHostPermission(origin);
            const conn = getClient(svr);
            const torrentName = (await getTorrentName(blob)) || req.fileName || 'Torrent file';
            await conn.logIn();
            await conn.addTorrent(blob, {});
            await conn.logOut();
            notify('Torrent added: ' + torrentName);
            await addHistoryEntry({ url: req.fileName, name: torrentName, status: 'success', server: svrName });
            sendResponse({ ok: true });
          } catch (e) {
            const errMsg = categorizeError(e);
            notify('Upload failed: ' + errMsg);
            await addHistoryEntry({ url: req.fileName, name: req.fileName, status: 'fail', error: errMsg, server: svrName });
            sendResponse({ ok: false, error: errMsg });
          }
        })();
        return true;
      }

      case 'getHistory':
        loadHistory().then((h) => sendResponse(h));
        return true;

      case 'clearHistory':
        chrome.storage.local.set({ transferHistory: [] }, () => {
          updateBadge();
          sendResponse({ ok: true });
        });
        return true;

      default:
        return false;
    }
  });

  /* ---- Keyboard shortcut ---- */
  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== 'add-from-clipboard') return;

    try {
      // Read clipboard via offscreen or fallback
      // In MV3 service workers, we can't directly access clipboard.
      // We'll send a message to the active tab's content script to read it.
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { type: 'readClipboard' }, (response) => {
        if (chrome.runtime.lastError || !response?.text) {
          notify('Could not read clipboard');
          return;
        }
        const text = response.text.trim();
        if (isMagnetUrl(text) || isTorrentUrl(text)) {
          addTorrent(text, null);
        } else {
          notify('Clipboard does not contain a torrent/magnet URL');
        }
      });
    } catch (e) {
      console.error(`[${APP_NAME}] clipboard shortcut error:`, e);
    }
  });
};

const handleMenuClick = (info) => {
  switch (info.menuItemId) {
    case 'open-options':
      return chrome.runtime.openOptionsPage();
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
      // Server selection
      const serverSel = info.menuItemId.match(/^current-server-(\d+)$/);
      if (serverSel) return setCurrentServer(Number(serverSel[1]));

      // Label selection (#4)
      const labelSel = info.menuItemId.match(/^add-label-(\d+)$/);
      if (labelSel) {
        const label = options.globals.labels[Number(labelSel[1])];
        return addTorrent(info.linkUrl, info.pageUrl, { label });
      }
    }
  }
};

/* ========= Core torrent / RSS handlers ========= */
async function addTorrent(url, referer = null, opts = {}) {
  opts = { paused: false, path: null, label: null, ...opts };

  const svrIdx = opts.server ?? options.globals.currentServer;
  const svr = options.servers[svrIdx];
  const svrName = svr?.name || 'Unknown';

  // Ensure permission for this server's origin
  const origin = normalizeOrigin(svr?.hostname || '');
  const granted = await ensureHostPermission(origin);
  if (!granted) {
    const errMsg = chrome.i18n.getMessage('permissionsDenied') || 'Permission denied for server origin';
    notify(errMsg);
    await addHistoryEntry({ url, name: getMagnetUrlName(url) || url, status: 'fail', error: errMsg, server: svrName });
    throw new Error(errMsg);
  }

  const conn = getClient(svr);

  try {
    let torrentName;

    if (isMagnetUrl(url)) {
      torrentName = getMagnetUrlName(url) || 'Magnet link';
      await conn.logIn();
      await conn.addTorrentUrl(url, opts);
      await conn.logOut();
    } else {
      const { torrent, torrentName: tName } = await fetchTorrent(url, referer);
      torrentName = tName || 'Torrent file';
      await conn.logIn();
      await conn.addTorrent(torrent, opts);
      await conn.logOut();
    }

    const successMsg = (chrome.i18n.getMessage('torrentAddedNotification') || 'Torrent added') + (torrentName ? ' ' + torrentName : '');
    notify(successMsg);
    await addHistoryEntry({ url, name: torrentName, status: 'success', server: svrName });

  } catch (e) {
    if (conn.removeEventListeners) conn.removeEventListeners();
    const errorMsg = categorizeError(e);
    notify(chrome.i18n.getMessage('torrentAddError', errorMsg) || `Error: ${errorMsg}`);
    await addHistoryEntry({
      url,
      name: isMagnetUrl(url) ? getMagnetUrlName(url) : url,
      status: 'fail',
      error: errorMsg,
      server: svrName
    });
    throw e;
  }
}

async function fetchTorrent(url, referer) {
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
}

async function addRssFeed(url) {
  const svr = options.servers[options.globals.currentServer];

  // Ensure permission for this server's origin
  const origin = normalizeOrigin(svr?.hostname || '');
  const granted = await ensureHostPermission(origin);
  if (!granted) {
    return notify(chrome.i18n.getMessage('permissionsDenied') || 'Permission denied for server origin');
  }

  const conn = getClient(svr);
  try {
    await conn.logIn();
    await conn.addRssFeed(url);
    notify(chrome.i18n.getMessage('rssFeedAddedNotification'));
  } catch (e) {
    notify(e.message);
  } finally {
    await conn.logOut();
  }
}

/* ========= Error Categorization ========= */
function categorizeError(e) {
  const msg = e?.message || String(e);
  if (/NetworkError|Failed to fetch|net::ERR/i.test(msg)) {
    return 'Network unreachable — check server address';
  }
  if (/401|403|login|auth|denied/i.test(msg)) {
    return 'Authentication failed — check credentials';
  }
  if (/timeout|timed out|ETIMEDOUT/i.test(msg)) {
    return 'Connection timed out';
  }
  if (/400|Bad Request/i.test(msg)) {
    return 'Bad request — the client rejected the torrent';
  }
  return msg;
}

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
    (id) => {
      setTimeout(() => chrome.notifications.clear(id), 5000);
    }
  );
};

// Notification click → open history page (#6)
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('view/history.html') });
});

/* ========= Option toggles ========= */
const setCurrentServer = (id) => {
  options.globals.currentServer = id;
  saveOptions(options);
  buildMenus();
};
const toggleCatchUrls = () => {
  options.globals.catchUrls = !options.globals.catchUrls;
  saveOptions(options);
};
const toggleAddPaused = () => {
  options.globals.addPaused = !options.globals.addPaused;
  saveOptions(options);
};
