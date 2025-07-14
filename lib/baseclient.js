export default class BaseClient {
  constructor() {
    this.cookie = null; // fallback cookie string like "SID=abc123"
  }

  logIn() {
    return Promise.resolve();
  }

  logOut() {
    return Promise.resolve();
  }

  addTorrent(_torrent) {
    return Promise.resolve();
  }

  addTorrentUrl(_url) {
    return Promise.resolve();
  }

  // Stub methods — used by old MV2 extensions (NO-OP in MV3)
  addHeadersReceivedEventListener(_listener) {}
  addBeforeSendHeadersEventListener(_listener) {}
  addAuthRequiredListener(_username, _password) {}
  removeEventListeners() {}

  // Parses fetch() response safely
  async parseJsonResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (response.ok && isJson) {
      return response.json();
    } else if (response.ok && !isJson) {
      const text = await response.text();
      throw new Error(
        chrome.i18n.getMessage('apiError', text.trim().slice(0, 256))
      );
    } else if (response.status === 400) {
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

  // Used in legacy code — still valid if you manually grab set-cookie
  getCookie(headers, key) {
    const cookieHeader = headers.find(
      (h) => h.name.toLowerCase() === 'set-cookie'
    );
    if (!cookieHeader) return null;

    const match = new RegExp(`${key}=([^;]+)`).exec(cookieHeader.value);
    return match ? `${key}=${match[1]}` : null;
  }

  // Removes filtered headers
  filterHeaders(headers, blacklist = []) {
    const blocked = blacklist.map((x) => x.toLowerCase());
    return headers.filter((h) => !blocked.includes(h.name.toLowerCase()));
  }
}
