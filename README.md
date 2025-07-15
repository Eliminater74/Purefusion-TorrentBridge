# 🔗 Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

**Purefusion TorrentBridge** is a modern, high-performance Chrome extension that lets you instantly send torrent and magnet links to your favorite BitTorrent web client — straight from the right-click context menu.

> Originally forked from "Torrent Clipper," and inspired by "Torrent Control," this next-gen version has been **refactored, rebranded, and re-energized** for the modern web.

---

## 🚀 Why Purefusion?

In 2025, many beloved torrent extensions broke due to Chrome's new Manifest V3 requirements. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from the ground up — with speed, compatibility, and future-proofing in mind.

* 🧠 Modular ES6+ code
* ⚡ Ultra-fast execution
* 🧩 Manifest V3 compliant
* 🧼 Clean UI and responsive Options page
* 🧪 Actively maintained

---

## 💡 Features

* 🎯 **Right-click integration** – Instantly send `.torrent` or magnet links to your client
* 🌐 **Multi-client support** – qBittorrent, Transmission, Deluge, and more
* 💾 **Persistent settings** – Custom host, port, and label saved per session
* 🔔 **Desktop notifications** – Confirm successful transfers
* 📡 **RSS support** – Send feed URLs to clients like qBittorrent
* 🧱 **Optional host permissions** – Requested only when needed
* ✨ **Draggable popup UI** – Sleek, floating interface for quick access

---

## 🧠 Supported Clients

Out of the box, Purefusion supports:

* ✅ qBittorrent (v4+)
* ✅ Transmission
* ✅ Deluge (web UI)
* ✅ ruTorrent
* ✅ Flood
* ✅ Tixati (WebUI)
* ✅ uTorrent Web
* ✅ Vuze WebUI
* ✅ CloudTorrent

> Add new clients easily via `/lib/*.js` modules.

---

## 📦 Installation

### 🔧 Developer Install (Manual)

```bash
git clone https://github.com/Eliminater74/Purefusion-TorrentBridge.git
```

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the project folder

---

## 🖥️ Options Page

Accessible via the extension icon or:

```
chrome-extension://<your-extension-id>/view/options.html
```

Options include:

* Client selection (qBittorrent, Deluge, etc.)
* IP, port, username/password
* Labels, download paths, paused state
* Context menu toggles

---

## 📷 UI Preview

| 📎 Context Menu                       | 🔔 Notification                         |
| ------------------------------------- | --------------------------------------- |
| ![Menu](screenshots/context-menu.png) | ![Notify](screenshots/notification.png) |

---

## 📁 Project Structure

```
📁 icon/                 → Logos and extension icons
📁 lib/                  → Modular API interfaces (qbittorrent.js, deluge.js, etc.)
📁 view/                 → HTML/CSS/JS for the options page
📄 base64.js             → FileReader helper for Base64 uploads
📄 background.js         → Context menu & client dispatcher
📄 content.js            → Torrent UI injection
📄 manifest.json         → Chrome Extension metadata
```

---

## 🛠️ Future Enhancements (Planned)

See `ThingsToDo.md` for the roadmap, including:

* 🧊 Floating settings button (visible only on torrent-rich pages)
* 🖼️ UI themes or dark mode
* 🔁 Auto-retry on failed client responses
* 🌐 Language translation support
* 🤝 Sync profiles across Chrome sync
* 📊 Advanced link preview or tracker validation

---

## 🧬 Legacy & Lineage

This project is a **spiritual successor** to:

* **Torrent Clipper** – Now inactive (last touched \~4 years ago)
* **Torrent Control** – Community forked, but outdated for Chrome MV3

> Purefusion TorrentBridge brings new life, cleaner code, and blazing speed to a much-loved tool.

---

## 👤 Author

Maintained by: [Eliminater74](https://github.com/Eliminater74)
Part of the Purefusion Tools suite
Florida, USA 🇺🇸

---

## 🤝 Contribute

Pull requests welcome! Looking for help with:

* Adding new BitTorrent clients
* UI refinements
* Localization
* Web Store translations

---

## 📜 License

MIT License
© 2025 [Eliminater74](https://github.com/Eliminater74)

---
