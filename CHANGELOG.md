# Changelog

## 1.0.4 – August 2025

* 🌍 **Added multi-language support** – extension now supports:

  * 🇺🇸 English (US/GB/AU)
  * 🇪🇸 Spanish (es)
  * 🇫🇷 French (fr)
  * 🇩🇪 German (de)
  * 🇷🇺 Russian (ru)
  * 🇧🇷 Portuguese (pt\_BR)
  * 🇫🇮 Finnish (fi)
  * 🇯🇵 Japanese (ja)
* 🈳 **Localized interface strings** via `locales/` folder using `default_locale`
* 🧪 Verified fallback to English if user’s language is unsupported

---

## 1.0.3 – July 2025

* 🖼️ **Redesigned options page** with a cleaner layout, custom logo header, and copyright footer
* 💅 **Improved CSS styling** for settings panel – more spacing, better typography, and consistent field alignment
* 🛠️ **Fixed Git Bash integration issues** for consistent behavior across VS Code and terminal sessions
* 🔏 **Enabled GPG signed commits** via Git Bash with `.bashrc` profile sourced
* 📂 Added profile-aware `terminal.integrated.profiles.windows` and fixed VS Code `settings.json` key conflict

---

## 1.0.2 – July 2025

* ✅ **Renamed all API modules** to follow consistent lowercase naming (`qbittorrent.js`, `deluge.js`, etc.)
* 🧠 **Refactored all API client files** for modern ES6+ practices and Manifest V3 compatibility
* 🔐 **Improved session handling** across all clients (cookies, tokens, headers)
* ⚙️ **Fixed inconsistent endpoint paths** for multi-version clients (qBittorrent v1/v2, Transmission, etc.)
* 🚀 **Ensured base64 torrent upload support** using `base64.js`
* 🧪 Verified cross-client support for: qBittorrent, Deluge, Flood, Transmission, Tixati, ruTorrent, uTorrent, Vuze WebUI, and CloudTorrent

---

## 1.0.1 – July 2025

* 🆕 Extension renamed to **Purefusion TorrentBridge**
* 🎨 New icon and branding
* 🔧 Added dynamic host permission request system
* 🧹 UI cleanup and notification improvements

---

## 1.0.0 – Original Fork

* 🧬 Base functionality cloned from **Torrent Clipper**

