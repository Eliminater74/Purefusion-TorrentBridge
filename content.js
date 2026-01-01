// content.js
console.log("[Purefusion TorrentBridge] content.js running");

const DEBOUNCE_DELAY = 1000;
let timeoutId = null;

const sendLink = (url) => {
  chrome.runtime.sendMessage({ type: "addTorrent", url });
};

const createHook = (a) => {
  if (a.dataset.tcHooked) return;
  a.dataset.tcHooked = "1";

  const btn = document.createElement("span");
  btn.textContent = "📥";
  btn.title = "Send to Purefusion TorrentBridge";
  btn.style.cursor = "pointer";
  btn.style.marginLeft = "6px";
  btn.style.color = "green";
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the link
    sendLink(a.href);
  };
  a.after(btn);
};

const scan = () => {
  const links = document.querySelectorAll('a[href^="magnet:"], a[href$=".torrent"]');
  links.forEach(createHook);
};

const scanDebounced = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    scan();
    timeoutId = null;
  }, DEBOUNCE_DELAY);
};

// Initial scan
scan();

// Optimized observer
const observer = new MutationObserver((mutations) => {
  // Only trigger if nodes were added
  const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
  if (hasAddedNodes) {
    scanDebounced();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
