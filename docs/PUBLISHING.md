# Publishing this lab

The site is static. From the repository root:

```bash
python3 -m http.server 41773
```

Open `http://127.0.0.1:41773/campus/`. The root `index.html` redirects to `campus/` with a relative path. GitHub Pages can publish the repository root. Routes are hash URLs, so no rewrite rules are required.

`node scripts/gzip-static.mjs` writes `.gz` copies of the shell files. `node scripts/serve-gzip.mjs` serves those copies with `Content-Encoding: gzip` for a Lighthouse pass. The plain Python server does not gzip.

## Built: progressive web app

- `campus/manifest.webmanifest` names the lab, sets `start_url` and `display: standalone`, and points at the icons.
- `campus/sw.js` caches same-origin files. The cache name is `cxone-lab-v7`.
- `campus/index.html` links the manifest. The app registers the worker when the page is served over http or https.

This pass did not submit the site to a store.

## Prepared, not built: Chrome extension

Not done. A Manifest V3 extension would still need:

1. A separate `manifest.json` with `manifest_version: 3`, a name, and an action popup or a new-tab override.
2. The static files packaged inside the extension, or a pointer at the installed PWA origin. This service worker’s scope does not cover an extension page by itself.
3. Icons at 16, 32, 48, and 128. The PWA icons are not a substitute until they are copied into those sizes.
4. A privacy disclosure: preferences stay in localStorage. The extension must not add a new network call.
5. An unpacked load in `chrome://extensions`, then a click through Menu, a room, and the guide, before any store submission.

## Prepared, not built: iOS and Android (Capacitor)

Not done. The wrapper would be a native shell around `campus/`.

1. Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, and `@capacitor/android` in a copy of this repo, then `npx cap init`. A possible app id is `com.cyphermonkeylabs.cxonelab`. That id is a suggestion, not a registered bundle.
2. Set `webDir` to `campus`, which contains `index.html`, `sw.js`, and `manifest.webmanifest`.
3. `npx cap add ios`, `npx cap add android`, then `npx cap copy`.
4. iOS needs an Apple Developer team and a decision about service workers inside `WKWebView`. Android needs a signing key.
5. Confirm speech synthesis and speech recognition on a device. The page already falls back to typing when recognition is missing.
6. This repository does not contain `ios/`, `android/`, or a Capacitor config.

## Built: embed widget

`embed/widget.js` is a small script. The host page sets `data-base` to the lab root. `embed/demo.html` loads it. The card links to the lab, the CypherMonkey Labs website, the GitHub organization, and Linktree. It does not load a tracker. An npm package is not published.
