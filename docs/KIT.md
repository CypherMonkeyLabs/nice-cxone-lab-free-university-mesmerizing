# Signature kit for this CXone lab

The chrome lives in the campus folder, not a separate multi-page site. Copy the files below into another hash-routed lab and point them at that lab’s own notes.

## What the signature is

- One sticky top bar: Menu on the left, the brand, then one scrollable row of chips. The row does not wrap onto a second line.
- A left drawer with a large row per room: icon, label, one-line description. Escape, Close, or a tap outside closes it.
- On a phone, a bottom bar: Menu, Learn, Diagrams, Play, Listen, Guide.
- The bot on the right edge. After the first tour it greets once in the middle, then docks right. Drag it along that edge. The position is stored in this browser.
- Footer: a boxed disclaimer, the line “CypherMonkey Labs”, then a glowing row with only the glasses monkey (website), the GitHub organization, and the drawn Linktree mark. Copyright follows that row.
- Voice stays off until Listen or Voice input. Read-along highlights the sentence being spoken. Ambient sound stays off until the visitor picks Soft.
- Course path: Home, then a track, then a room with a five-minute takeaway, a picture, a worked example, and a quiz.
- First open: tour steps 1–6 (Home, Menu, Learn, Diagrams, Play and Listen, Downloads and the bot), with Next, Back, and Skip. Help can open the tour again.

## Brand links

Only these three belong in the chrome row:

- https://cyphermonkeylabs.com
- https://github.com/CypherMonkeyLabs
- https://linktr.ee/cyphermonkey

Contact is https://cyphermonkeylabs.com/#contact. There is no email address and no mailto link.

View repo is a separate button to this repository. The sibling strip uses `https://cipher0x9.github.io/<repo>/`. A direct open of those hosts on 2026-10-16 returned 404. The footer says confirm. Do not describe them as live.

## Files to copy

| File | Role |
| --- | --- |
| `campus/assets/kit.css` | Vivid theme, top bar, drawer, disclaimer, brand row, tour card, phone bar, mascot |
| `campus/js/tour.mjs` | Six-step tour |
| `campus/js/kit.mjs` | Dock, greet, idle offer, read-along, section export, mic fallback |
| `campus/js/guide.mjs` | Answers only from the loaded pages, plus the cloud hook |
| `campus/js/sources.mjs` | Opened links, or confirm with no URL |
| `campus/sw.js` | Same-origin cache. Bump the cache name when the shell changes |

## Storage keys

- `canon-tour-done`: `1` finished, `skip` skipped
- `cg-greet-done`: greeting already played
- `cg-poke-count`: idle offers so far, maximum 3
- `cg-poke-off`: `1` means stop offering
- `cg-dock-top`: dock position
- `cxone-lab-settings`: theme, font size, font colour, rate, pitch, voice, ambient

## Sources and go deeper

`campus/js/sources.mjs` renders the visible list. `tools/extend-round.mjs` writes `campus/data/sources/<id>.json`. A row is either `status: opened` with a URL and `checked: 2026-10`, or `status: confirm` with no URL. The room, the lesson, the track, and the cheat sheet render that list. `scripts/verify.mjs` fails if a confirm row still has a URL, or if a failed open (the 26.2 notes URL and the two NCAP badge URLs that returned 404 on 2026-10-16) is stored.

## Honest limits

This kit does not include a Chrome extension or a Capacitor project. Those are prepared, not built. See `docs/PUBLISHING.md`. The embed script in `embed/` is built. The 3D Linktree mark is drawn in the page. It is not a file from Linktree.
