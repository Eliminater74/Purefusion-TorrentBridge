# 🔗 Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

**Purefusion TorrentBridge** is a blazing-fast, modular Chrome extension that lets you instantly send `.torrent` and magnet links to your favorite BitTorrent clients — directly from the right-click context menu or custom UI panel.

> Originally forked from **Torrent Clipper** and inspired by **Torrent Control**, this next-generation extension is fully refactored, rebranded, and re-energized for today’s web — and tomorrow’s.

---

## 🚀 Why Choose Purefusion?

As of 2025, many beloved torrent extensions stopped working due to Chrome’s Manifest V3 changes. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from scratch to be fast, modern, and future-proof:

* ✅ **Manifest V3** compliant
* ⚙️ **Modular ES6+** architecture
* 🎨 Clean, responsive UI
* 🧩 Minimal permissions — only requested when needed
* 🌐 **Multi-language support** (NEW!)
* 🔄 Actively maintained

---

## 💡 Key Features

* 🎯 **Right-click context menu** to send torrents or magnets with a single click
* 🧠 **Client auto-detection** and modular architecture
* 🌍 **International language support** (with auto-detection)
* 💾 **Persistent settings** for server IP, credentials, labels, and more
* 🖼️ **Floating popup UI** with draggable interface (optional)
* 📡 **RSS feed support** for clients like qBittorrent
* 🔔 **Native notifications** for success/failure confirmation
* 🧱 **Optional host permissions** — no blanket access needed

---

## 🧠 Supported Clients

Out of the box, Purefusion supports:

* ✅ qBittorrent (v4+)
* ✅ Transmission
* ✅ Deluge (web UI)
* ✅ ruTorrent
* ✅ Flood
* ✅ Tixati (Web UI)
* ✅ uTorrent Web
* ✅ Vuze WebUI
* ✅ CloudTorrent

> Want to add another client? Just drop a new module into `/lib/`.

---

## 🌍 Language Support

Purefusion TorrentBridge now includes full localization via Chrome's `i18n` system:

Supported languages:

* 🇺🇸 English (en, en\_US, en\_GB, en\_AU)
* 🇪🇸 Spanish (es)
* 🇫🇷 French (fr)
* 🇩🇪 German (de)
* 🇷🇺 Russian (ru)
* 🇧🇷 Portuguese – Brazil (pt\_BR)
* 🇫🇮 Finnish (fi)
* 🇯🇵 Japanese (ja)

> Fallback is English if your browser language isn’t supported. More languages coming soon!

---

## 📦 Installation

### 🔧 Developer Mode (Manual)

```bash
git clone https://github.com/Eliminater74/Purefusion-TorrentBridge.git
```

1. Visit `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder

---

## 🖥️ Options Page

Access via the extension popup or directly:

```
chrome-extension://<your-extension-id>/view/options.html
```

Configure:

* BitTorrent client (e.g., qBittorrent, Deluge, etc.)
* Server address, port, and credentials
* Labels, default paths, paused state
* Context menu behavior
* Floating gear visibility
* Language (auto-detected)

---

## 📸 UI Preview

| 📎 Context Menu                       | 🔔 Notifications                        |
| ------------------------------------- | --------------------------------------- |
| ![Menu](screenshots/context-menu.png) | ![Notify](screenshots/notification.png) |

---

## 🧩 Project Structure

```
📁 icon/             → Logos and browser icons
📁 lib/              → Modular API interfaces (qbittorrent.js, etc.)
📁 _locales/         → Translations and multi-language support
📁 view/             → HTML/CSS/JS for options page UI
📄 manifest.json     → Chrome metadata and permissions
📄 background.js     → Context menu dispatcher
📄 content.js        → Link detection + UI injection
📄 base64.js         → FileReader helper for uploads
```

---

## 🆕 Changelog

### 1.0.4 – August 2025

* 🌍 **Added full localization support** with 8+ languages
* 🈳 Locales auto-detect based on browser language
* 🔠 Default fallback: English

### 1.0.3 – July 2025

* 🖼️ Redesigned options page with branding + layout polish
* 🔏 GPG commit support + Git Bash fixes
* ⚙️ Improved `settings.json` config recognition

[Full changelog »](./CHANGELOG.md)

---

## 🛠️ Planned Features

Track progress in `ThingsToDo.md`:

* 🧊 Draggable settings gear (visible on torrent-rich pages only)
* 🎨 Dark mode and theme options
* 🔁 Retry logic for failed transfers
* 🔍 Tracker analysis or link preview
* 🤝 Chrome Sync for profile backup

---

## 🧬 Lineage & Background

Purefusion TorrentBridge carries on the legacy of:

* **Torrent Clipper** – Now abandoned
* **Torrent Control** – Once popular, now outdated for MV3

> This project revitalizes the torrent link experience with clean code and future-ready design.

---

## 👤 Maintainer

**Michael Harrell** (aka [Eliminater74](https://github.com/Eliminater74))
Florida, USA 🇺🇸
Part of the Purefusion Tools family

---

## 🤝 Contributions

Pull requests welcome!

Help needed with:

* 🌐 New client support (e.g., BiglyBT, rTorrent)
* 🖼️ UI themes / accessibility features
* 🈳 Language translation additions
* 📄 Help docs and Web Store page

---

## 📜 License

MIT License
© 2025 [Eliminater74](https://github.com/Eliminater74)

---
