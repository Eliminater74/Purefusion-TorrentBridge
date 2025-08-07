import BaseClient from './baseclient.js';
import { base64Encode } from '../base64.js';

export default class Transmission extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = serverSettings;
    this.session = null;
  }

  logIn() {
    const { hostname, username, password } = this.settings;

    if (username && password) {
      this.addAuthRequiredListener(username, password);
    }

    this._attachListeners();

    return this.fetchWithRetry(`${hostname}transmission/rpc`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ method: 'session-get' })
    }).then(async (response) => {
      if (response.status === 200) {
        const json = await response.json();
        if (json.result === 'success') return;
        throw new Error(chrome.i18n.getMessage('loginError'));
      } else if (response.status === 401) {
        throw new Error(chrome.i18n.getMessage('loginError'));
      } else if (response.status === 409 && response.headers.has('X-Transmission-Session-Id')) {
        this.session = response.headers.get('X-Transmission-Session-Id');
        return this.logIn(); // retry with session ID
      } else {
        throw new Error(chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`));
      }
    });
  }

  logOut() {
    this.removeEventListeners();
    this.session = null;
    return Promise.resolve();
  }

  async addTorrent(torrent, options = {}) {
    const { hostname } = this.settings;
    const base64torrent = await base64Encode(torrent);

    const request = {
      method: 'torrent-add',
      arguments: {
        metainfo: base64torrent,
        ...(options.paused ? { paused: true } : {}),
        ...(options.path ? { 'download-dir': options.path } : {})
      }
    };

    const response = await this.fetchWithRetry(`${hostname}transmission/rpc`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    const json = await response.json();
    if (json.result !== 'success') {
      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    }
  }

  async addTorrentUrl(url, options = {}) {
    const { hostname } = this.settings;

    const request = {
      method: 'torrent-add',
      arguments: {
        filename: url,
        ...(options.paused ? { paused: true } : {}),
        ...(options.path ? { 'download-dir': options.path } : {})
      }
    };

    const response = await this.fetchWithRetry(`${hostname}transmission/rpc`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    const json = await response.json();
    if (json.result !== 'success') {
      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    }
  }

  _attachListeners() {
    this.addHeadersReceivedEventListener((details) => {
      const sessionHeader = details.responseHeaders.find(
        (h) => h.name.toLowerCase() === 'x-transmission-session-id'
      );
      if (sessionHeader) {
        this.session = sessionHeader.value;
      }
      return {
        responseHeaders: this.filterHeaders(details.responseHeaders, ['set-cookie'])
      };
    });

    this.addBeforeSendHeadersEventListener((details) => {
      const headers = this.filterHeaders(details.requestHeaders, ['x-transmission-session-id']);
      if (this.session) {
        headers.push({
          name: 'X-Transmission-Session-Id',
          value: this.session
        });
      }
      return { requestHeaders: headers };
    });
  }
}
