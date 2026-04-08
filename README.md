# 🔗 Purefusion TorrentBridge

![Logo](icon/icon_128.svg)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id.svg?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/purefusion-torrentbridge/your-extension-id)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Eliminater74/Purefusion-TorrentBridge.svg)](https://github.com/Eliminater74/Purefusion-TorrentBridge/stargazers)
[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Eliminater74.Purefusion-TorrentBridge)](https://github.com/Eliminater74/Purefusion-TorrentBridge)

**Purefusion TorrentBridge** is a blazing-fast, modular Chrome extension that lets you instantly send `.torrent` and magnet links to your favorite BitTorrent clients — directly from the right-click context menu or custom UI panel.

> Originally forked from **Torrent Clipper** and inspired by **Torrent Control**, this next-generation extension is fully refactored, rebranded, and re-energized for today’s web — and tomorrow’s.

---

## 🚀 Why Choose Purefusion?

As of 2025, many beloved torrent extensions stopped working due to Chrome’s Manifest V3 changes. While others were abandoned, **Purefusion TorrentBridge** was rebuilt from scratch to be fast, modern, and future-proof:

* ✅ **Manifest V3 Compliant** & Store Safe
* 🚀 **New Interactive Popup Dashboard**
* 🎨 **Premium Glassmorphism Redesign** with Dark Mode support
* 📊 **Full Transfer History** and smart error logs
* 🧩 **Minimal Permissions** — only requested when needed
* 🌐 **Global Language Support** (15+ Languages)
* 🔄 **Actively Maintained**

---

## 💡 Key Features

* 🎯 **Smart Link Hooks**: Styled inline buttons for any torrent or magnet link. Automatically detects private trackers.
* ⚡ **Batch Send Bar**: Floating action bar to send all torrents on a page at once.
* 📊 **Transfer Dashboard**: Full-page history with sortable tables, CSV export, and live connection status.
* 📋 **Keyboard Shortcuts**: `Ctrl+Shift+U` to auto-parse and send magnet links straight from your clipboard.
* 🌙 **Dark & Light Themes**: Auto-detects your OS preference or override it manually.
* 🖱️ **Context Menu Actions**: Right-click to "Send to Client", "Add Paused", or "Add with Label".
* 🍞 **Interactive Toasts**: Replaces generic alerts with modern, styled notifications.
* 💾 **Backup & Restore**: Export your configuration to JSON and restore it instantly on a new install.

---

## 🧠 Supported Clients

Purefusion supports almost every major BitTorrent client and Web UI natively out of the box! Connect directly to your existing home server or remote seedbox with ease.

> Want to add another client? Just drop a new module into `/lib/`.

---

## 🌍 Language Support

Purefusion TorrentBridge speaks your language:

* 🇺🇸 English (US/UK/AU)
* 🇪🇸 Spanish
* 🇫🇷 French
* 🇩🇪 German
* 🇷🇺 Russian
* 🇧🇷 Portuguese (Brazil)
* 🇮🇹 Italian **(NEW)**
* 🇨🇳 Simplified Chinese **(NEW)**
* 🇰🇷 Korean **(NEW)**
* 🇳🇱 Dutch **(NEW)**
* 🇹🇷 Turkish **(NEW)**
* 🇵🇱 Polish **(NEW)**
* 🇸🇪 Swedish **(NEW)**
* 🇫🇮 Finnish
* 🇯🇵 Japanese

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
* **BitTorrent Client & Credentials**
* **Connection Testing** (Verify before you save)
* **Import / Export Settings**
* **Context Menu Preferences**
* **Retry Logic** (Auto-retry failed transfers)
* **Directories & Labels**

---

## 📸 UI Preview

| 🎛️ **Popup Dashboard** | ⚙️ **Dark Mode Options** |
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
* 🤝 Chrome profile sync
* キュー Queue Management
* 🔍 Tracker Health Check
* 🦊 Firefox / Edge Support

---

## 👤 Maintainer

**Michael Harrell** (aka [Eliminater74](https://github.com/Eliminater74))
🇺🇸 Florida, USA
Part of the Purefusion Tools family

---

## 📜 License

MIT License
© 2025 [Eliminater74](https://github.com/Eliminater74)
