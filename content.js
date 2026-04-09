/* ================================================================
   Purefusion TorrentBridge — Content Script
   Smart torrent/magnet link detection with styled UI hooks
   ================================================================ */

console.log('[Purefusion TorrentBridge] content.js v2.0 loaded');

/* ====== Configuration ====== */
const DEBOUNCE_DELAY = 800;
const BATCH_THRESHOLD = 3;
let timeoutId = null;
let batchBar = null;
let toastTimeout = null;
let catchUrlsEnabled = true; // Will be loaded from options (#9)

/* ====== Torrent URL Detection Patterns (#5 expanded) ====== */
const TORRENT_PATTERNS = [
  /\.torrent($|\?)/i,
  /\/torrents\.php\?action=download&id=\d+/i,
  /\/dl\/.+?\/\?jackett_apikey=[a-f0-9]{32}&path=/i,
  /\/download\.php\?id=[a-f0-9]{40}&f=.+?&key=/i,
  /\/torrents\/download\/\d+/i,
  /^https:\/\/anidex\.info\/dl\/\d+$/i,
  /^https:\/\/animebytes\.tv\/torrent\/\d+\/download\/$/i,
  // Specialized link patterns
  /\/torrent\/download\/[A-F0-9]+/i,
  /\/torrent\/\d+\/.*\//i,
  /nyaa\.(si|net)\/download\/\d+\.torrent/i,
  /torrentgalaxy\.(to|mx)\/get\//i,
  /eztv\.(re|wf|ch)\/ep\/\d+/i,
  /\/torrent\/.+\.torrent$/i,
  // Generic tracker patterns
  /\/download\.php\?.*torrent/i,
  /\/dl\/[a-f0-9]{40}/i,
  /\/get_torrent\?/i
];

const isMagnetUrl = (url) => /^magnet:/i.test(url);
const isTorrentUrl = (url) => TORRENT_PATTERNS.some((rx) => rx.test(url));
const isRelevantLink = (href) => href && (isMagnetUrl(href) || isTorrentUrl(href));

/* ====== Inject Styles ====== */
function injectStyles() {
  if (document.getElementById('ptb-styles')) return;

  const style = document.createElement('style');
  style.id = 'ptb-styles';
  style.textContent = `
    /* Send Button */
    .ptb-send-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 6px;
      padding: 2px 8px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6c5ce7, #5a4bd1);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      border: none;
      line-height: 1;
      vertical-align: middle;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
      text-decoration: none !important;
    }

    .ptb-send-btn:hover {
      transform: translateY(-1px) scale(1.05);
      box-shadow: 0 4px 14px rgba(108, 92, 231, 0.45);
      background: linear-gradient(135deg, #7f70f0, #6c5ce7);
    }

    .ptb-send-btn:active {
      transform: translateY(0) scale(0.98);
    }

    .ptb-send-btn--sent {
      background: linear-gradient(135deg, #00cec9, #00b5ad) !important;
      pointer-events: none;
    }

    /* Batch Send Bar */
    .ptb-batch-bar {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 14px;
      background: rgba(15, 17, 23, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(108, 92, 231, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e8eaed;
      font-size: 13px;
      animation: ptbSlideUp 0.35s ease;
    }

    .ptb-batch-bar__icon {
      font-size: 18px;
    }

    .ptb-batch-bar__text {
      font-weight: 500;
    }

    .ptb-batch-bar__count {
      color: #6c5ce7;
      font-weight: 700;
    }

    .ptb-batch-bar__btn {
      padding: 7px 16px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #6c5ce7, #5a4bd1);
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ptb-batch-bar__btn:hover {
      background: linear-gradient(135deg, #7f70f0, #6c5ce7);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
    }

    .ptb-batch-bar__close {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      color: #9aa0b0;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .ptb-batch-bar__close:hover {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    /* Inline Toast */
    .ptb-toast {
      position: fixed;
      bottom: 70px;
      right: 20px;
      z-index: 9999999;
      padding: 10px 18px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: white;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      animation: ptbSlideUp 0.3s ease, ptbFadeOut 0.3s ease 2.5s forwards;
    }

    .ptb-toast--success {
      background: linear-gradient(135deg, #00cec9, #00b5ad);
    }

    .ptb-toast--error {
      background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
    }

    @keyframes ptbSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes ptbFadeOut {
      from { opacity: 1; }
      to   { opacity: 0; pointer-events: none; }
    }
  `;

  document.head.appendChild(style);
}

/* ====== Send torrent to background ====== */
function sendLink(url, btn) {
  // Update button state
  if (btn) {
    btn.textContent = '…';
    btn.classList.add('ptb-send-btn--sent');
  }

  chrome.runtime.sendMessage({ type: 'addTorrent', url }, (response) => {
    if (btn) {
      if (response?.ok !== false) {
        btn.textContent = '✓';
        showInlineToast('Sent to client!', 'success');
      } else {
        btn.textContent = '✗';
        btn.classList.remove('ptb-send-btn--sent');
        btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a5a)';
        showInlineToast(response?.error || 'Failed to send', 'error');
      }
    }
  });
}

