# Privacy Policy – Purefusion TorrentBridge

**Effective Date:** April 8, 2026

**Purefusion TorrentBridge** (the "Extension") is committed to protecting your privacy. This policy explains how we handle your data and why we require specific permissions.

> [!IMPORTANT]
> **Summary:** We do not collect, monitor, sell, or share your browsing history or personal data. All data processing occurs locally on your device.

## 1. Personal and Sensitive User Data

To function, the Extension allows you to input the following "Sensitive Data":

- **Server Connection Details**: IP Address/Domain and Port of your BitTorrent client.
- **Authentication Credentials**: Username and Password for your client's Web UI.

**How we handle this data:**

- **Storage**: Stored locally on your computer using the `chrome.storage.local` API.
- **Transmission**: Used exclusively to authenticate API requests sent *directly* from your browser to your configured server.
- **Security**: This data is never transmitted to the Extension developer or any third-party analytics/tracking services.

## 2. Browser Permissions and Usage

| Permission | Usage Description & Privacy Impact |
| :--- | :--- |
| `contextMenus` | Allows you to right-click links to send them to your client. No data is read until you interact with the menu. |
| `notifications` | Used to show success/failure toasts. No personal data is included. |
| `storage` | Required to save your server settings locally. |
| `host_permissions` | Required to allow the Extension to communicate with your specific server URL. |
| `all_urls` (Content Script) | Scans pages for `magnet:` and `.torrent` links to inject buttons. No history is recorded. |

## 3. Data Sharing and Disclosure

We **NEVER** share, sell, or disclose your data to third parties. There are no tracking scripts, ads, or analytics integrated into this Extension.

## 4. Data Retention and Deletion

Your settings are retained locally as long as the Extension is installed. You can delete all processed data at any time by:

1. Using the "Reset to Defaults" button in the Extension Options.
2. Uninstalling the Extension.

## 5. Changes to this Policy

We may update this policy occasionally. Significant changes will be announced in the Extension's "What's New" log or on the GitHub repository.

## 6. Contact

Since this is an open-source project, you can verify our data handling logic by reviewing the source code at:

[github.com/Eliminater74/Purefusion-TorrentBridge](https://github.com/Eliminater74/Purefusion-TorrentBridge)
