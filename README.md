# 🔗 Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id.svg?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/purefusion-torrentbridge/your-extension-id)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/stargazers)
[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Eliminater74.Purefusion-TorrentBridge)](https://github.com/Eliminater74/Purefusion-TorrentBridge)

**Purefusion TorrentBridge** is a blazing-fast, modular Chrome extension that lets you instantly send `.torrent` and magnet links to your favorite BitTorrent clients — directly from the right-click context menu or custom UI panel.

> Originally forked from **Torrent Clipper** and inspired by **Torrent Control**, this next-generation extension is fully refactored, rebranded, and re-energized for today’s web — and tomorrow’s.

---

## 🚀 Why Choose Purefusion?

As of 2025, many beloved torrent extensions stopped working due to Chrome’s Manifest V3 changes. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from scratch to be fast, modern, and future-proof:

*   ✅ **Manifest V3 Compliant** & Store Safe
*   ⚙️ **Modular ES6+ Architecture**
*   🎨 **Clean, Responsive UI**
*   🧩 **Minimal Permissions** — only requested when needed
*   🌐 **Global Language Support** (15+ Languages)
*   🔄 **Actively Maintained**

---

## 💡 Key Features

*   🎯 **Instant Link Detection**: Automatically finds torrents and magnets on any site.
*   🖱️ **Context Menu Actions**: Right-click to "Send to Client", "Add Paused", or "Add with Label".
*   🧪 **Connection Testing**: Verify your server settings instantly from the Options page.
*   💾 **Backup & Restore**: Export your configuration to JSON and restore it instantly on a new install.
*   🔧 **Smart Configuration**: Fallback menus guide you if your settings are missing.
*   🌍 **International**: Full i18n support with auto-detection.
*   📡 **RSS Feed Support**: For clients like qBittorrent.
*   🔔 **Native Notifications**: Get instant feedback on success or failure.

---

## 🧠 Supported Clients

Purefusion supports:

*   ✅ qBittorrent (v4+)
*   ✅ Transmission
*   ✅ Deluge (Web UI)
*   ✅ ruTorrent
*   ✅ Flood
*   ✅ Tixati (Web UI)
*   ✅ uTorrent Web
*   ✅ Vuze WebUI
*   ✅ CloudTorrent
*   ✅ BiglyBT

> Want to add another client? Just drop a new module into `/lib/`.

---

## 🌍 Language Support

Purefusion TorrentBridge speaks your language:

*   🇺🇸 English (US/UK/AU)
*   🇪🇸 Spanish
*   🇫🇷 French
*   🇩🇪 German
*   🇷🇺 Russian
*   🇧🇷 Portuguese (Brazil)
*   🇮🇹 Italian **(NEW)**
*   🇨🇳 Simplified Chinese **(NEW)**
*   🇰🇷 Korean **(NEW)**
*   🇳🇱 Dutch **(NEW)**
*   🇹🇷 Turkish **(NEW)**
*   🇵🇱 Polish **(NEW)**
*   🇸🇪 Swedish **(NEW)**
*   🇫🇮 Finnish
*   🇯🇵 Japanese

---

## 📦 Installation

### 🔧 Developer Mode (Manual)

```bash
git clone https://github.com/Eliminater74/Purefusion-TorrentBridge.git
```

1.  Open `chrome://extensions`
2.  Enable **Developer mode**
3.  Click **Load unpacked**
4.  Select the project folder

---

## 🖥️ Options Page

Access from the popup or directly via:
`chrome-extension://<your-extension-id>/view/options.html`

You can configure:
*   **BitTorrent Client & Credentials**
*   **Connection Testing** (Verify before you save)
*   **Import / Export Settings**
*   **Context Menu Preferences**
*   **Retry Logic** (Auto-retry failed transfers)
*   **Directories & Labels**

---

## 📸 UI Preview

| 📎 **Context Menu** | 🔔 **Notifications** |
| :---: | :---: |
| ![Menu](screenshots/context-menu.png) | ![Notify](screenshots/notification.png) |

---

## 🧩 Project Structure

```text
📁 icon/         → Logos and browser icons
📁 lib/          → API modules for each supported client
📁 _locales/     → Translations (i18n)
📁 view/         → Options page (HTML/CSS/JS)
📄 manifest.json → Chrome metadata and permissions
📄 background.js → Context menu and dispatcher logic
📄 content.js    → Magnet and torrent link detection
📄 base64.js     → Base64 upload helper
📄 bump-version.ps1 → Automation script
```

---

## 🛠️ Planned Features

See [`ThingsToDo.md`](./ThingsToDo.md):
*   🧊 Draggable settings gear
*   🎨 Dark mode / theme support
*   🔍 Link preview and tracker validation
*   🤝 Chrome profile sync

---

## 👤 Maintainer

**Michael Harrell** (aka [Eliminater74](https://github.com/Eliminater74))
🇺🇸 Florida, USA
Part of the Purefusion Tools family

---

## 📜 License

MIT License
© 2025 [Eliminater74](https://github.com/Eliminater74)
