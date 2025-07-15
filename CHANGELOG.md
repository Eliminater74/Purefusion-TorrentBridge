Sure — based on everything we just went through (including renaming, API rewrites, cleanup, and full compatibility review), here’s your updated changelog:

---

# Changelog

## 1.0.2 – July 2025

* ✅ **Renamed all API modules** to follow consistent lowercase naming (`qbittorrent.js`, `deluge.js`, etc.)
* 🧠 **Refactored all API client files** for modern ES6+ practices and Manifest V3 compatibility
* 🔐 **Improved session handling** across all clients (cookies, tokens, headers)
* ⚙️ **Fixed inconsistent endpoint paths** for multi-version clients (qBittorrent v1/v2, Transmission, etc.)
* 🚀 **Ensured base64 torrent upload support** using `base64.js`
* 🧪 Verified cross-client support for: qBittorrent, Deluge, Flood, Transmission, Tixati, ruTorrent, uTorrent, Vuze WebUI, and CloudTorrent

## 1.0.1 – July 2025

* Extension renamed to **Purefusion TorrentBridge**
* New icon and branding
* Added dynamic host permission request system
* UI cleanup and notification improvements

## 1.0.0 – Original Fork

* Base functionality cloned from **Torrent Clipper**

