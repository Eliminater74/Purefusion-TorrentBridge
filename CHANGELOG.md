# 📄 Changelog

---

## [1.0.6] – Policy-Safe Listing & Retry Option  

**Release Date:** November 2025  

## \[1.0.5] – August 2025

### 🚀 Added Retry on Failure Option

* ✅ New global setting: **"Retry Failed Transfers (3 attempts)"**
* 🔁 Allows automatic retries for failed torrent uploads
* 🧩 Toggle added to **Options** page
* 🧠 BaseClient logic updated to respect retry toggle
* 🎨 Minor UI/label polish for better clarity

---

## \[1.0.4] – August 2025

### 🌍 Multi-Language Support

* 🈳 **Localized interface strings** using the `locales/` folder
* 🌐 Default fallback to English for unsupported locales
* 📦 Languages added:

  * 🇺🇸 English (en)
  * 🇪🇸 Spanish (es)
  * 🇫🇷 French (fr)
  * 🇩🇪 German (de)
  * 🇷🇺 Russian (ru)
  * 🇧🇷 Portuguese (pt\_BR)
  * 🇫🇮 Finnish (fi)
  * 🇯🇵 Japanese (ja)

---

## \[1.0.3] – July 2025

### 🎨 UI + Dev Improvements

* 🖼️ Redesigned **Options page** with custom logo header and cleaner layout
* 💅 CSS polish for better spacing, alignment, and font clarity
* 🔏 GPG commit signing enabled via Git Bash `.bashrc` profile
* 🛠️ Fixed Git Bash integration in **VS Code** terminal
* 📂 Updated `terminal.integrated.profiles.windows` for profile-aware shell setup

---

## \[1.0.2] – July 2025

### 🔁 Refactors + Compatibility

* ✅ Renamed all API modules to lowercase (`qbittorrent.js`, `deluge.js`, etc.)
* 🧠 Refactored API clients for ES6+ and Manifest V3 compatibility
* 🔐 Improved session management (cookies, headers, tokens)
* ⚙️ Fixed broken or inconsistent endpoint paths across clients
* 🚀 Ensured support for base64-encoded torrent uploads
* 🧪 Verified full cross-client support:

  * qBittorrent
  * Deluge
  * Flood
  * Transmission
  * Tixati
  * ruTorrent
  * uTorrent
  * Vuze WebUI
  * CloudTorrent

---

## \[1.0.1] – July 2025

### 🆕 Rebrand & Setup Enhancements

* ✨ Extension renamed to **Purefusion TorrentBridge**
* 🎨 New icon + branding
* 🔧 Added **dynamic host permission** handling
* 🧹 UI cleanup and smarter notifications

---

## \[1.0.0] – Original Fork

### 🧬 Based on Torrent Clipper

* Initial fork from original **Torrent Clipper** codebase
* Retained core features with plan for modular refactor

---
