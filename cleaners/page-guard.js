/* ================================================================
   Purefusion TorrentBridge — Page-world popup guard
   Runs in the page's JavaScript world so window.open is the one
   the site actually calls. Isolated content scripts cannot do that.

   Blocking follows the on-page flag first, then the localStorage
   mirror written by cleaners/engine.js. Default is on.
   ================================================================ */

(function () {
  'use strict';

  var api = globalThis.PTB_SITE_CLEANERS;
  try {
    delete globalThis.PTB_SITE_CLEANERS;
  } catch (err) {
    /* a locked global just stays; the page never needed this name */
  }

  if (!api || typeof api.match !== 'function' || !location.hostname) return;

  var cleaner = api.match(location.hostname);
  if (!cleaner || cleaner.blockPopups === false) return;
  if (window.__ptbPopupGuard) return;

  try {
    Object.defineProperty(window, '__ptbPopupGuard', { value: true });
  } catch (err) {
    window.__ptbPopupGuard = true;
  }

  var nativeOpen = typeof window.open === 'function'
    ? window.open.bind(window)
    : function () { return null; };

  function shouldBlock() {
    var root = document.documentElement;
    if (root && root.dataset) {
      if (root.dataset.ptbCleanerEnabled === '0') return false;
      if (root.dataset.ptbCleanerEnabled === '1') return true;
    }
    try {
      if (localStorage.getItem('ptb-site-cleaner:master') === '0') return false;
      if (localStorage.getItem('ptb-site-cleaner:' + cleaner.id) === '0') return false;
    } catch (err) {
      /* treat storage failure as still enabled */
    }
    return true;
  }

  function guardedOpen() {
    if (!shouldBlock()) return nativeOpen.apply(window, arguments);
    try {
      console.debug('[Purefusion TorrentBridge] blocked window.open');
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  guardedOpen.__ptbGuard = true;

  function arm() {
    try {
      if (window.open !== guardedOpen) window.open = guardedOpen;
    } catch (err) {
      /* the page locked window.open; nothing else to hook */
    }
  }

  arm();
  setInterval(arm, 2000);
})();