/* ====== Create hook button for a link ====== */
function createHook(a) {
  if (a.dataset.ptbHooked) return;
  a.dataset.ptbHooked = '1';

  const btn = document.createElement('span');
  btn.className = 'ptb-send-btn';
  btn.textContent = '📥';
  btn.title = 'Send to TorrentBridge';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    sendLink(a.href, btn);
  });

  a.after(btn);

  // Copy magnet link button (#10) — only for magnet links
  if (isMagnetUrl(a.href)) {
    const copyBtn = document.createElement('span');
    copyBtn.className = 'ptb-send-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy magnet link';
    copyBtn.style.background = 'linear-gradient(135deg, #636e72, #2d3436)';

    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(a.href).then(() => {
        copyBtn.textContent = '✓';
        copyBtn.classList.add('ptb-send-btn--sent');
        showInlineToast('Magnet link copied!', 'success');
      }).catch(() => {
        showInlineToast('Failed to copy', 'error');
      });
    });

    btn.after(copyBtn);
  }
}

/* ====== Scan for torrent links ====== */
function scan() {
  // Broader selector — catches magnet: links and tries others via JS check
  const allLinks = document.querySelectorAll('a[href]');
  let torrentLinks = [];

  allLinks.forEach((a) => {
    if (isRelevantLink(a.href)) {
      createHook(a);
      if (!a.dataset.ptbCounted) {
        a.dataset.ptbCounted = '1';
        torrentLinks.push(a);
      }
    }
  });

  // Count all hooked links
  const allHooked = document.querySelectorAll('a[data-ptb-hooked]');
  updateBatchBar(allHooked.length);
}

function scanDebounced() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    scan();
    timeoutId = null;
  }, DEBOUNCE_DELAY);
}

/* ====== Batch Send Bar ====== */
function updateBatchBar(count) {
  if (count < BATCH_THRESHOLD) {
    if (batchBar) {
      batchBar.remove();
      batchBar = null;
    }
    return;
  }

  if (batchBar) {
    // Update count
    const countEl = batchBar.querySelector('.ptb-batch-bar__count');
    if (countEl) countEl.textContent = count;
    return;
  }

  batchBar = document.createElement('div');
  batchBar.className = 'ptb-batch-bar';
  batchBar.innerHTML = `
    <span class="ptb-batch-bar__icon">⚡</span>
    <span class="ptb-batch-bar__text">
      <span class="ptb-batch-bar__count">${count}</span> torrent links found
    </span>
    <button class="ptb-batch-bar__btn" id="ptb-batch-send">Send All</button>
    <button class="ptb-batch-bar__close" id="ptb-batch-close" title="Dismiss">✕</button>
  `;

  document.body.appendChild(batchBar);

  batchBar.querySelector('#ptb-batch-send').addEventListener('click', () => {
    const links = document.querySelectorAll('a[data-ptb-hooked]');
    let sent = 0;
    links.forEach((a) => {
      const btn = a.nextElementSibling;
      if (btn && btn.classList.contains('ptb-send-btn') && !btn.classList.contains('ptb-send-btn--sent')) {
        sendLink(a.href, btn);
        sent++;
      }
    });
    showInlineToast(`Sending ${sent} torrents…`, 'success');

    // Update button
    const sendBtn = batchBar.querySelector('#ptb-batch-send');
    if (sendBtn) {
      sendBtn.textContent = `Sent ${sent}!`;
      sendBtn.disabled = true;
    }
  });

  batchBar.querySelector('#ptb-batch-close').addEventListener('click', () => {
    batchBar.remove();
    batchBar = null;
  });
}

/* ====== Inline Toast ====== */
function showInlineToast(msg, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.ptb-toast');
  if (existing) existing.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = `ptb-toast ptb-toast--${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  toastTimeout = setTimeout(() => toast.remove(), 3000);
}

/* ====== Clipboard read (for keyboard shortcut) ====== */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === 'readClipboard') {
    navigator.clipboard.readText()
      .then((text) => sendResponse({ text }))
      .catch(() => sendResponse({ text: null }));
    return true; // async
  }
});

/* ====== Init — Check catchUrls option first (#9) ====== */
chrome.storage.sync.get(['globals'], (data) => {
  catchUrlsEnabled = data?.globals?.catchUrls !== false;

  if (catchUrlsEnabled) {
    injectStyles();
    scan();

    const observer = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasAddedNodes) scanDebounced();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Purefusion TorrentBridge] content hooks active');
  } else {
    console.log('[Purefusion TorrentBridge] catchUrls disabled — hooks skipped');
  }
});
