// lib/qbittorrent.js
import BaseClient from './baseclient.js';

export default class qBittorrentApi extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = { apiVersion: 2, ...serverSettings };
    this.cookie = ''; // We'll manage it manually
  }

  /* ---------- LOGIN ---------- */
  async logIn() {
    const { hostname, username, password, apiVersion } = this.settings;
    const loginPath = apiVersion === 2 ? 'api/v2/auth/login' : 'login';
    const url = hostname.replace(/\/+$/, '/') + loginPath;

    const body = new URLSearchParams({ username, password });

    const res = await fetch(url, {
      method: 'POST',
      body,
      credentials: 'include'
    });

    const text = await res.text();
    if (!res.ok || text.trim() !== 'Ok.') {
      throw new Error(`Login failed: ${res.status} - ${text}`);
    }

    // Grab Set-Cookie from headers manually
    const rawCookie = res.headers.get('set-cookie');
    if (rawCookie) {
      const match = rawCookie.match(/SID=([^;]+)/);
      if (match) {
        this.cookie = `SID=${match[1]}`;
      }
    }

    // Fallback for browsers that don’t expose set-cookie headers
    if (!this.cookie) {
      console.warn('No SID found in response headers. Using cookie jar fallback.');
      this.cookie = ''; // Leave blank — will rely on `credentials: include`
    }
  }

  /* ---------- LOGOUT ---------- */
  async logOut() {
    const { hostname, apiVersion } = this.settings;
    const logoutPath = apiVersion === 2 ? 'api/v2/auth/logout' : 'logout';
    const url = hostname.replace(/\/+$/, '/') + logoutPath;

    await fetch(url, {
      method: 'GET',
      credentials: 'include'
    }).catch(() => {});

    this.cookie = '';
  }

  /* ---------- ADD TORRENT (FILE) ---------- */
  addTorrent(torrentBlob, opts = {}) {
    const { hostname, apiVersion } = this.settings;
    const path = apiVersion === 2 ? 'api/v2/torrents/add' : 'command/upload';

    const form = new FormData();
    if (apiVersion === 2) {
      form.append('fileselect', torrentBlob, 'temp.torrent');
      if (opts.paused) form.append('paused', 'true');
      if (opts.path) form.append('savepath', opts.path);
      if (opts.label) form.append('category', opts.label);
      if (opts.sequentialDownload) form.append('sequentialDownload', 'true');
      if (opts.firstLastPiecePrio) form.append('firstLastPiecePrio', 'true');
    } else {
      form.append('torrents', torrentBlob, 'temp.torrent');
    }

    return this._postForm(hostname + path, form);
  }

  /* ---------- ADD TORRENT (URL) ---------- */
  addTorrentUrl(urlString, opts = {}) {
    const { hostname, apiVersion } = this.settings;
    const path = apiVersion === 2 ? 'api/v2/torrents/add' : 'command/download';

    const form = new FormData();
    form.append('urls', urlString);

    if (apiVersion === 2) {
      if (opts.paused) form.append('paused', 'true');
      if (opts.path) form.append('savepath', opts.path);
      if (opts.label) form.append('category', opts.label);
      if (opts.sequentialDownload) form.append('sequentialDownload', 'true');
      if (opts.firstLastPiecePrio) form.append('firstLastPiecePrio', 'true');
    }

    return this._postForm(hostname + path, form);
  }

  /* ---------- ADD RSS FEED ---------- */
  addRssFeed(feedUrl) {
    const { hostname } = this.settings;
    const form = new FormData();
    form.append('url', feedUrl);
    form.append('path', '');

    return this._postForm(
      hostname.replace(/\/+$/, '/') + 'api/v2/rss/addFeed',
      form
    );
  }

  /* ---------- INTERNAL: POST multipart/form ---------- */
  _postForm(url, form) {
    const headers = this.cookie
      ? { Cookie: this.cookie }
      : undefined;

    return fetch(url, {
      method: 'POST',
      body: form,
      headers,
      credentials: 'include'
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to POST: ${res.status} ${res.statusText}`);
      }
    });
  }

  /* ---------- No-op listeners (MV2 relics) ---------- */
  _attachListeners() { /* empty */ }
}
