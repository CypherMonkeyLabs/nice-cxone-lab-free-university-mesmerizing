# Guide chat (offline)

The Contact Path guide answers from this lab's own index. There is no cloud model, no API key, and no request off the site. The panel is the existing Guide mascot. The older dice-coefficient form stays in the page and is hidden after the index loads, so a missing index does not leave a blank panel. `askGuide` in `campus/js/guide.mjs` is unchanged because `scripts/verify.mjs` still checks it.

## Files

| File | Role |
| --- | --- |
| `engine.js` | Tokenise, stem, synonyms, typo fix, BM25, confidence gate, seed matching, and intent rules. No DOM. |
| `ui.js` | Message list, suggestion chips, Mic, Send, Clear. |
| `chat.css` | Panel layout. It maps this lab's `--cc-*` tokens onto `--ink`, `--bg`, `--accent`, and `--line`. |

The index is `campus/data/cxbot-index.json`, built with:

```
node pipeline/build_cxbot_index.mjs
```

Check retrieval with:

```
node tests/cxbot-eval.mjs
node tests/cxbot-heldout.mjs
```

## Wiring

`campus/js/guide.mjs` fetches `../data/cxbot-index.json`, puts `chatMarkup()` in the Guide panel, and calls `retriever.ask`. A lesson link is shown only when `href` is set. A fallback has no `href`. Out-of-domain fallbacks do not list closest lessons.

The service worker precaches `engine.js`, `ui.js`, `chat.css`, and the index. `scripts/build_precache.mjs` rewrites the cache name in `campus/sw.js`.

## What the engine decides before it searches

Injection is checked on the raw string, before retrieval and before memory. The reply is a fallback with intent `injection` and no link.

Pay and hiring questions (`salary`, `paycheck`, `wage`, `get hired`, `land a job`, `job guarantee`) are a fixed refusal with no link. This lab does not discuss pay.

A question needs a CXone term before search. The term list is this lab's vocabulary plus index terms that are not ordinary English. Python words are not in that list. One ordinary word such as `team` or `change` does not carry a question that is otherwise outside the lab. With no in-domain term, the fallback does not attach closest-page links.

Small talk (`hi`, `thanks`, `bye`, `who are you`) is a fixed reply with no lesson link. "What can you help with" lists the lab topics and does not search.

Typos: a word that is not in the index vocabulary is corrected when one candidate wins, unless that word is on the ordinary-English list (so `light` is not rewritten toward `lightning`). Distance is 1 under 7 characters and 2 from 7 up.

## When a hit is shown

BM25 (k1 1.2, b 0.75) ranks docs. A hit is shown only when the top score is at least 2.4, the matched known terms cover at least two thirds of the known query terms, and the margin over the next different page is at least 1.2 (or the score ratio is at least 1.22). Those floors are the Python Lab floors. They were not lowered.

Excerpts come from the index fields `ex` and `eg`. The engine does not write a new product fact. If a lesson is marked uncertain, the excerpt starts with "Unconfirmed on this page." A source month is appended when the lab recorded one.

## Licence

These files are MIT lab code, copied from the Python Lab chat and adapted for Contact Path. Do not add a third-party search library.
