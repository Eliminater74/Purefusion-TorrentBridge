# Chrome Web Store Submission Guide

Google is strict about permissions and data usage. Use the text below to fill out the "Privacy" and "Permissions" tabs in the Developer Dashboard to ensure a smooth review process.

## 📁 Privacy Tab

### **Single Purpose Description**

> This extension allows users to send magnet links and .torrent files from the browser directly to their configured BitTorrent client (e.g., qBittorrent, Deluge) via a right-click menu or one-click overlay buttons.

### **Permission Justification**

You will be asked to justify specific permissions. Copy/paste these exactly:

**1. Host Permissions (`http://*/*`, `https://*/*`)**

> **Justification**: This extension is a "bridge" that connects the browser to a user's self-hosted BitTorrent client. The client may be located on a local network IP (e.g., 192.168.1.x) or a remote domain. Since the extension cannot predict the user's specific server address, `optional_host_permissions` are used to allow the user to dynamically grant access to their specific server URL provided in the Options page.

**2. Content Scripts (`<all_urls>`)**

> **Justification**: The extension scans web pages for links ending in `.torrent` or starting with `magnet:` to inject a small "Download" icon next to them. This provides the core functionality of specific link detection across any website the user visits. The script is lightweight and only acts on these specific link types.

**3. Storage (`storage`)**

> **Justification**: Used to store the user's configuration settings locally, such as the server address, authentication credentials, and UI preferences.

**4. Context Menus (`contextMenus`)**

> **Justification**: Adds items to the right-click menu ("Add Torrent", "Add Paused") to allow users to send links to their client without navigating away from the current page.

**5. Notifications (`notifications`)**

> **Justification**: Provides immediate visual feedback (Success/Error toasts) when a torrent is successfully sent to the client or if the connection fails.

---

## 🔒 Data Usage Tab

**1. Does this extension collect user data?**

> **NO**. (Select "No, I do not collect any user data").

**2. Do you certify that this extension complies with the User Data Policy?**

> **YES**.

---

## 🖼️ Store Listing Tips

* **Screenshots**: Ensure you upload at least one screenshot showing the **Options Page** and one showing the **Context Menu** in action. Google validates that the screenshots match the functionality.
* **Icon**: Ensure the `icon_128.png` is crisp and readable.
* **Description**: Mention clearly that "This extension communicates ONLY with your configured server. No data is sent to the developer."

---

## 🛡️ Privacy & User Data Dashboard Guide

Google's review of "User Data Privacy" is now highly automated. Ensure these fields in your Developer Dashboard match the updated policy.

### **1. Privacy Policy URL**

> **URL**: `https://raw.githubusercontent.com/Eliminater74/Purefusion-TorrentBridge/master/privacy.html`
> *(Or your GitHub Pages URL if enabled)*

### **2. Single Purpose Description**

> This extension allows users to send magnet links and .torrent files from the browser directly to their self-hosted BitTorrent client (e.g., qBittorrent, Deluge) via a right-click menu or one-click overlay buttons.

### **3. Data Usage Section**

* **Does your extension use or collect personal or sensitive user data?**
  * Select: **YES** (This is crucial! Selecting "No" when you store IP/Passwords locally will cause a rejection).
* **Which types of data are you collecting?**
  * Select: **Authentication Information** (Username/Password for the torrent client).
  * Select: **Personal Communications** (URLs read by the link detection engine).
* **Justification for Authentication Information**:
  * `The extension must store the user's self-hosted server credentials (username/password) locally to authenticate API requests when sending torrents. This data is stored locally using chrome.storage.local and is never transmitted to the developer or third parties.`
* **Justification for Personal Communications (URLs)**:
  * `The extension read URLs on the page to identify magnet: and .torrent links to provide one-click download buttons. No browsing history is recorded, stored, or transmitted.`

---

## 🛡️ "Safe" Protocol Checklist

I have optimized the extension to meet these safety standards:

* ✅ **Content Security Policy (CSP)**: Compliant with Manifest V3 default strict policy.
* ✅ **Mixed Content**: Uses Background Service Worker fetch to safely communicate with local HTTP servers.
* ✅ **Input Validation**: Server addresses are validated before saving.
* ✅ **Remote Code**: NO remote code is executed. All logic is contained within the package.
