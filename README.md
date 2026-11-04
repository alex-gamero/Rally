<div align="center">

<img src="icons/icon-192.png" width="96" alt="Rally icon" />

# Rally

**Ad-free volleyball scoreboard you can install on your phone.**
Tap to score, read it from across the court, and reset to 0–0 without sitting through an ad.

**Live Site:** [https://alex-gamero.github.io/Rally/](https://alex-gamero.github.io/Rally/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

![Demo of Rally](assetsREADME/demo.gif)

</div>

---

## Screenshots
| Match point in the deciding set | Match won |
|:---:|:---:|
| <img src="assetsREADME/scoreboard.png" width="420" alt="Scoreboard at match point" /> | <img src="assetsREADME/match-won.png" width="420" alt="Match won card" /> |

---

## How it works
| Action | Gesture |
|---|---|
| Add a point | **Tap** a team's side |
| Remove a point | **Swipe down** on a team's side |
| Set who serves | Tap the **circle** next to the team name |
| Undo / Swap / Reset / Setup | Buttons in the center column |

When a set ends, a card shows the winner and the score. Tap **Next set** to keep going, or **Undo point** if it was a mistake.

---

## Install it on your phone (Android)
1. Open **[alex-gamero.github.io/Rally](https://alex-gamero.github.io/Rally/)** in **Chrome**.
2. Tap **⋮ → Add to Home screen → Install**.
3. Open it from your home screen. It runs fullscreen and sideways, like a native app.

You don't need the Play Store. The app updates itself the next time you open it with internet on.

---

## 🛠️ Tech Stack
- **HTML5, CSS3 & vanilla JavaScript.** No frameworks, no build step, no dependencies.
- **Progressive Web App:** a Web App Manifest and a Service Worker for installing and running offline
- **Web APIs:** Screen Wake Lock, Vibration, Screen Orientation Lock, `localStorage`
- **CSS container queries,** which size the score to fill each panel on any screen
- **Self-hosted fonts:** Anton & Bebas Neue (SIL OFL)
- **Hosting:** GitHub Pages

### Project structure
```
Rally/
├── index.html            # Markup
├── styles.css            # Layout & visual design
├── app.js                # Scoring rules, state, undo history, UI
├── sw.js                 # Service worker (offline cache)
├── manifest.webmanifest  # Install metadata (icon, landscape, fullscreen)
├── icons/                # App icons (incl. maskable)
└── fonts/                # Self-hosted fonts
```

### Run locally
```bash
git clone https://github.com/alex-gamero/Rally.git
cd Rally
python -m http.server 8000
# open http://localhost:8000
```

---

## Coming Soon
- Match history and stats (points per set, longest run)
- Rotation tracker for the serving order
- Timeouts with a countdown
- Voice announcements of the score

---

## Contributing
Got an idea or found a bug? Open an **issue** or submit a **pull request**!
