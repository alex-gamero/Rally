# 🏐 Rally — Volleyball Score

An ad-free volleyball scoreboard that installs on your phone like a real app (PWA).
It works offline and keeps your screen awake, and it never shows an ad when you reset the score.

## Features
- **Tap** a side for +1, **swipe down** on a side for −1
- Sets to 11 / 15 / 21 / 25, win by 2, single set or best of 3 / 5
- **SET POINT / MATCH POINT** badges
- Serve indicator follows the rally. Tap the circle to set who serves first.
- Auto side switch after each set, plus a "SWITCH SIDES" alert at 8 in the deciding set
- Unlimited **undo**, set history, editable team names and colors
- Score survives closing the app (saved on the device)
- Vibration feedback and screen wake lock
- Works fully offline after the first load

## Tech
Plain HTML, CSS and JavaScript. No build step and no dependencies.
- `index.html` is the markup
- `styles.css` is the look
- `app.js` holds the scoring logic and UI
- `manifest.webmanifest` makes it installable
- `sw.js` is the service worker for offline caching

## Run locally
```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy (GitHub Pages)
1. Push this repo to GitHub.
2. Go to **Settings → Pages → Build and deployment**.
3. Set **Source: Deploy from a branch**, **Branch: `main` / `(root)`**, then **Save**.
4. About a minute later it's live at `https://<your-username>.github.io/volley-score/`.

## Install on Android
Open the URL in **Chrome** and tap **⋮ → Add to Home screen → Install**.

## Updating
Push your changes, then bump `CACHE` in `sw.js` (`rally-v1` → `rally-v2`) so phones fetch the new version.

---
Fonts: Anton and Bebas Neue (SIL Open Font License, see `fonts/`).
