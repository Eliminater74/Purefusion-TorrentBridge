import BaseClient from './baseclient.js';

export default class CloudTorrentApi extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = serverSettings;
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

    try {
      const response = await fetch(`${hostname}api/torrentfile`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-bittorrent',
        },
        body: torrent,
      });

      const text = await this.parseTextResponse(response);
      if (text === 'OK') return;
      throw new Error(chrome.i18n.getMessage('apiError', text));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async addTorrentUrl(url) {
    const { hostname } = this.settings;

    try {
      const response = await fetch(`${hostname}api/magnet`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: url,
      });

      const text = await this.parseTextResponse(response);
      if (text === 'OK') return;
      throw new Error(chrome.i18n.getMessage('apiError', text));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Helper to parse text body and handle common error codes.
   * @param {Response} response
   * @returns {Promise<string>}
   */
  async parseTextResponse(response) {
    if (response.ok) {
      return response.text();
    }

    if (response.status === 400) {
      throw new Error(chrome.i18n.getMessage('torrentAddError'));
    } else if (response.status === 401) {
      throw new Error(chrome.i18n.getMessage('loginError'));
    } else {
      throw new Error(
        chrome.i18n.getMessage(
          'apiError',
          `${response.status}: ${response.statusText}`
        )
      );
    }
  }
}
