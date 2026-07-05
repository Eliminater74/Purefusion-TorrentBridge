/**
 * BaseClient – Abstract parent for all torrent‑client adapters.
 * Each concrete client (e.g., QBittorrentApi, DelugeApi) should extend this class
 * and override relevant methods like logIn, addTorrent, etc.
 */
export default class BaseClient {
  /**
   * @param {Object} config – Full config including global options (e.g., retryOnFail)
   */
  constructor(config = {}) {
    /** @type {string|null} – fallback cookie (e.g., "SID=abc123") */
    this.cookie = null;
    /** @type {Object} – global config options */
    this.options = config.globals || {};
  }

  /* ========= Auth ========= */
  async logIn()  { /* override in subclass */ }
  async logOut() { /* override in subclass */ }

  /* ========= Torrent actions ========= */
  async addTorrent(_torrent)     {}
  async addTorrentUrl(_url)      {}

  /* ========= (Legacy) No‑Ops for MV2 webRequest hooks ========= */
  addHeadersReceivedEventListener()     {}
  addBeforeSendHeadersEventListener()   {}
  addAuthRequiredListener()             {}
  removeEventListeners()                {}

  /* ========= Helpers ========= */

  /**
   * Safely parse JSON or throw meaningful errors.
   * @param {Response} response – fetch() response
   * @returns {Promise<any>} – parsed JSON if OK
   * @throws {Error} – localized error message
   */
  async parseJsonResponse(response) {
    const ct = response.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');

    if (response.ok && isJson) return response.json();

    if (response.ok && !isJson) {
      const text = (await response.text()).trim().slice(0, 256);
      throw new Error(chrome.i18n.getMessage('apiError', text));
    }

    if (response.status === 400)
      throw new Error(chrome.i18n.getMessage('torrentAddError'));

    if (response.status === 401)
      throw new Error(chrome.i18n.getMessage('loginError'));

    throw new Error(
      chrome.i18n.getMessage('apiError', `${response.status}: ${response.statusText}`)
    );
  }

  /**
   * Extract a single cookie (key=value) from a Set‑Cookie header array.
   * @param {chrome.webRequest.HttpHeader[]} headers
   * @param {string} key – cookie name
   * @returns {string|null}
   */
  getCookie(headers, key) {
    const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie');
    if (!setCookie) return null;
    const match = new RegExp(`${key}=([^;]+)`).exec(setCookie.value);
    return match ? `${key}=${match[1]}` : null;
  }

  /**
   * Filter out blacklisted header keys from a header array.
   * @param {chrome.webRequest.HttpHeader[]} headers
   * @param {string[]} blacklist – header names to remove
   * @returns {chrome.webRequest.HttpHeader[]}
   */
  filterHeaders(headers, blacklist = []) {
    const blocked = blacklist.map(h => h.toLowerCase());
    return headers.filter(h => !blocked.includes(h.name.toLowerCase()));
  }

  /**
   * Retry wrapper for fetch() with timeout support.
   * Only retries on network errors and 5xx server errors.
   * 4xx client errors are never retried (they won't succeed on retry).
   * @param {string} url 
   * @param {RequestInit} options 
   * @param {number} retries 
   * @param {number} delay – milliseconds between retries
   * @param {number} timeout – milliseconds before aborting (0 = no timeout)
   * @returns {Promise<Response>}
   */
  async fetchWithRetry(url, options, retries = 3, delay = 2000, timeout = 15000) {
    const enableRetry = !!this.options.retryOnFail;

    const fetchWithTimeout = (url, opts) => {
      if (!timeout) return fetch(url, opts);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { ...opts, signal: controller.signal })
        .finally(() => clearTimeout(timer));
    };

    if (!enableRetry) {
      // Retry disabled – single fetch with timeout
      return fetchWithTimeout(url, options);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetchWithTimeout(url, options);
        // Don't retry 4xx errors — they are non-transient (auth, bad request, etc.)
        if (!res.ok && res.status >= 400 && res.status < 500) {
          return res; // Return as-is so callers can inspect the status
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res;
      } catch (err) {
        console.warn(`[Retry ${attempt}] fetch failed:`, err.message);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw err;
        }
      }
    }
  }
}
