# 📄 Changelog

---

## [2.3.0] – Site Cleaners

**Release Date:** November 2026

### 🚀 Major Features

* 🧹 **Site Cleaners** — Popup, overlay, and ad-frame cleanup now lives in the extension. YTS mirrors (`yts.mx`, `yts.rs`, `yts.pm`, `yts.lt`, `yts.ag`, `yifytorrent`) are the first profile.
* 🎛️ **On-page switch** — Matched sites show a top-right button that pauses cleanup for that site. The same choice is in the options page, under a master switch.
* 🧩 **Add another site in one file** — Append a profile to `cleaners/registry.js`. The engine, popup blocker, and options list pick it up after a reload.

### 🛠️ Behavior

* Magnet links, `.torrent` links, and download blocks are kept. Broad "ads" selectors are not applied to anything whose id or class contains `download`.
* `window.open` is blocked only on a registered site, and only while that cleaner is on.
* Clicks on links, buttons, and form fields still go through. Clicks on empty page space do not trigger the site's hijack handler.
* Settings export and import include the cleaner switches.

---

## [2.2.0] – Stability & Hardening

**Release Date:** July 2026

### 🐛 Bug Fixes

* 🔁 **Smart Retry Logic** — `fetchWithRetry` no longer retries 4xx errors (401 auth, 400 bad request). Only network errors and 5xx server errors are retried, saving time and server load.
* 🔄 **Transmission Recursion Guard** — `logIn()` now caps 409 session-ID retries at 3 attempts, preventing infinite loops against misconfigured Transmission servers.
* 🔀 **Transmission Duplicate Detection** — Adding a torrent that already exists now returns a clear "Torrent already exists" message instead of a generic failure.
* 🛠️ **qBittorrent 409 Handling** — `409 Conflict` (duplicate torrent) is now caught specifically and surfaced as a friendly user notification.
* 🧩 **Whitelist Hoisting Fix** — `isTorrentUrl` in `util.js` previously referenced an array before its declaration. Patterns are now defined first and expanded to match all 16 tracker patterns.
* 🗑️ **Deprecated API Removal** — Replaced deprecated `unescape(encodeURI())` in torrent name parser with modern `TextEncoder`.
* 💀 **Dead Code Cleanup** — Removed unused `DragEvent` constructor in popup file picker that was never dispatched.
* 📡 **Content Script Error Handling** — `sendMessage` now checks `chrome.runtime.lastError` so users see "Extension connection lost" instead of silent failures.
* 📥 **Magnet Send Error Handling** — Popup magnet send button now shows error messages on failure instead of always displaying success.
* 💾 **Import Settings Promise Fix** — Settings import in options page now uses `await` for reliable save completion.

### ⚡ Enhancements

* ⏱️ **Request Timeout** — All API requests now have a 15-second `AbortController` timeout, preventing indefinite hangs on unresponsive servers.
* 📊 **Better Error Categorization** — Added detection for:
  - `409 Conflict` / duplicate torrents → "Torrent already exists on the server"
  - `5xx` server errors → "Server error — the torrent client may be down"
  - Transmission `torrent-duplicate` results
* 📡 **RSS Feed Error Messages** — RSS feed failures now go through error categorization for consistent, clear notifications.
* 🔍 **Flexible Content-Type** — Torrent download now accepts `multipart/form-data` responses from trackers that use non-standard content types.
* 🌍 **New Locale Strings** — Added `torrentDuplicateError` and `serverUnavailableError` i18n messages.
* 🔗 **Unified URL Patterns** — `util.js` and `content.js` now share the same 16 torrent URL detection patterns with cross-reference documentation.

---

## [2.1.0] – Power User Edition

**Release Date:** April 2026

### 🚀 Major Improvements

* 🎛️ **Popup Server Quick-Switch** — A dropdown in the popup lets you instantly switch which server you are sending torrents to without opening Options.
* 📂 **Drag & Drop .torrent Files** — Drop `.torrent` files directly onto the popup window to upload them to your client immediately, or click the drop zone to open a file browser.
* 🎨 **Smart Magnet Input** — Pasting a magnet link into the popup now automatically extracts and previews the torrent's expected name.
* 📋 **Copy Magnet Button** — Magnet links detected in the browser now get a secondary "copy" button next to the Quick Send button.
* 🏷️ **Labels in Context Menu** — Right-clicking a torrent link now has an "Add with Label" sub-menu if your currently selected server supports labels and you have configured them.

### 🛠️ Minor Tweaks

