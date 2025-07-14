// content.js
console.log("[Torrent Clipper] content.js running");

const sendLink = (url) => {
  chrome.runtime.sendMessage({ type: "addTorrent", url });
};

const scan = () => {
  document.querySelectorAll('a[href^="magnet:"], a[href$=".torrent"]').forEach((a) => {
    if (a.dataset.tcHooked) return;
    a.dataset.tcHooked = "1";

    const btn = document.createElement("span");
    btn.textContent = "📥";
    btn.title = "Send to Torrent Clipper";
    btn.style.cursor = "pointer";
    btn.style.marginLeft = "6px";
    btn.style.color = "green";
    btn.onclick = (e) => {
      e.preventDefault();
      sendLink(a.href);
    };
    a.after(btn);
  });
};

scan();
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
