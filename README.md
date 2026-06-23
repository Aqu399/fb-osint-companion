# FB OSINT Companion 🕵️

Tampermonkey userscript for **authorized penetration testing** OSINT on Facebook.

## Features

| Tab | Function |
|-----|----------|
| 👤 Profile | Name, location, work, education, relationship, birthday, friends, followers, bio |
| 🔑 Keys | Auto-extracted phone, email, URL, US state, age, interest keywords |
| 🎯 Pivot | One-click OSINT searches: Google, LinkedIn, Pipl, Dehashed, HIBP, GitHub, Instagram, X, Phone, Email, Graph API |
| 🤝 Mutual | Mutual friends display + Highlight on page + Expand popup scraper |
| 👥 Group | Batch scan visible group members → auto export CSV |
| 📰 Posts | Extract visible timeline posts with timestamps and locations |
| 📸 Photos | Scan photo dates/locations from visible photos |
| 📞 Contacts | Detect WhatsApp, Phone, Website, Email from contact info section |
| 📅 Events | Extract event names, dates, locations |
| 🔗 Network | Common groups + Friend suggestions (PYMK) collection |
| ⚠️ Changes | Profile change tracking across sessions |

### Messenger Board (Ctrl+Shift+N)
- Manual note-taking with category tags
- Auto keyword detection from chat messages (phone, email, age, address, URL)
- 6 built-in social engineering templates (Warm Interest, Playful Direct, Mystery Soft, Cold Salvage, Defense scripts)

### Quick Actions
- **Avatar**: Download HD + reverse image search (Google, TinEye, Yandex)
- **FB UID**: 6-method extraction + Graph API endpoint
- **Mutual Friends**: Click to expand popup and scrape all names
- **Group Scanner**: Auto-scroll + collect + CSV export

### Keyboard Shortcuts
| Keys | Action |
|------|--------|
| Ctrl+Shift+P | Toggle Profile Panel |
| Ctrl+Shift+N | Toggle Messenger Notepad |

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Open [fb-osint-helper.user.js](fb-osint-helper.user.js)
3. Tampermonkey will prompt to install — click **Install**

Or manually: Tampermonkey Dashboard → Utilities → Import from file.

## Requirements

- A Facebook account (for profile/messenger features)
- **This tool is for authorized security testing only**

## Data Storage

All data is stored **locally** in Tampermonkey's storage (`GM_setValue`). Nothing is sent to any external server. Exports are manual (JSON/CSV).

## Notes

- FB DOM structure changes frequently; some selectors may break and need updating
- Mutual friend expansion requires clicking the link and waiting for the popup overlay
- Group scanning scrolls the page automatically; the page must be scrolled to load members
