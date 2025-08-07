import BaseClient from './baseclient.js';

export default class qBittorrentApi extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = { apiVersion: 2, ...serverSettings };
    this.cookie = '';
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

    // Try to extract cookie manually if needed
    const rawCookie = res.headers.get('set-cookie');
    if (rawCookie) {
      const match = rawCookie.match(/SID=([^;]+)/);
      if (match) {
        this.cookie = `SID=${match[1]}`;
      }
    }

    // In most modern browsers/extensions, cookies will be handled by `credentials: include`
    if (!this.cookie) {
      console.warn('No SID from headers — relying on browser-managed cookies.');
      this.cookie = '';
    }
  }

  /* ---------- LOGOUT ---------- */
  async logOut() {
    const { hostname, apiVersion } = this.settings;
    const logoutPath = apiVersion === 2 ? 'api/v2/auth/logout' : 'logout';
    const url = hostname.replace(/\/+$/, '/') + logoutPath;

    try {
      await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (e) {
      // Silent fail
    }

    this.cookie = '';
  }

  /* ---------- ADD TORRENT FILE ---------- */
  addTorrent(torrentBlob, opts = {}) {
    const { hostname, apiVersion } = this.settings;
    const path = apiVersion === 2 ? 'api/v2/torrents/add' : 'command/upload';

    const form = new FormData();
    form.append(apiVersion === 2 ? 'fileselect' : 'torrents', torrentBlob, 'temp.torrent');

    if (apiVersion === 2) {
      if (opts.paused) form.append('paused', 'true');
      if (opts.path) form.append('savepath', opts.path);
      if (opts.label) form.append('category', opts.label);
      if (opts.sequentialDownload) form.append('sequentialDownload', 'true');
      if (opts.firstLastPiecePrio) form.append('firstLastPiecePrio', 'true');
    }

    return this._postForm(hostname + path, form);
  }

  /* ---------- ADD TORRENT BY URL ---------- */
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

    return this._postForm(hostname.replace(/\/+$/, '/') + 'api/v2/rss/addFeed', form);
  }

  /* ---------- PRIVATE: FORM POST HANDLER ---------- */
  _postForm(url, form) {
    const headers = this.cookie ? { Cookie: this.cookie } : undefined;

    return this.fetchWithRetry(url, {
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

  /* ---------- EMPTY: EXTENSION MV2 RELIC ---------- */
  _attachListeners() {}
}
