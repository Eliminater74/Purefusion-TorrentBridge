/* ================================================================
   Purefusion TorrentBridge — Site cleaner engine
   Isolated world. Picks the registry profile for this hostname,
   then removes overlays without touching torrent links.

   Enabled state lives in chrome.storage.local under "siteCleaners":
     { master: true, sites: { yts: true } }
   A missing site key means on. The same choice is mirrored into
   localStorage so the page-world popup guard can read it
   synchronously on the next load.
   ================================================================ */

(function () {
  'use strict';

  var LOG = '[Purefusion TorrentBridge]';
  var STORAGE_KEY = 'siteCleaners';
  var api = globalThis.PTB_SITE_CLEANERS;

  if (!api || typeof api.match !== 'function') return;
  if (!document.documentElement || !location.hostname) return;

  var cleaner = api.match(location.hostname);
  if (!cleaner) return;
  if (document.documentElement.dataset.ptbCleanerBooted === '1') return;
  document.documentElement.dataset.ptbCleanerBooted = '1';

  var masterOn = true;
  var siteOn = true;
  var domStarted = false;
  var cleanTimer = null;
  var localRevision = 0;

  function isActive() {
    return masterOn && siteOn;
  }

  function localMasterKey() {
    return 'ptb-site-cleaner:master';
  }

  function localSiteKey() {
    return 'ptb-site-cleaner:' + cleaner.id;
  }

  function readLocalFlag(key) {
    try {
      var value = localStorage.getItem(key);
      if (value === '0') return false;
      if (value === '1') return true;
    } catch (err) {
      /* private mode or a page that blocks storage */
    }
    return null;
  }

  function writeLocalFlags() {
    try {
      localStorage.setItem(localMasterKey(), masterOn ? '1' : '0');
      localStorage.setItem(localSiteKey(), siteOn ? '1' : '0');
    } catch (err) {
      /* ignore */
    }
  }

  function publish() {
    document.documentElement.dataset.ptbCleanerEnabled = isActive() ? '1' : '0';
    document.documentElement.dataset.ptbCleanerId = cleaner.id;
    paintToggle();
  }

  function textOf(className) {
    return typeof className === 'string' ? className : '';
  }

  function isFalseFriend(el) {
    var blob = ((el.id || '') + ' ' + textOf(el.className)).toLowerCase();
    return blob.indexOf('download') !== -1
      || blob.indexOf('torrent') !== -1
      || blob.indexOf('magnet') !== -1;
  }

  function isProtected(el) {
    if (!el || el.nodeType !== 1) return true;
    var tag = el.tagName;
    if (tag === 'HTML' || tag === 'BODY' || tag === 'HEAD' || tag === 'MAIN'
      || tag === 'HEADER' || tag === 'NAV' || tag === 'FOOTER') return true;
    if (el.id === 'ptb-cleaner-toggle' || el.id === 'ptb-cleaner-styles') return true;
    if (el.closest && el.closest('#ptb-cleaner-toggle, #ptb-cleaner-styles, .ptb-send-btn, .ptb-batch-bar, .ptb-toast')) {
      return true;
    }
    if (isFalseFriend(el)) return true;
    try {
      if (el.querySelector('a[href^="magnet:"], a[href*=".torrent"]')) return true;
    } catch (err) {
      return true;
    }
    return false;
  }

  function removeElement(el) {
    if (!el || !el.parentNode || isProtected(el)) return false;
    el.remove();
    return true;
  }

  function isAdFrame(frame) {
    var src = (frame.getAttribute('src') || '').toLowerCase();
    if (!src || src.indexOf('download') !== -1) return false;
    return /doubleclick|googlesyndication|popads|exoclick|juicyads|\/ads?[\/._-]|[?&]ad(?:s|url)?=/.test(src);
  }

  function coversViewport(el, fraction) {
    var style = getComputedStyle(el);
    if (style.position !== 'fixed' && style.position !== 'absolute') return false;
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    var rect = el.getBoundingClientRect();
    return rect.width >= window.innerWidth * fraction
      && rect.height >= window.innerHeight * fraction;
  }

  function isFullOverlay(el) {
    var style = getComputedStyle(el);
    if (style.position !== 'fixed') return false;
    var z = Number(style.zIndex);
    if (!(z > 1000)) return false;
    var rect = el.getBoundingClientRect();
    return rect.width >= window.innerWidth && rect.height >= window.innerHeight;
  }

  function looksLikeOverlay(el) {
    if (isFullOverlay(el) || coversViewport(el, 0.9)) return true;
    return !!el.querySelector && !!el.querySelector('iframe') && coversViewport(el, 0.5);
  }

  function cleanUpPage() {
    if (!document.documentElement) return;
    if (cleaner.showToggle && window.top === window && !document.getElementById('ptb-cleaner-toggle')) {
      createToggle();
    }
    if (!isActive()) return;

    var selectors = cleaner.removeSelectors || [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        removeElement(el);
      });
    });

    if (cleaner.removeAdFrames) {
      document.querySelectorAll('iframe').forEach(function (frame) {
        if (isAdFrame(frame)) removeElement(frame);
      });
    }

    (cleaner.guardedSelectors || []).forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (isFalseFriend(el)) return;
        if (looksLikeOverlay(el) || (el.querySelector && el.querySelector('iframe') && isAdFrame(el.querySelector('iframe')))) {
          removeElement(el);
        }
      });
    });

    if (cleaner.removeViewportOverlays) {
      document.querySelectorAll('div').forEach(function (el) {
        if (isFullOverlay(el)) removeElement(el);
      });
    }

    if (cleaner.unlockPointerEvents) {
      document.documentElement.style.pointerEvents = 'auto';
      if (document.body) document.body.style.pointerEvents = 'auto';
    }
  }

  function scheduleClean() {
    if (cleanTimer) return;
    cleanTimer = setTimeout(function () {
      cleanTimer = null;
      cleanUpPage();
    }, 50);
  }

  function isAllowedClick(target) {
    var el = target && target.nodeType === 1 ? target : target && target.parentElement;
    if (!el || !el.closest) return false;
    return !!el.closest(
      'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"], #ptb-cleaner-toggle, .ptb-send-btn, .ptb-batch-bar, .ptb-toast'
    );
  }

  function installClickGuard() {
    if (cleaner.blockHijackClicks === false) return;
    document.addEventListener('click', function (event) {
      if (!isActive()) return;
      if (isAllowedClick(event.target)) return;
      event.stopImmediatePropagation();
    }, true);
  }

  function paintToggle() {
    var button = document.getElementById('ptb-cleaner-toggle');
    if (!button) return;
    var on = isActive();
    button.dataset.on = on ? '1' : '0';
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.textContent = cleaner.label + ': ' + (on ? 'ON' : 'OFF');
    button.style.background = on ? '#6c5ce7' : '#2d3142';
    button.style.color = on ? '#fff' : '#e8eaed';
    if (!masterOn) {
      button.title = 'Site cleaners are off in TorrentBridge settings';
    } else {
      button.title = on ? 'Pause cleanup on this site' : 'Resume cleanup on this site';
    }
  }

  function createToggle() {
    if (!cleaner.showToggle || window.top !== window) return;
    if (document.getElementById('ptb-cleaner-toggle')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'ptb-cleaner-toggle';
    button.style.position = 'fixed';
    button.style.top = '12px';
    button.style.right = '12px';
    button.style.zIndex = '2147483647';
    button.style.border = '0';
    button.style.borderRadius = '999px';
    button.style.padding = '7px 12px';
    button.style.font = '600 12px/1.2 "Segoe UI", sans-serif';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
    button.style.userSelect = 'none';
    button.style.pointerEvents = 'auto';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!masterOn) return;
      localRevision += 1;
      siteOn = !siteOn;
      writeLocalFlags();
      publish();
      if (isActive()) cleanUpPage();
      persistSite();
    });
    document.documentElement.appendChild(button);
    paintToggle();
  }

  function persistSite() {
    var rev = localRevision;
    chrome.storage.local.get([STORAGE_KEY], function (data) {
      if (rev !== localRevision) return;
      var stored = data[STORAGE_KEY] || { master: true, sites: {} };
      if (typeof stored.master !== 'boolean') stored.master = true;
      stored.sites = stored.sites || {};
      stored.sites[cleaner.id] = siteOn;
      chrome.storage.local.set({ siteCleaners: stored });
    });
  }

  function applyStored(stored) {
    stored = stored || {};
    masterOn = stored.master !== false;
    siteOn = !stored.sites || stored.sites[cleaner.id] !== false;
    writeLocalFlags();
    publish();
    if (isActive()) cleanUpPage();
  }

  function startDomCleaner() {
    if (domStarted) return;
    domStarted = true;
    createToggle();
    cleanUpPage();

    var observer = new MutationObserver(function (mutations) {
      if (!isActive()) return;
      var added = mutations.some(function (mutation) {
        return mutation.addedNodes && mutation.addedNodes.length > 0;
      });
      if (added) scheduleClean();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(cleanUpPage, 1000);
    window.addEventListener('load', cleanUpPage);

    var scrollTimer = null;
    window.addEventListener('scroll', function () {
      if (!isActive()) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(cleanUpPage, 200);
    }, { passive: true });
  }

  var cachedMaster = readLocalFlag(localMasterKey());
  var cachedSite = readLocalFlag(localSiteKey());
  if (cachedMaster !== null) masterOn = cachedMaster;
  if (cachedSite !== null) siteOn = cachedSite;
  publish();
  installClickGuard();
  startDomCleaner();

  chrome.storage.local.get([STORAGE_KEY], function (data) {
    if (localRevision !== 0) return;
    applyStored(data[STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    applyStored(changes[STORAGE_KEY].newValue);
  });

  console.debug(LOG, 'site cleaner ready:', cleaner.id);
})();
