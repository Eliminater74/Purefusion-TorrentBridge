import BaseClient from './baseclient.js';

export default class uTorrent extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = serverSettings;
    this.cookie = null;
    this.token = null;
  }

  async logIn() {
    const { hostname, username, password } = this.settings;

    if (username && password) {
      this.addAuthRequiredListener(username, password);
    }

    this._attachListeners();

    const response = await this.fetchWithRetry(`${hostname}token.html`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) {
      throw new Error(chrome.i18n.getMessage('loginError'));
    }

    if (!response.ok) {
      throw new Error(
        chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`)
      );
    }

    const html = await response.text();
    const tokenMatch = html.match(/<div.*?>(.*?)<\/div>/);

    if (tokenMatch && tokenMatch[1]) {
      this.token = tokenMatch[1];
    } else {
      throw new Error(chrome.i18n.getMessage('apiError', html));
    }
  }

  logOut() {
    this.removeEventListeners();
    this.token = null;
    this.cookie = null;
    return Promise.resolve();
  }

  async addTorrent(torrent) {
    const { hostname } = this.settings;

    const form = new FormData();
    form.append('torrent_file', torrent, 'temp.torrent');

    const response = await this.fetchWithRetry(`${hostname}?token=${this.token}&action=add-file`, {
      method: 'POST',
      credentials: 'include',
      body: form
    });

    const json = await response.json();
    if (json.error) {
      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    }
  }

  async addTorrentUrl(url) {
    const { hostname } = this.settings;

    const response = await this.fetchWithRetry(
      `${hostname}?token=${this.token}&action=add-url&s=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    const json = await response.json();
    if (json.error) {
      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    }
  }

  _attachListeners() {
    const { username, password } = this.settings;
    let sessionCookie = this.cookie;

    this.addHeadersReceivedEventListener((details) => {
      const cookie = this.getCookie(details.responseHeaders, 'GUID');
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
