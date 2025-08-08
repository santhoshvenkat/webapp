# Prompt This Into Existence! – Submission Notes

## URL
- Live demo: (fill once deployed)

## Approach
- Designed a one-page PWA where device orientation drives feature routing.
- Minimal vanilla stack for reliability across iOS/Android browsers.
- Features mapped to orientation:
  - Portrait primary: Alarm
  - Landscape primary: Stopwatch
  - Portrait secondary: Timer
  - Landscape secondary: Weather
- Orientation detection via ScreenOrientation API + DeviceOrientation heuristics for secondary modes with permission.
- Weather from Open-Meteo (free, keyless) with Geolocation + IP fallback and reverse geocoding.
- Security via CSP and no secrets. Offline via service worker.

## AI Tools Used
- Cursor AI (you) for scaffolding UI, logic, and refactors
- Model-assisted iteration on CSS design and accessibility

## Prompting Techniques
- Role prompting ("You are a mobile UX engineer…")
- Constraint prompting (performance, PWA, offline-first, CSP)
- Iterative prompting with diff-based edits
- Failure-driven prompting (edge cases on orientation and iOS permissions)

### Prompts (including failed ones)
- Add your exact prompts here with outcomes.

## Screenshots
- Add screenshots of each orientation mode here.

## Future/WoW Ideas
- Haptic metronome mode
- Voice commands (Web Speech API)
- Cloud sync of alarms via OPFS + share target