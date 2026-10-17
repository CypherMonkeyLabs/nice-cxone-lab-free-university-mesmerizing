import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { diagramSvg } from "../campus/js/diagrams.mjs";
import { downloadDocument } from "./download-chrome.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const atlas = JSON.parse(readFileSync(join(root, "campus", "data", "atlas.json"), "utf8"));
const out = join(root, "campus", "downloads", "diagrams");
mkdirSync(out, { recursive: true });

const hidden = new Set([
  "https://help.nicecxone.com/content/releasenotes/20262release.htm",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.3",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.5",
]);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function sourceLine(cite) {
  if (!cite || cite.confirm || !cite.url || hidden.has(cite.url)) {
    return `${esc(cite?.title || "Source")} — confirm`;
  }
  return `<a href="${esc(cite.url)}">${esc(cite.title)}</a> <span>last checked 2026-10</span>`;
}

const disclaimer = "Independent, free, learning-only study material. It respects every vendor. Trademarks belong to their owners. There is no affiliation and no endorsement. Ask for a removal or a correction at https://cyphermonkeylabs.com/#contact. Nothing here is sold. The author is happy to volunteer.";

const paint = `<style>:root,svg{--cc-accent-1:#22d3ee;--cc-accent-2:#f472b6;--cc-accent-3:#a3e635;--cc-accent-4:#fbbf24;--cc-surface:#fff7ed;--cc-ink:#102028;--cc-muted:#3c5360}</style>`;

for (const spec of atlas.diagrams) {
  const svg = diagramSvg(spec, true).replace(/<svg\b([^>]*)>/, `<svg$1>${paint}`);
  writeFileSync(join(out, `${spec.id}.svg`), svg);
  const html = downloadDocument({
    title: spec.title,
    depth: 2,
    current: "diagrams",
    extraCss: "body{font:15px/1.4 Georgia,serif;color:#102028}#sheet-main svg{width:100%;height:auto;display:block}footer{font:12px sans-serif}",
    bodyHtml: `<h1>${esc(spec.title)}</h1>
  <aside class="sheet-lead">${disclaimer}</aside>
  <div class="sheet-body"><p>${esc(spec.caption)}</p>
  ${svg}</div>
  <h2>Sources and go deeper</h2>
  <p>${sourceLine(spec.cite)}</p>
  <p><a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> · <a href="https://github.com/CypherMonkeyLabs">GitHub</a> · <a href="https://linktr.ee/cyphermonkey">Linktree</a> · <a href="https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing">Repo</a></p>
  <footer>© 2026 CypherMonkeyLabs 🐒 · MIT code, CC BY-NC-SA content.</footer>`,
  });
  writeFileSync(join(out, `${spec.id}.html`), html);
}
console.log("diagram pages", atlas.diagrams.length);
