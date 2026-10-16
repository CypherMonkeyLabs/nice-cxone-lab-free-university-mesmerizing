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
if (!html.includes("https://github.com/cipher0x9")) fail("github profile");
if (!html.includes("https://github.com/CypherMonkeyLabs")) fail("labs org");
if (!html.includes("Visit my GitHub")) fail("github label");
if (!html.includes("Visit the Labs org")) fail("labs org label");
if (!html.includes("Visit Cypher Monkey Labs")) fail("labs site label");
if (!html.includes("https://x.com/Cypher0x9")) fail("x link");
if (!html.includes("https://huggingface.co/Cypher0x9")) fail("hf link");
if (!html.includes("favicon.svg") || !html.includes("favicon.ico")) fail("favicon links");
if (!html.includes("© 2026 CypherMonkeyLabs")) fail("copyright");
if (!html.includes("lifelong student")) fail("identity");
if (html.includes("linktr.ee")) fail("linktree");
if (html.includes("nice-cxone-lab-free-university-mesmerizing")) fail("old repo link");
if (html.includes("dev.to/cyphermonkey")) fail("dev link");
if (/linkedin/i.test(html)) fail("linkedin");
if (/mailto:|@[a-z0-9.-]+\.[a-z]{2,}/i.test(html)) fail("email");
if (!html.includes("CC BY-NC-SA")) fail("content license");
if (!html.includes("mascot-dock")) fail("mascot");
if (!html.includes("https://cipher0x9.github.io/webex-lab-free-university-mesmerizing/")) fail("webex pages");
if (!html.includes("https://cipher0x9.github.io/uc-lab-free-university-mesmerizing/")) fail("uc pages");
if (!html.includes("https://cipher0x9.github.io/ai-lab-free-university-mesmerizing/")) fail("ai pages");
if (html.includes("cypherwebex-canon-test.vercel.app")) fail("old canon url");
if (html.includes(">Webex Canon<")) fail("old canon label");
const studyLabels = ["Diagrams", "Flows", "Charts", "Cheat Codes", "Play", "Ecosystem", "Downloads", "Careers"];
if (!html.includes('class="study-menu"')) fail("study menu");
for (const label of studyLabels) {
  if (!html.includes(`>${label}<`)) fail(`menu ${label}`);
}
if (!html.includes("data-theme-set")) fail("theme switcher");
for (const theme of ["futuristic", "gaming", "neon", "light"]) {
  if (!html.includes(`value="${theme}"`)) fail(`theme ${theme}`);
}
const atlas = JSON.parse(readFileSync(join(campus, "data", "atlas.json"), "utf8"));
const flows = atlas.diagrams.filter((item) => item.family === "flow" && item.animated && item.flow);
if (atlas.diagrams.length < 25) fail(`diagrams ${atlas.diagrams.length} < 25`);
if (flows.length < 12) fail(`animated flows ${flows.length} < 12`);
for (const kind of ["ladder", "routing", "architecture", "deployment", "migration", "troubleshoot"]) {
  if (!flows.some((item) => item.flow === kind)) fail(`missing flow kind ${kind}`);
}
if (!atlas.diagrams.some((item) => item.layout === "ladder")) fail("no ladder layout");
if (!atlas.diagrams.some((item) => item.layout === "tree")) fail("no tree layout");
if (!atlas.charts || atlas.charts.length < 6) fail(`charts ${(atlas.charts || []).length} < 6`);
if (atlas.ports.length < 15) fail(`ports ${atlas.ports.length}`);
if (!atlas.ports.some((row) => String(row.port).includes("5060"))) fail("sip ports");
const deck = JSON.parse(readFileSync(join(campus, "downloads", "flashcards.json"), "utf8"));
if (deck.count < 400) fail(`flashcards ${deck.count}`);
if (!readFileSync(join(campus, "downloads", "ports.pdf")).includes("%PDF")) fail("ports pdf");
const downloadNames = readdirSync(join(campus, "downloads"));
const pngs = downloadNames.filter((name) => name.endsWith(".png"));
if (pngs.length < 10) fail(`png sheets ${pngs.length} < 10`);
if (!downloadNames.includes("cxone-offline-bundle.zip")) fail("offline zip");
const sheetHtml = readFileSync(join(campus, "downloads", "ports.html"), "utf8");
for (const token of ["https://cyphermonkeylabs.com", "https://github.com/cipher0x9", "https://github.com/CypherMonkeyLabs", "https://x.com/Cypher0x9", "https://huggingface.co/Cypher0x9", "not affiliated", "favicon.svg", "© 2026 CypherMonkeyLabs"]) {
  if (!sheetHtml.includes(token)) fail(`sheet footer ${token}`);
}
if (sheetHtml.includes("linktr.ee") || sheetHtml.includes("nice-cxone-lab-free-university-mesmerizing")) fail("old sheet link");
const portsPdf = readFileSync(join(campus, "downloads", "ports.pdf"));
const pdfText = portsPdf.toString("latin1");
if (pdfText.includes("nice-cxone-lab-free-university-mesmerizing") || pdfText.includes("linktr.ee")) fail("old pdf link");
if (!pdfText.includes("github.com/cipher0x9")) fail("pdf github");
if (/linkedin/i.test(sheetHtml) || /mailto:/i.test(sheetHtml)) fail("sheet contact");
const license = readFileSync(join(root, "LICENSE"), "utf8");
if (!license.includes("MIT") || !license.includes("CC BY-NC-SA")) fail("LICENSE mismatch");
for (const file of ["anime.esm.min.js", "d3.min.js", "rough.esm.js", "confetti.module.mjs", "markmap-view.js", "three.min.js"]) {
  if (!statSync(join(campus, "vendor", file)).size) fail(`vendor ${file}`);
}
const uni = readFileSync(join(campus, "js", "university.mjs"), "utf8");
const effects = readFileSync(join(campus, "js", "effects.mjs"), "utf8");
if (!effects.includes("anime.esm.min.js") || !effects.includes("rough.esm.js") || !effects.includes("confetti.module.mjs")) fail("effects vendors");
if (!effects.includes("d3.min.js") || !effects.includes("markmap-view.js")) fail("d3 markmap");
if (!uni.includes("#/diagrams") || !uni.includes("#/flows") || !uni.includes("#/charts")) fail("university routes");
if (!app.includes("trackFloor")) fail("track charts");
if (!sw.includes("cxone-lab-v6")) fail("sw cache");
if (!sw.includes("js/guide.mjs") || !sw.includes("data/guide-kb.json")) fail("sw guide");
if (!html.includes('id="guide"') || !html.includes("Guide Bot") || !html.includes("js/guide.mjs")) fail("guide widget");
if (!html.includes("quick-bar") || !html.includes('class="menu-search"') || !html.includes("menu-hint")) fail("menu chrome");
if (!css.includes(".menu-item[hidden]")) fail("menu filter hidden");
const guideJs = readFileSync(join(campus, "js", "guide.mjs"), "utf8");
const guideKb = JSON.parse(readFileSync(join(campus, "data", "guide-kb.json"), "utf8"));
if (!guideJs.includes("CXONE_GUIDE_ENDPOINT")) fail("guide cloud hook");
if (!guideJs.includes("I only answer from the pages loaded in this lab.")) fail("guide fallback");
if (guideKb.entries.length < 12 || guideKb.tours.length < 2 || guideKb.quizzes.length < 4) fail("guide book");
if (guideKb.entries.some((entry) => entry.cite && !String(entry.cite.url || "").startsWith("https://"))) fail("guide cite");
const { askGuide } = await import("../campus/js/guide.mjs");
const guideHit = await askGuide("what is overall priority", guideKb);
if (!guideHit.answer.includes("7")) fail("guide priority");
const guideMiss = await askGuide("what does a license cost in dollars this quarter", guideKb);
if (!String(guideMiss.answer).startsWith("I only answer from the pages loaded in this lab.")) fail("guide invent");
const realFetch = globalThis.fetch;
globalThis.fetch = async () => ({ ok: true, json: async () => ({ answer: "A license costs twelve dollars." }) });
const guidePoison = await askGuide("what is overall priority", { ...guideKb, endpoint: "https://example.com/guide" });
if (guidePoison.source !== "local" || !guidePoison.answer.includes("7")) fail("guide uncited cloud");
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({
    answer: "Cloud sentence from the ports page.",
    cite: { title: "Ports and Protocols by Application", url: "https://help.nicecxone.com/content/platformrequirements/wizard/portsandprotocolsbyapp.htm" },
  }),
});
const guideCloud = await askGuide("sip ports", { ...guideKb, endpoint: "https://example.com/guide" });
globalThis.fetch = realFetch;
if (guideCloud.source !== "cloud" || guideCloud.answer !== "Cloud sentence from the ports page.") fail("guide cloud hook answer");
if (!css.includes("font-display: swap")) fail("font-display");
if (!css.includes("prefers-reduced-motion")) fail("reduced motion css");
const pixel = readFileSync(join(campus, "js", "pixel.mjs"), "utf8");
if (!pixel.includes("devicePixelRatio") || !pixel.includes("1.5")) fail("mobile pixel cap");
if (!app.includes("motionReduced") || !app.includes("prefers-reduced-motion")) fail("motion sync");

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
  diagrams: atlas.diagrams.length,
  animatedFlows: flows.length,
  charts: atlas.charts.length,
  pngSheets: pngs.length,
  priorityExample: priority,
  dataFiles: readdirSync(join(campus, "data", "tracks")).length,
}, null, 2));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
