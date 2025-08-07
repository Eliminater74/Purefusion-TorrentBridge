import BaseClient from './baseclient.js';

export default class ruTorrent extends BaseClient {
  constructor(serverSettings) {
    super();
    this.settings = serverSettings;
  }

  logIn() {
    const { username, password } = this.settings;
    if (username && password) {
      this.addAuthRequiredListener(username, password);
    }
    return Promise.resolve();
  }

  logOut() {
    this.removeEventListeners();
    return Promise.resolve();
  }

  addTorrent(torrent, options = {}) {
    const { hostname } = this.settings;

    const form = new FormData();
    form.append('torrent_file', torrent, 'temp.torrent');

    if (options.paused) form.append('torrents_start_stopped', 'true');
    if (options.path) form.append('dir_edit', options.path);
    if (options.label) form.append('label', options.label);
    if (options.fast_resume) form.append('fast_resume', '1');

    return this.fetchWithRetry(`${hostname}php/addtorrent.php?json=1`, {
      method: 'POST',
      credentials: 'include',
      body: form
    })
      .then(this.parseJsonResponse)
      .then((json) => {
        if (json.result === 'Success') return;
        throw new Error(chrome.i18n.getMessage('torrentAddError', json.result || 'Unknown error'));
      });
  }

  addTorrentUrl(url, options = {}) {
    const { hostname } = this.settings;

    const params = new URLSearchParams({
      json: '1',
      url
    });

    if (options.paused) params.append('torrents_start_stopped', 'true');
    if (options.path) params.append('dir_edit', options.path);
    if (options.label) params.append('label', options.label);
    if (options.fast_resume) params.append('fast_resume', '1');

    return this.fetchWithRetry(`${hostname}php/addtorrent.php?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(this.parseJsonResponse)
      .then((json) => {
        if (json.result === 'Success') return;
        throw new Error(chrome.i18n.getMessage('torrentAddError', json.result || 'Unknown error'));
      });
  }

  addRssFeed(url) {
    const { hostname } = this.settings;

    const form = new FormData();
    form.append('mode', 'add');
    form.append('url', url);
    form.append('label', '');

    return this.fetchWithRetry(`${hostname}plugins/rss/action.php`, {
      method: 'POST',
      credentials: 'include',
      body: form
    })
      .then(this.parseJsonResponse)
      .then((json) => {
        if (json.errors?.length === 0) return;
        throw new Error(chrome.i18n.getMessage('rssFeedAddError', json.errors.join(', ') || 'Unknown error'));
      });
  }
}
