/* ================================================================
   Purefusion TorrentBridge — Site cleaner registry
   One profile per adware site. The engine and the options page
   both read this list, so a new site does not need new logic.

   Add a site by appending an object to CLEANERS:
     id                     storage key, stable once shipped
     name                   settings label
     label                  short on-page button name
     description            one line shown in settings
     hosts                  hostnames (exact, www., or any subdomain)
     removeSelectors        removed whenever they appear
     guardedSelectors       removed only when they look like overlays
     removeAdFrames         drop known ad iframes
     blockPopups            neutralize window.open while enabled
     blockHijackClicks      stop empty-area click hijacks
     unlockPointerEvents    put clicks back on the page
     removeViewportOverlays remove full-screen fixed layers
     showToggle             show the on-page on/off button

   Magnet links, .torrent links, and anything that contains them
   are never removed. class*=ads is not used as a blanket rule
   because it also matches "downloads".
   ================================================================ */

(function (root) {
  'use strict';

  var CLEANERS = [
    {
      id: 'yts',
      name: 'YTS Mirror Cleaner',
      label: 'YTS Clean',
      description: 'Removes popups, full-screen overlays, and ad frames on YTS mirrors.',
      hosts: [
        'yts.mx',
        'yts.rs',
        'yts.pm',
        'yts.lt',
        'yts.ag',
        'yifytorrent'
      ],
      removeSelectors: [
        'iframe[src*="doubleclick"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="popads"]',
        'iframe[src*="exoclick"]',
        'iframe[src*="juicyads"]',
        '.adsbox',
        '.ad-container',
        '.ad-banner',
        '.adsbygoogle',
        '#overlay',
        '.popupOverlay',
        '.underlay',
        '[id^="google_ads"]'
      ],
      guardedSelectors: [
        'div[onclick]',
        'div[id^="popup"]',
        'div[class*="popup"]',
        'div[class*="ads"]',
        'body > div:not([id]):not([class])'
      ],
      removeAdFrames: true,
      blockPopups: true,
      blockHijackClicks: true,
      unlockPointerEvents: true,
      removeViewportOverlays: true,
      showToggle: true
    }
  ];

  function hostMatches(hostname, cleaner) {
    var host = String(hostname || '').toLowerCase().replace(/\.$/, '');
    if (!host || !cleaner || !cleaner.hosts) return false;

    var bare = host.replace(/^www\./, '');
    for (var i = 0; i < cleaner.hosts.length; i++) {
      var rule = String(cleaner.hosts[i] || '').toLowerCase();
      if (!rule) continue;
      if (host === rule || bare === rule || host.endsWith('.' + rule)) return true;
    }
    return false;
  }

  root.PTB_SITE_CLEANERS = {
    list: CLEANERS,
    match: function (hostname) {
      for (var i = 0; i < CLEANERS.length; i++) {
        if (hostMatches(hostname, CLEANERS[i])) return CLEANERS[i];
      }
      return null;
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
