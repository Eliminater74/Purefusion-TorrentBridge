import BaseClient from './baseclient.js';
import { base64Encode } from '../base64.js';

export default class Flood extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = serverSettings;
    this.cookie = null;
  }

  logIn() {
    const { hostname, username, password } = this.settings;

    this._attachListeners();

    const form = new URLSearchParams();
    form.set('username', username);
    form.set('password', password);

    return this.fetchWithRetry(`${hostname}api/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`));
      }

      const json = await response.json();

      if (json.success === true) {
        return;
      } else if (json.success === false) {
        throw new Error(chrome.i18n.getMessage('loginError'));
      } else {
        throw new Error(chrome.i18n.getMessage('apiError', JSON.stringify(json)));
      }
    });
  }

  logOut() {
    this.removeEventListeners();
    return Promise.resolve();
  }

  addTorrent(torrent, options = {}) {
    const { hostname } = this.settings;

    return base64Encode(torrent).then((base64torrent) => {
      const request = {
        files: [base64torrent],
        destination: options.path || '',
        tags: options.label ? [options.label] : [],
        start: !(options.paused || false)
      };

      return this.fetchWithRetry(`${hostname}api/torrents/add-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then((response) => {
        if (!response.ok) {
          throw new Error(chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`));
        }
      });
    });
  }

  addTorrentUrl(url, options = {}) {
    const { hostname } = this.settings;

    const request = {
      urls: [url],
      destination: options.path || '',
      tags: options.label ? [options.label] : [],
      start: !(options.paused || false)
    };

    return this.fetchWithRetry(`${hostname}api/torrents/add-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }).then((response) => {
      if (!response.ok) {
        throw new Error(chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`));
      }
    });
  }

  _attachListeners() {
    let sessionCookie = this.cookie;

    this.addHeadersReceivedEventListener((details) => {
      const cookie = this.getCookie(details.responseHeaders, 'jwt');
      if (cookie) sessionCookie = cookie;

      return {
        responseHeaders: this.filterHeaders(details.responseHeaders, ['set-cookie'])
      };
    });

    this.addBeforeSendHeadersEventListener((details) => {
      const requestHeaders = this.filterHeaders(details.requestHeaders, ['cookie']);
      if (sessionCookie) {
        requestHeaders.push({
          name: 'Cookie',
          value: sessionCookie
        });
      }

      return { requestHeaders };
    });
  }
}
