/**
 * BaseClient – Abstract parent for all torrent‑client adapters.
 * Each concrete client (qBittorrentApi, DelugeApi, etc.) should extend this class
 * and override the relevant methods (logIn, addTorrent, etc.).
 */
export default class BaseClient {
  constructor () {
    /** @type {string|null} – fallback cookie (e.g., "SID=abc123") */
    this.cookie = null;
  }

  /* ========= Auth ========= */
  async logIn  () { /* override in subclass */ }
  async logOut () { /* override in subclass */ }

  /* ========= Torrent actions ========= */
  async addTorrent    (_torrent) {}
  async addTorrentUrl (_url)     {}

  /* ========= (Legacy) No‑Ops for MV2 webRequest hooks ========= */
  /* These are kept for API parity but are empty in MV3 */
  addHeadersReceivedEventListener  () {}
  addBeforeSendHeadersEventListener() {}
  addAuthRequiredListener          () {}
  removeEventListeners             () {}

  /* ========= Helpers ========= */

  /**
   * Safely parse JSON or throw meaningful errors.
   * @param {Response} response – fetch() response
   * @returns {Promise<any>}    – parsed JSON if OK
   * @throws {Error}            – localized error message
   */
  async parseJsonResponse (response) {
    const ct     = response.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');

    if (response.ok && isJson) return response.json();

    if (response.ok && !isJson) {
      const text = (await response.text()).trim().slice(0, 256);
      throw new Error(chrome.i18n.getMessage('apiError', text));
    }

    if (response.status === 400) throw new Error(chrome.i18n.getMessage('torrentAddError'));
    if (response.status === 401) throw new Error(chrome.i18n.getMessage('loginError'));

    throw new Error(
      chrome.i18n.getMessage('apiError',
        `${response.status}: ${response.statusText}`
      )
    );
  }

  /**
   * Extract a single cookie (key=value) from a Set‑Cookie header array.
   * @param {chrome.webRequest.HttpHeader[]} headers
   * @param {string} key – cookie name
   * @returns {string|null}
   */
  getCookie (headers, key) {
    const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie');
    if (!setCookie) return null;
    const match = new RegExp(`${key}=([^;]+)`).exec(setCookie.value);
    return match ? `${key}=${match[1]}` : null;
  }

  /**
   * Filter out blacklisted header keys from a header array.
   * @param {chrome.webRequest.HttpHeader[]} headers
   * @param {string[]} blacklist – header names to remove
   */
  filterHeaders (headers, blacklist = []) {
    const blocked = blacklist.map(h => h.toLowerCase());
    return headers.filter(h => !blocked.includes(h.name.toLowerCase()));
  }
}
