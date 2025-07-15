import BaseClient from './baseclient.js';

export default class VuzeWebUI extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = {
      apiVersion: 2,
      ...serverSettings
    };
    this.cookie = null;
  }

  async logIn() {
    const { username, password } = this.settings;

    if (username && password) {
      this.addAuthRequiredListener(username, password);
    }

    return Promise.resolve();
  }

  async logOut() {
    this.removeEventListeners();
    return Promise.resolve();
  }

  async addTorrent(torrent) {
    const { hostname } = this.settings;

    const emptyFile = new File([''], ''); // required by WebUI even if unused
    const form = new FormData();
    form.append('upfile_1', emptyFile, '');
    form.append('upfile_0', torrent, 'temp.torrent');

    const response = await fetch(`${hostname}index.tmpl?d=u&local=1`, {
      method: 'POST',
      credentials: 'include',
      body: form
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(chrome.i18n.getMessage('torrentAddError'));
      } else if (response.status === 401) {
        throw new Error(chrome.i18n.getMessage('loginError'));
      } else {
        throw new Error(
          chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`)
        );
      }
    }
  }

  async addTorrentUrl(url) {
    const { hostname, apiVersion } = this.settings;
    const path = apiVersion === 2 ? 'index.ajax' : 'index.tmpl';

    const response = await fetch(`${hostname}${path}?d=u&upurl=${encodeURIComponent(url)}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(chrome.i18n.getMessage('torrentAddError'));
      } else if (response.status === 401) {
        throw new Error(chrome.i18n.getMessage('loginError'));
      } else {
        throw new Error(
          chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`)
        );
      }
    }
  }
}
