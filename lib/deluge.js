import BaseClient from './baseclient.js';
import { base64Encode } from '../base64.js';

export default class DelugeApi extends BaseClient {
  constructor(serverSettings) {
    super();

    const url = new URL(serverSettings.hostname);
    this.username = url.username;
    this.password = url.password;

    // Clean up credentials from hostname
    url.username = '';
    url.password = '';

    this.settings = {
      ...serverSettings,
      hostname: url.toString()
    };

    this.cookie = null;
  }

  async logIn() {
    const { hostname, password } = this.settings;

    this._attachListeners();

    try {
      const response = await fetch(`${hostname}json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal': 'true'
        },
        body: JSON.stringify({
          method: 'auth.login',
          params: [password],
          id: 1
        })
      });

      const json = await response.json();

      if (json?.error === null && json.result === true) return;
      throw new Error(chrome.i18n.getMessage('loginError'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async logOut() {
    const { hostname } = this.settings;

    try {
      await fetch(`${hostname}json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal': 'true'
        },
        body: JSON.stringify({
          method: 'auth.delete_session',
          params: [],
          id: 4
        })
      });
    } catch (e) {
      // Ignore network error during logout
    } finally {
      this.removeEventListeners();
      this.cookie = null;
    }
  }

  async addTorrent(torrent, options = {}) {
    const { hostname } = this.settings;

    try {
      const base64torrent = await base64Encode(torrent);
      const opts = {};

      if (options.paused) opts.add_paused = true;
      if (options.path) opts.download_location = options.path;

      const response = await fetch(`${hostname}json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal': 'true'
        },
        body: JSON.stringify({
          method: 'core.add_torrent_file',
          params: ['temp.torrent', base64torrent, opts],
          id: 2
        })
      });

      const json = await response.json();

      if (json?.error === null) {
        if (options.label) {
          await this.addLabel(json.result, options.label);
        }
        return;
      }

      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async addTorrentUrl(url, options = {}) {
    const { hostname } = this.settings;

    try {
      const opts = {};

      if (options.paused) opts.add_paused = true;
      if (options.path) opts.download_location = options.path;

      const response = await fetch(`${hostname}json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal': 'true'
        },
        body: JSON.stringify({
          method: 'core.add_torrent_magnet',
          params: [url, opts],
          id: 2
        })
      });

      const json = await response.json();

      if (json?.error === null) {
        if (options.label) {
          await this.addLabel(json.result, options.label);
        }
        return;
      }

      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async addLabel(torrentId, label) {
    const { hostname } = this.settings;

    try {
      const response = await fetch(`${hostname}json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal': 'true'
        },
        body: JSON.stringify({
          method: 'label.set_torrent',
          params: [torrentId, label.toLowerCase()],
          id: 3
        })
      });

      const json = await response.json();

      if (json?.error === null) return;

      throw new Error(chrome.i18n.getMessage('torrentLabelAddError'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  _attachListeners() {
    const { hostname } = this.settings;
    let sessionCookie = this.cookie;

    if (this.username && this.password) {
      this.addAuthRequiredListener(this.username, this.password);
    }

    this.addHeadersReceivedEventListener((details) => {
      const cookie = this.getCookie(details.responseHeaders, '_session_id');
      if (cookie) sessionCookie = cookie;

      return {
        responseHeaders: this.filterHeaders(details.responseHeaders, ['set-cookie'])
      };
    });

    this.addBeforeSendHeadersEventListener((details) => {
      let headers = details.requestHeaders;
      const isInternal = headers.some((h) => h.name.toLowerCase() === 'x-internal');

      if (isInternal) {
        headers = this.filterHeaders(headers, ['cookie', 'x-internal']);
        if (sessionCookie) {
          headers.push({
            name: 'Cookie',
            value: sessionCookie
          });
        }
      }

      return { requestHeaders: headers };
    });
  }
}
