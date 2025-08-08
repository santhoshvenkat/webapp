## Orient — Alarm • Stopwatch • Timer • Weather

- Mobile-first, orientation-driven, one-page PWA
- Portrait (upright): Alarm Clock
- Landscape (primary): Stopwatch
- Portrait (upside down): Timer
- Landscape (secondary): Weather of the Day

Tech:
- Vanilla HTML/CSS/JS, PWA (manifest + service worker)
- Weather via Open-Meteo (no API key), Geolocation with IP fallback

### Local run

Open `index.html` using a local web server for proper PWA behavior.

```
python3 -m http.server 5173
# then visit http://localhost:5173/orient-app/
```

Or use any static server. On mobile devices, add to Home Screen for full-screen PWA.

### Deploy (GitHub Pages)

- Push the `orient-app` folder to your repo (e.g., at repo root)
- Enable Pages (source: `main` branch, `/` root)
- The app will be available at `https://<user>.github.io/<repo>/orient-app/`

If your repo serves the app from root, update `sw.js` APP_SHELL paths accordingly or move files to root.

### Security

- Strict CSP in `index.html` permitting only same-origin scripts/styles and the allowed weather/location domains
- No secrets or keys stored; APIs used are keyless
- Service worker caches app shell and uses network-first for external APIs

### Attribution

- Weather from Open-Meteo
- IP fallbacks: ipapi.co and BigDataCloud