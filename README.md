# Ruleta Fortuna

Pasapalabra game for bachelor/bachelorette parties. One codebase for **web**, **iOS**, and **Android**.

## Architecture

```
src/
  domain/           # Pure game rules (no UI, no I/O)
  infrastructure/   # Assets, audio, platform APIs (Capacitor)
  components/       # React UI
  profiles/         # Game profiles (JSON)
assets/             # Images & audio (drop files in folders)
```

| Platform | Technology |
|----------|------------|
| Web | Vite + React → GitHub Pages |
| iOS / Android | Capacitor (native shell around the web app) |

## Setup

```bash
npm install
```

---

## Run commands

### `npm run dev` — local development (web)

Starts Vite dev server at **http://localhost:5173**.

- Use for everyday development; hot reload on code changes.
- Asset folders are scanned on the fly — drop/replace images or audio and **refresh the browser**.
- Pick a profile via URL: `?profile=albino`, `?profile=arribas`, or `?profile=test`.
- You never need to edit `manifest.json` locally.

### `npm run build` — production build (web)

Builds the app into `dist/` (used by GitHub Pages and Capacitor).

- Generates asset manifests and bundles the app.
- Run before `cap:sync` or to verify the production build locally.

### `npm run preview` — serve existing production build

Serves `dist/` at **http://localhost:4173**. Requires `npm run build` first.

### `npm run preview:prod` — build and preview in one step

Runs a full production build, then serves it. Use this to verify the app as it will run on GitHub Pages.

- Example: `http://localhost:4173/?profile=albino`

### `npm run manifests` — regenerate manifests only

Scans `assets/` and writes `manifest.json` into each subfolder.

- Rarely needed manually; `build` does this automatically.
- Ignore or delete `manifest.json` files — they are gitignored and not edited by hand.

### `npm test` — all tests

Runs unit tests (Vitest) and end-to-end tests (Playwright).

### `npm run test:unit` — unit tests only

Fast tests for game logic (`src/domain/`). No browser required.

### `npm run test:e2e` — browser tests only

Full game flow in Chromium (desktop + mobile emulation). Starts a preview server automatically.

### `npm run test:e2e:ui` — e2e with Playwright UI

Same as e2e but opens the interactive Playwright debugger.

### `npm run lint` — code quality

ESLint check on `src/`, `tests/`, and config files. Runs in CI on every PR.

### `npm run lint:fix` — auto-fix lint issues

Same as `lint`, applying safe fixes where possible.

### `npm run cap:sync` — sync web build to native projects

Builds the app (`CAPACITOR=true npm run build`) and copies `dist/` into `ios/` and `android/`.

- **Required after any code or asset change** before testing on iOS/Android.

### `npm run cap:ios` — open iOS project in Xcode

Runs `cap:sync`, then opens Xcode. Pick a simulator or device and press **Run** (▶).

- Requires **Xcode** (Mac only).
- First time: Xcode may ask you to select a Signing Team (free Apple ID works for device testing).

### `npm run cap:android` — open Android project in Android Studio

Runs `cap:sync`, then opens Android Studio. Pick an emulator or device and press **Run** (▶).

- Requires **Android Studio** and an AVD emulator or USB-connected phone with debugging enabled.

---

## Typical workflows

| Goal | Command |
|------|---------|
| Develop in browser | `npm run dev` → open `http://localhost:5173/?profile=arribas` |
| Verify production web build | `npm run preview:prod` |
| Test on iPhone simulator | `npm run cap:ios` → Run in Xcode |
| Test on Android emulator | `npm run cap:android` → Run in Android Studio |
| Run CI checks locally | `npm run lint` then `npm test` |
| Deploy to web | Push to `main` (GitHub Actions builds and deploys `dist/`) |

---

## Web deploy

Push to `main` → GitHub Actions runs lint + tests + build → deploys to GitHub Pages.

Live site: `https://duche27.github.io/ruleta-fortuna/?profile=arribas`

---

## Native apps

Native builds bundle assets at compile time. After changing images, audio, or code:

```bash
npm run cap:sync
npm run cap:ios      # or cap:android
```

Default profile on native is **arribas** (set in `src/profiles/index.js`). Change `DEFAULT_PROFILE` and re-sync to test another profile.

Submit to App Store / Play Store from Xcode / Android Studio when ready.

---

## Adding content

Drop files in the right folder, commit, push. No manifest editing.

| Content | Folder |
|---------|--------|
| Random photos | `assets/images/<profile>/random/` |
| Background | `assets/images/<profile>/background/` |
| Wrong-answer image | `assets/images/<profile>/wrong_answer/` |
| Correct sound | `assets/audio/<profile>/correct/` |
| Incorrect sound | `assets/audio/<profile>/incorrect/` |
| Pass sound | `assets/audio/<profile>/pass/` |
| Intro (shared) | `assets/audio/shared/intro/` |
| Questions | `questions_and_answers/<profile>.json` |
| New profile | `src/profiles/<name>.json` + register in `src/profiles/index.js` |

**One file per folder** for single-asset categories (background, wrong_answer, each audio type). If multiple files exist, the first alphabetically is used — delete old files when replacing.
