/* Rewrite the SHELL list in campus/sw.js from files that exist, under 3.5 MB.
   Usage: node scripts/build_precache.mjs */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "campus");
const budget = 3_500_000;
const required = [
  "index.html",
  "offline.html",
  "manifest.webmanifest",
  "favicon.svg",
  "favicon.ico",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "assets/app.css",
  "assets/university.css",
  "assets/wow.css",
  "assets/phone.css",
  "assets/kit.css",
  "assets/dragbot.css",
  "shared/cxbot-chat/engine.js",
  "shared/cxbot-chat/ui.js",
  "shared/cxbot-chat/chat.css",
  "data/cxbot-index.json",
  "data/manifest.json",
  "data/atlas.json",
  "data/guide-kb.json",
  "js/app.js",
  "js/guide.mjs",
  "js/sources.mjs",
  "js/callflow.mjs",
  "js/model.mjs",
  "js/dragbot.mjs",
  "js/tour.mjs",
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

const extra = [];
for (const file of walk(join(root, "js"))) {
  extra.push(file.slice(root.length + 1).split("\\").join("/"));
}
for (const file of walk(join(root, "data", "tracks"))) {
  extra.push(file.slice(root.length + 1).split("\\").join("/"));
}
for (const name of ["glossary.json", "boss.json", "interview.json"]) extra.push(`data/${name}`);

const chosen = [];
let total = 0;
function consider(rel) {
  if (chosen.includes(rel)) return;
  const path = join(root, rel);
  try {
    const size = statSync(path).size;
    if (total + size > budget) {
      console.log(`skip ${rel} (${size}) over budget`);
      return;
    }
    chosen.push(rel);
    total += size;
  } catch (error) {
    console.log(`missing ${rel}`);
  }
}
for (const rel of required) consider(rel);
for (const rel of extra.sort()) consider(rel);

const body = chosen.map((rel) => `  "./${rel}",`).join("\n");
const swPath = join(root, "sw.js");
let sw = readFileSync(swPath, "utf8");
sw = sw.replace(/const CACHE = "[^"]+";/, 'const CACHE = "cxone-lab-v14";');
sw = sw.replace(/const SHELL = \[[\s\S]*?\];/, `const SHELL = [\n  "./",\n${body}\n];`);
if (!sw.includes("./offline.html")) throw new Error("offline fallback missing from shell");
writeFileSync(swPath, sw);
console.log(`precache ${chosen.length + 1} files, ${total} bytes, budget ${budget}`);
