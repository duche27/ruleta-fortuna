# Ruleta Fortuna

Pasapalabra game for bachelor/bachelorette parties. One codebase for **web**, **iOS**, and **Android**.

## Architecture

```
src/
  domain/           # Pure game rules (no UI, no I/O)
  infrastructure/   # Assets, audio, platform APIs (Capacitor)
  components/       # React UI
  profiles/         # Game profiles (JSON)
public assets/      # Images & audio (drop files in folders)
```

| Platform | Technology |
|----------|------------|
| Web | Vite + React → GitHub Pages |
| iOS / Android | Capacitor (native shell around the web app) |

## Development

```bash
npm install
npm run dev          # http://localhost:5173
npm run dev          # ?profile=albino | arribas | test
npm test             # unit + e2e
```

## Web deploy

Push to `main` → GitHub Actions builds `dist/` and deploys to Pages.

## Native apps (iOS / Android)

**Prerequisites:** Xcode (iOS), Android Studio (Android)

```bash
npm install
npm run build        # web build + asset manifests
npx cap add ios      # first time only
npx cap add android  # first time only
npm run cap:sync     # copy web build into native projects
npm run cap:ios      # open Xcode
npm run cap:android  # open Android Studio
```

Build and submit from Xcode / Android Studio to App Store / Play Store.

## Adding content

Same as before — drop files in the right folder, commit, push:

- Images: `assets/images/<profile>/{random,background,wrong_answer}/`
- Audio: `assets/audio/<profile>/{correct,incorrect,pass}/`
- Intro (shared): `assets/audio/shared/intro/`
- Questions: `questions_and_answers/<profile>.json`
- New profile: add `src/profiles/<name>.json` and register in `src/profiles/index.js`

Manifests are generated automatically on `npm run build`.
