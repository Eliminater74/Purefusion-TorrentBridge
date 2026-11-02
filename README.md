# ðŸ”— Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id.svg?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/purefusion-torrentbridge/your-extension-id)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/stargazers)
[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Eliminater74.Purefusion-TorrentBridge)](https://github.com/Eliminater74/Purefusion-TorrentBridge)

**Purefusion TorrentBridge** is a blazing-fast, modular Chrome extension that lets you instantly send `.torrent` and magnet links to your favorite BitTorrent clients â€” directly from the right-click context menu or custom UI panel.

> Originally forked from **Torrent Clipper** and inspired by **Torrent Control**, this next-generation extension is fully refactored, rebranded, and re-energized for todayâ€™s web â€” and tomorrowâ€™s.

---

## ðŸš€ Why Choose Purefusion?

As of 2025, many beloved torrent extensions stopped working due to Chromeâ€™s Manifest V3 changes. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from scratch to be fast, modern, and future-proof:

* âœ… **Manifest V3 Compliant** & Store Safe
* ðŸš€ **New Interactive Popup Dashboard**
* ðŸŽ¨ **Premium Glassmorphism Redesign** with Dark Mode support
* ðŸ“Š **Full Transfer History** and smart error logs
* ðŸ§© **Minimal Permissions** â€” only requested when needed
* ðŸŒ **Global Language Support** (15+ Languages)
* ðŸ”„ **Actively Maintained**

---

## ðŸ’¡ Key Features

* ðŸŽ¯ **Smart Link Hooks**: Styled inline buttons for any torrent or magnet link. Automatically detects private trackers.
* âš¡ **Batch Send Bar**: Floating action bar to send all torrents on a page at once.
* ðŸ“Š **Transfer Dashboard**: Full-page history with sortable tables, CSV export, and live connection status.
* ðŸ“‹ **Keyboard Shortcuts**: `Ctrl+Shift+U` to auto-parse and send magnet links straight from your clipboard.
* ðŸŒ™ **Dark & Light Themes**: Auto-detects your OS preference or override it manually.
* ðŸ–±ï¸ **Context Menu Actions**: Right-click to "Send to Client", "Add Paused", or "Add with Label".
* ðŸž **Interactive Toasts**: Replaces generic alerts with modern, styled notifications.
* ðŸ’¾ **Backup & Restore**: Export your configuration to JSON and restore it instantly on a new install.
* **Site Cleaners**: Strip popups, overlays, and ad frames on supported torrent sites. YTS mirrors are built in, and more sites can be added from one registry file.

---

## ðŸ§  Supported Clients

Purefusion supports almost every major BitTorrent client and Web UI natively out of the box! Connect directly to your existing home server or remote seedbox with ease.

> Want to add another client? Just drop a new module into `/lib/`.

---

## ðŸŒ Language Support

Purefusion TorrentBridge speaks your language:

* ðŸ‡ºðŸ‡¸ English (US/UK/AU)
* ðŸ‡ªðŸ‡¸ Spanish
* ðŸ‡«ðŸ‡· French
* ðŸ‡©ðŸ‡ª German
* ðŸ‡·ðŸ‡º Russian
* ðŸ‡§ðŸ‡· Portuguese (Brazil)
* ðŸ‡®ðŸ‡¹ Italian **(NEW)**
* ðŸ‡¨ðŸ‡³ Simplified Chinese **(NEW)**
* ðŸ‡°ðŸ‡· Korean **(NEW)**
* ðŸ‡³ðŸ‡± Dutch **(NEW)**
* ðŸ‡¹ðŸ‡· Turkish **(NEW)**
* ðŸ‡µðŸ‡± Polish **(NEW)**
* ðŸ‡¸ðŸ‡ª Swedish **(NEW)**
* ðŸ‡«ðŸ‡® Finnish
* ðŸ‡¯ðŸ‡µ Japanese

---

## ðŸ“¦ Installation

### ðŸ”§ Developer Mode (Manual)

```bash
git clone https://github.com/Eliminater74/Purefusion-TorrentBridge.git
```

1.  Open `chrome://extensions`
2.  Enable **Developer mode**
3.  Click **Load unpacked**
4.  Select the project folder

---

## ðŸ–¥ï¸ Options Page

Access from the popup or directly via:
`chrome-extension://<your-extension-id>/view/options.html`

You can configure:
* **BitTorrent Client & Credentials**
* **Connection Testing** (Verify before you save)
* **Import / Export Settings**
* **Context Menu Preferences**
* **Retry Logic** (Auto-retry failed transfers)
* **Directories & Labels**

---

## ðŸ“¸ UI Preview

| ðŸŽ›ï¸ **Popup Dashboard** | âš™ï¸ **Dark Mode Options** |
| :---: | :---: |
| ![Menu](screenshots/context-menu.png) | ![Notify](screenshots/notification.png) |

---

## Site Cleaners

Popup and ad cleanup runs only on sites listed in `cleaners/registry.js`. YTS mirrors are included: `yts.mx`, `yts.rs`, `yts.pm`, `yts.lt`, `yts.ag`, and `yifytorrent`. Every other site is left alone.

Pause a cleaner from the options page, or with the button at the top-right of that site. Magnet links, `.torrent` links, and download blocks are not removed.

To add another site, append a profile to `cleaners/registry.js` and reload the extension. Set the hostnames, what to remove, and whether to block popups and click hijacks. The options page lists the new profile on its own.

---

## ðŸ§© Project Structure

```text
ðŸ“ icon/         â†’ Logos and browser icons
ðŸ“ lib/          â†’ API modules for each supported client
ðŸ“ _locales/     â†’ Translations (i18n)
ðŸ“ view/         â†’ Options page (HTML/CSS/JS)
ðŸ“„ manifest.json â†’ Chrome metadata and permissions
ðŸ“„ background.js â†’ Context menu and dispatcher logic
ðŸ“ cleaners/     â†’ Site cleaner profiles and the shared engine
ðŸ“„ content.js    â†’ Magnet and torrent link detection
ðŸ“„ base64.js     â†’ Base64 upload helper
ðŸ“„ bump-version.ps1 â†’ Automation script
```

---

## ðŸ› ï¸ Planned Features

See [`ThingsToDo.md`](./ThingsToDo.md):
* ðŸ¤ Chrome profile sync
* ã‚­ãƒ¥ãƒ¼ Queue Management
* ðŸ” Tracker Health Check
* ðŸ¦Š Firefox / Edge Support

---

## ðŸ‘¤ Maintainer

**Michael Harrell** (aka [Eliminater74](https://github.com/Eliminater74))
ðŸ‡ºðŸ‡¸ Florida, USA
Part of the Purefusion Tools family

---

## ðŸ“œ License

MIT License
Â© 2025 [Eliminater74](https://github.com/Eliminater74)

