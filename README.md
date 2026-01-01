Here’s your updated `README.md` rewritten in plain text (not canvas) with proper additions for:

* Shields.io badges
* Visit count badge
* Proper structure (based on your original layout)

---

# 🔗 Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id.svg?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/purefusion-torrentbridge/your-extension-id)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/network)
[![GitHub issues](https://img.shields.io/github/issues/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/issues)
[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Eliminater74.Purefusion-TorrentBridge)](https://github.com/Eliminater74/Purefusion-TorrentBridge)

**Purefusion TorrentBridge** is a blazing-fast, modular Chrome extension that lets you instantly send `.torrent` and magnet links to your favorite BitTorrent clients — directly from the right-click context menu or custom UI panel.

> Originally forked from **Torrent Clipper** and inspired by **Torrent Control**, this next-generation extension is fully refactored, rebranded, and re-energized for today’s web — and tomorrow’s.

---

## 🚀 Why Choose Purefusion?

As of 2025, many beloved torrent extensions stopped working due to Chrome’s Manifest V3 changes. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from scratch to be fast, modern, and future-proof:

* ✅ Manifest V3 compliant
* ⚙️ Modular ES6+ architecture
* 🎨 Clean, responsive UI
* 🧩 Minimal permissions — only requested when needed
* 🌐 Multi-language support (NEW!)
* 🔄 Actively maintained

---

## 💡 Key Features

* 🎯 Right-click context menu to send torrents or magnets with a single click
* 🧠 Client auto-detection and modular architecture
* 🌍 International language support (with auto-detection)
* 💾 Persistent settings for server IP, credentials, labels, and more
* 🖼️ Floating popup UI with draggable interface (optional)
* 📡 RSS feed support for clients like qBittorrent
* 🔔 Native notifications for success/failure confirmation
* 🧱 Optional host permissions — no blanket access needed

---

## 🧠 Supported Clients

Purefusion supports:

* ✅ qBittorrent (v4+)
* ✅ Transmission
* ✅ Deluge (Web UI)
* ✅ ruTorrent
* ✅ Flood
* ✅ Tixati (Web UI)
* ✅ uTorrent Web
* ✅ Vuze WebUI
* ✅ CloudTorrent

> Want to add another client? Just drop a new module into `/lib/`.

---

## 🌍 Language Support

Purefusion TorrentBridge includes full Chrome i18n localization:

* 🇺🇸 English (en, en_US, en_GB, en_AU)
* 🇪🇸 Spanish (es)
* 🇫🇷 French (fr)
* 🇩🇪 German (de)
* 🇷🇺 Russian (ru)
* 🇧🇷 Portuguese – Brazil (pt_BR)
* 🇫🇮 Finnish (fi)
* 🇯🇵 Japanese (ja)

> English is used as a fallback if your browser language is unsupported.

---

## 📦 Installation

### 🔧 Developer Mode (Manual)

```bash
git clone https://github.com/Eliminater74/Purefusion-TorrentBridge.git
````

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder

---

## 🖥️ Options Page

Access from the popup or directly via:

```
chrome-extension://<your-extension-id>/view/options.html
```

You can configure:

* BitTorrent client (e.g., qBittorrent, Deluge, etc.)
* Server IP, port, and credentials
* Labels and default download directory
* Context menu preferences
* Floating gear visibility
* Retry on failure (NEW)
* Language (auto-detected)

---

## 📸 UI Preview

| 📎 Context Menu                       | 🔔 Notifications                        |
| ------------------------------------- | --------------------------------------- |
| ![Menu](screenshots/context-menu.png) | ![Notify](screenshots/notification.png) |

---

## 🧩 Project Structure

```
📁 icon/         → Logos and browser icons
📁 lib/          → API modules for each supported client
📁 _locales/     → Translations (i18n)
📁 view/         → Options page (HTML/CSS/JS)
📄 manifest.json → Chrome metadata and permissions
📄 background.js → Context menu and dispatcher logic
📄 content.js    → Magnet and torrent link detection
📄 base64.js     → Base64 upload helper
```

## 🛠️ Planned Features

See [`ThingsToDo.md`](./ThingsToDo.md):

* 🧊 Draggable settings gear (visible on torrent-heavy pages only)
* 🎨 Dark mode / theme support
* 🔁 Automatic retry logic for failed links
* 🔍 Link preview and tracker validation
* 🤝 Chrome profile sync

---

## 🧬 Lineage & Background

Purefusion TorrentBridge is a spiritual continuation of:

* **Torrent Clipper** – deprecated
* **Torrent Control** – no longer maintained

---

## 👤 Maintainer

**Michael Harrell** (aka [Eliminater74](https://github.com/Eliminater74))
🇺🇸 Florida, USA
Part of the Purefusion Tools family

---

## 🤝 Contributions

Pull requests are welcome!

We especially need help with:

* 🌐 Adding support for more clients (e.g., BiglyBT, WebTorrent)
* 🖼️ UI enhancements and accessibility themes
* 🈳 Community translations
* 🛍️ Web Store publishing & screenshots

---

## 📜 License

MIT License
© 2025 [Eliminater74](https://github.com/Eliminater74)

