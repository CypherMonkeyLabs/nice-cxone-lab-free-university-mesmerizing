import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { overallPriority } from "../campus/js/model.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const campus = join(root, "campus");
const failures = [];

function fail(message) {
  failures.push(message);
}

const manifest = JSON.parse(readFileSync(join(campus, "data", "manifest.json"), "utf8"));
const tracks = manifest.tracks;
if (tracks.length < 15) fail(`tracks ${tracks.length} < 15`);

let lessons = 0;
let quiz = 0;
let labs = 0;
let faults = 0;
let cards = 0;
let cites = 0;

for (const meta of tracks) {
  const track = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
  if (track.lessons.length !== meta.lessonIds.length) fail(`${meta.id} lessonIds mismatch`);
  for (const lesson of track.lessons) {
    lessons += 1;
    for (const key of ["figure", "flow", "quiz", "cards", "lab", "faults", "sections"]) {
      if (lesson[key] == null) fail(`${meta.id}/${lesson.id} missing ${key}`);
    }
    if (!lesson.figure || (lesson.figure.kind === "row" && !(lesson.figure.nodes || []).length)) {
      if (lesson.figure && lesson.figure.kind !== "rings") fail(`${meta.id}/${lesson.id} empty figure`);
    }
    if (!lesson.flow || lesson.flow.steps.length < 4) fail(`${meta.id}/${lesson.id} flow`);
    if (!lesson.quiz || lesson.quiz.length < 6) fail(`${meta.id}/${lesson.id} quiz`);
    if (!lesson.cards || lesson.cards.length < 4) fail(`${meta.id}/${lesson.id} cards`);
    if (!lesson.lab || lesson.lab.steps.length < 3) fail(`${meta.id}/${lesson.id} lab`);
    if (!lesson.faults || lesson.faults.length < 1) fail(`${meta.id}/${lesson.id} fault`);
    quiz += lesson.quiz.length;
    labs += 1;
    faults += lesson.faults.length;
    cards += lesson.cards.length;
    const bag = [];
    for (const section of lesson.sections || []) bag.push(...(section.cites || []));
    for (const item of lesson.quiz || []) bag.push(item.cite);
    for (const fault of lesson.faults || []) bag.push(fault.cite);
    for (const item of bag) {
      if (!item || !item.url || !/^https:\/\//.test(item.url)) fail(`${meta.id}/${lesson.id} bad cite`);
      else cites += 1;
    }
  }
}

if (lessons < 100) fail(`lessons ${lessons} < 100`);
if (quiz < 600) fail(`quiz ${quiz} < 600`);
if (labs < 20) fail(`labs ${labs} < 20`);
if (faults < 30) fail(`faults ${faults} < 30`);

const priority = overallPriority(4, 1, 3);
if (priority !== 7) fail(`priority example ${priority} !== 7`);

const html = readFileSync(join(campus, "index.html"), "utf8");
const h1 = html.match(/<h1[\s>]/g) || [];
if (h1.length !== 1) fail(`static h1 count ${h1.length}`);
if (!html.includes('href="#main"')) fail("skip link");
const css = readFileSync(join(campus, "assets", "app.css"), "utf8");
for (const token of ["--cc-bg", "--cc-surface", "--cc-accent-1", "--cc-accent-2", "--cc-accent-3", "--cc-accent-4"]) {
  if (!css.includes(token)) fail(`missing token ${token}`);
}
if (!css.includes("max-width: 640px")) fail("640px nav");
if (!css.includes("data-theme=\"contrast\"") && !css.includes('data-theme="contrast"')) fail("contrast theme");
if (!css.includes('data-theme="dusk"')) fail("dusk theme");
if (!css.includes('data-theme="light"')) fail("light theme");

const shellFiles = ["index.html", "assets/app.css", "js/app.js", "js/model.mjs"];
let shell = 0;
for (const file of shellFiles) shell += statSync(join(campus, file)).size;
if (shell > 500 * 1024) fail(`shell ${shell} bytes exceeds 500KB`);

const three = readFileSync(join(campus, "vendor", "three.min.js"), "utf8");
if (!three.includes("THREE")) fail("three build missing");
if (html.includes("unpkg") || html.includes("cdn.")) fail("CDN in html");
const app = readFileSync(join(campus, "js", "app.js"), "utf8");
if (app.includes("unpkg.com") || app.includes("cdn.jsdelivr")) fail("CDN in app");
if (!app.includes("vendor/three.min.js")) fail("three not local");

const sw = readFileSync(join(campus, "sw.js"), "utf8");
if (!sw.includes("caches")) fail("service worker");
if (!sw.includes("atlas.json")) fail("atlas not cached");
if (!html.includes("https://cyphermonkeylabs.com")) fail("labs link");
if (!html.includes("https://linktr.ee/cyphermonkey")) fail("linktree");
if (!html.includes("https://x.com/Cypher0x9")) fail("x link");
if (!html.includes("https://dev.to/cyphermonkey")) fail("dev link");
if (!html.includes("https://huggingface.co/Cypher0x9")) fail("hf link");
if (!html.includes("nice-cxone-lab-free-university-mesmerizing")) fail("repo link");
if (/linkedin/i.test(html)) fail("linkedin");
if (/mailto:|@[a-z0-9.-]+\.[a-z]{2,}/i.test(html)) fail("email");
if (!html.includes("CC BY-NC-SA")) fail("content license");
if (!html.includes("mascot-dock")) fail("mascot");
if (!html.includes("Webex Canon")) fail("next lab");
for (const theme of ["futuristic", "gaming", "neon", "light"]) {
  if (!html.includes(`value="${theme}"`)) fail(`theme ${theme}`);
}
const atlas = JSON.parse(readFileSync(join(campus, "data", "atlas.json"), "utf8"));
if (atlas.diagrams.length < 24) fail(`diagrams ${atlas.diagrams.length}`);
if (atlas.ports.length < 15) fail(`ports ${atlas.ports.length}`);
if (!atlas.ports.some((row) => String(row.port).includes("5060"))) fail("sip ports");
const deck = JSON.parse(readFileSync(join(campus, "downloads", "flashcards.json"), "utf8"));
if (deck.count < 400) fail(`flashcards ${deck.count}`);
if (!readFileSync(join(campus, "downloads", "ports.pdf")).includes("%PDF")) fail("ports pdf");

console.log(JSON.stringify({
  tracks: tracks.length,
  lessons,
  quiz,
  labs,
  faults,
  cards,
  cites,
  glossary: JSON.parse(readFileSync(join(campus, "data", "glossary.json"), "utf8")).length,
  boss: JSON.parse(readFileSync(join(campus, "data", "boss.json"), "utf8")).length,
  interview: JSON.parse(readFileSync(join(campus, "data", "interview.json"), "utf8")).length,
  shellBytes: shell,
  threeBytes: statSync(join(campus, "vendor", "three.min.js")).size,
  priorityExample: priority,
  dataFiles: readdirSync(join(campus, "data", "tracks")).length,
}, null, 2));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
