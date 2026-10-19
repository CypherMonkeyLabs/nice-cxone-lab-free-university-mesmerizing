#!/usr/bin/env python3
"""Report off-origin loads under the campus app and the root page.

Anchor links to vendor docs are not loads. Exit 1 if any script, stylesheet,
image, font, import, or fetch points at another origin.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CAMPUS = ROOT / "campus"
fail = []
load_patterns = [
    (r'<(?:script|img|iframe|source|video|audio)[^>]+\bsrc="(https?://[^"]+)"', "html src"),
    (r'<link(?![^>]*\brel="(?:canonical|alternate)")[^>]+href="(https?://[^"]+)"', "html link"),
    (r'url\(\s*["\']?(https?://[^)"\']+)', "css url()"),
    (r'@import\s+["\'](https?://[^"\']+)', "css @import"),
    (r'\bimport\s*(?:\(|[^;]*from\s*)["\'](https?://[^"\']+)', "js import"),
    (r'\bfetch\(\s*["\'`](https?://[^"\'`]+)', "js fetch"),
    (r'new (?:Worker|WebSocket|EventSource)\(\s*["\'`](https?://[^"\'`]+)', "js net"),
]
files = [ROOT / "index.html"]
for path in CAMPUS.rglob("*"):
    if path.suffix.lower() in {".html", ".css", ".js", ".mjs"} and path.is_file():
        files.append(path)
for path in files:
    text = path.read_text(errors="replace")
    for pattern, kind in load_patterns:
        for match in re.finditer(pattern, text):
            fail.append(f"{path.relative_to(ROOT)}: off-origin {kind}: {match.group(1)}")
for item in fail:
    print("FAIL", item)
print("csp_check:", len(fail), "off-origin loads")
sys.exit(1 if fail else 0)