* 🚦 **Badge Error Colors** — The badge background now turns red if your last transfer of the day failed.
* 🔕 **Option Respect** — The content script now fully respects the "Catch torrent URLs" options toggle.
* 🔔 **Interactive Notifications** — Clicking on a success/fail notification toast now directly opens your full transfer history log.
* 🚪 **Auto-close Dash** — The popup dashboard auto-closes dynamically after successfully processing a magnet link or `.torrent` drag-and-drop.
* 🌐 **Expanded Site Whitelist** — The active link detection script now has full built-in support for popular trackers and several major torrent indexers.

---

## [2.0.0] – Premium Dashboard Edition

**Release Date:** April 2026

### 🚀 Major Features

* ✨ **Popup Dashboard** — Brand-new compact dashboard opens on icon click
  * Live connection status indicator (checking → connected → disconnected)
  * Quick-action buttons: Open Web UI, Paste Magnet, View History
  * Inline magnet URL input with send button
  * Recent 5 transfers displayed with status and time-ago
  * Today's transfer count badge on extension icon

* 🎨 **Premium UI Redesign** — Complete visual overhaul for Options page
  * Dark/Light theme with auto-detection from OS `prefers-color-scheme`
  * Glassmorphism card-based layout with smooth animations
  * Custom toggle switches replacing raw checkboxes
  * Segmented radio group for context menu mode
  * Inline connection status indicator (green/yellow/red dot with live feedback)
  * Toast notifications replacing all `alert()` dialogs
  * Password visibility toggle
  * "Reset to Defaults" button

* 📊 **Transfer History** — Full-page history log
  * Sortable table (Time, Name, Server, Status)
  * Filter by status (success/fail) and server
  * Stats dashboard: Total, Success, Failed, Today
  * Export history as CSV
  * Clear all history

* 🔍 **Smarter Content Script** — Enhanced torrent link detection
  * Expanded URL matching: Jackett, private trackers, and more patterns
  * Styled pill-shaped send buttons with hover glow effects
  * ⚡ "Batch Send All" floating bar when 3+ torrent links detected
  * Inline toast confirmations ("✓ Sent to client!")
  * Visual feedback: button transitions from 📥 → ✓ or ✗

* ⌨️ **Keyboard Shortcut** — `Ctrl+Shift+U` to add magnet from clipboard
* 🏷️ **Badge Count** — Extension icon shows today's successful transfers

### 🛠️ Improvements

* 🗂️ Better error categorization: Network, Auth, Timeout, Bad Request
* 🔄 Transfer history persisted in `chrome.storage.local` (last 50 entries)
* 🧹 Fixed duplicate `id="options-section"` in options HTML
* 📦 Version bump to 2.0.0 with Manifest V3 compliance
* 🔐 `clipboardRead` as optional permission (only requested when needed)

---

## [1.1.0] – Optimized & Enhanced

**Release Date:** January 2026

### 🚀 Added

* ✅ ES6+ modular architecture overhaul
* 🎨 Clean, responsive options UI
* 🔧 Connection testing from Options page
* 💾 Import/Export settings as JSON
* 🔁 Retry on failure (3 attempts) toggle
* 🌍 15+ language support added

---

## [1.0.6] – Policy-Safe Listing & Retry Option  

**Release Date:** November 2025  

## [1.0.5] – August 2025

### 🚀 Added Retry on Failure Option

* ✅ New global setting: **"Retry Failed Transfers (3 attempts)"**
* 🔁 Allows automatic retries for failed torrent uploads
* 🧩 Toggle added to **Options** page
* 🧠 BaseClient logic updated to respect retry toggle
* 🎨 Minor UI/label polish for better clarity

---

## [1.0.4] – August 2025

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

## [1.0.3] – July 2025

### 🎨 UI + Dev Improvements

* 🖼️ Redesigned **Options page** with custom logo header and cleaner layout
* 💅 CSS polish for better spacing, alignment, and font clarity
* 🔏 GPG commit signing enabled via Git Bash `.bashrc` profile
* 🛠️ Fixed Git Bash integration in **VS Code** terminal
* 📂 Updated `terminal.integrated.profiles.windows` for profile-aware shell setup

---

## [1.0.2] – July 2025

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

## [1.0.1] – July 2025

### 🆕 Rebrand & Setup Enhancements

* ✨ Extension renamed to **Purefusion TorrentBridge**
* 🎨 New icon + branding
* 🔧 Added **dynamic host permission** handling
* 🧹 UI cleanup and smarter notifications

---

## [1.0.0] – Original Fork

### 🧬 Based on Torrent Clipper

* Initial fork from original **Torrent Clipper** codebase
* Retained core features with plan for modular refactor

---
