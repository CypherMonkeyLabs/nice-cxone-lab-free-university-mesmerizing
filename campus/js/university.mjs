import { diagramCard, diagramSvg } from "./diagrams.mjs";
import { ACTION_CATALOG, validateScript } from "./model.mjs";
import { chartsBlock, counterRow, iconParade } from "./charts.mjs";
import { burst, decorateFloor } from "./effects.mjs";
import { bindLightbox } from "./lightbox.mjs";
import { bindTilt } from "./icons.mjs";

const ATLAS = "data/atlas.json";
const BADGES_KEY = "cxone-lab-badges";
const DAILY_KEY = "cxone-lab-daily";
const POSES = ["still", "wave", "think", "headset", "cheer"];
const LOOKS = ["classic", "visor", "neon", "sunset"];

let atlasPromise = null;
let poseTimer = 0;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function loadAtlas() {
  if (!atlasPromise) {
    atlasPromise = fetch(ATLAS).then((response) => {
      if (!response.ok) throw new Error("Atlas did not load");
      return response.json();
    });
  }
  return atlasPromise;
}

function citeHtml(atlas, key) {
  const cite = typeof key === "string" ? atlas.cites[key] : key;
  if (!cite || !cite.url) return "";
  return `<a href="${esc(cite.url)}" target="_blank" rel="noopener noreferrer">${esc(cite.title)}</a>`;
}

function badges() {
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

export function award(id) {
  const data = badges();
  if (data[id]) return;
  data[id] = new Date().toISOString();
  localStorage.setItem(BADGES_KEY, JSON.stringify(data));
}

function studiedCount() {
  try {
    const data = JSON.parse(localStorage.getItem("cxone-lab-progress") || "{}");
    return Object.values(data).filter((item) => item && item.done).length;
  } catch (error) {
    return 0;
  }
}

export function syncStudyBadges() {
  const count = studiedCount();
  if (count >= 1) award("first");
  if (count >= 10) award("ten");
  if (count >= 50) award("fifty");
  if (count >= 112) award("all");
}

const BADGE_DEFS = [
  ["first", "First contact", "Finish one lesson quiz."],
  ["ten", "Floor walker", "Finish 10 lesson quizzes."],
  ["fifty", "Half the floor", "Finish 50 lesson quizzes."],
  ["all", "Signal captain", "Finish all 112 lesson quizzes."],
  ["ports", "Port ace", "Score 12 of 12 on the ports game."],
  ["daily", "Day shift", "Answer a daily challenge."],
  ["streak", "Three-day board", "Answer three different UTC days."],
  ["studio", "Script clerk", "Export a classroom Studio JSON file."],
  ["sim", "Queue runner", "Step the routing simulator."],
  ["konami", "Monkey signal", "Enter the classic cheat code."],
];

function badgeHtml() {
  const have = badges();
  return `<div class="badge-grid">${BADGE_DEFS.map(([id, name, detail]) => (
    `<article class="badge ${have[id] ? "on" : ""}"><strong>${esc(name)}</strong><p>${esc(detail)}</p></article>`
  )).join("")}</div>`;
}

function crumbs(parts) {
  const tail = (parts || []).map((part) => (
    part.href ? ` · <a href="${esc(part.href)}">${esc(part.label)}</a>` : ` · ${esc(part.label)}`
  )).join("");
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Floor</a>${tail}</nav>`;
}

function pageShell(title, lede, body) {
  return `${crumbs([{ label: title }])}<h1>${esc(title)}</h1><p class="lede">${lede}</p>${uniNav()}<div>${body}</div>`;
}

function uniNav() {
  const links = [
    ["#/diagrams", "Diagrams"],
    ["#/flows", "Flows"],
    ["#/charts", "Charts"],
    ["#/downloads", "Cheat Codes"],
    ["#/play", "Play"],
    ["#/ecosystem", "Ecosystem"],
    ["#/downloads", "Downloads"],
    ["#/careers", "Careers"],
    ["#/regions", "Regions"],
    ["#/atlas", "Ports atlas"],
    ["#/explorer", "Flow explorer"],
    ["#/sandbox", "Call-flow sandbox"],
    ["#/roadmap", "Roadmap"],
    ["#/deploy", "Deployment"],
    ["#/cutover", "Migration"],
    ["#/progress", "Progress"],
  ];
  return `<nav class="uni-nav" aria-label="University">${links.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join("")}</nav>`;
}

function blocksHtml(atlas, page) {
  return page.blocks.map((block) => `
    <section class="lesson-block" style="padding:12px 14px;margin:12px 0">
      <h2>${esc(block.h)}</h2>
      ${block.p.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
      <p class="sources">Source: ${(block.cites || []).map((key) => citeHtml(atlas, key)).join(" · ")}</p>
    </section>`).join("");
}

export async function signalCounts() {
  const atlas = await loadAtlas();
  const flows = atlas.diagrams.filter((item) => item.family === "flow" && item.animated).length;
  return {
    diagrams: atlas.diagrams.length,
    flows,
    charts: (atlas.charts || []).length,
    ports: atlas.ports.length,
  };
}

export async function heroArt(reduced) {
  const atlas = await loadAtlas();
  const spec = atlas.diagrams.find((item) => item.id === "sip-ladder") || atlas.diagrams.find((item) => item.layout === "ladder");
  return spec ? diagramSvg(spec, reduced) : "";
}

export async function homeExtra(manifest, done, total) {
  const atlas = await loadAtlas();
  const reduced = document.documentElement.dataset.motion === "reduce";
  const featured = ["sip-ladder", "route-ladder", "audio-tree", "bullseye", "cutover-ladder", "orbit"].map((id) => atlas.diagrams.find((item) => item.id === id)).filter(Boolean);
  const cards = featured.map((spec) => diagramCard(spec, citeHtml(atlas, spec.cite), reduced)).join("");
  return `
    <section class="home-spotlight" id="home-spotlight">
      <h2>Diagrams, flows, and charts</h2>
      <p class="muted">${done} of ${total} lessons studied in this browser · ${manifest.tracks.length} tracks · ${atlas.diagrams.length} diagrams · ${atlas.diagrams.filter((item) => item.family === "flow" && item.animated).length} animated flows · ${(atlas.charts || []).length} charts from this floor’s own files. <a href="#/diagrams">Open the atlas</a> · <a href="#/flows">Flows</a> · <a href="#/charts">Charts</a> · <a href="#/downloads">Cheat Codes</a></p>
      ${iconParade()}
      <div class="diagram-grid">${cards}</div>
      <h2>Counts from the lesson files</h2>
      ${chartsBlock(atlas.charts || [], (key) => citeHtml(atlas, key))}
      <canvas class="reel" id="signal-reel" width="640" height="92" aria-label="Animated contact moving from a point of contact to an agent"></canvas>
    </section>`;
}

export async function trackFloor(track) {
  const atlas = await loadAtlas();
  const stat = (atlas.stats && atlas.stats.tracks || []).find((item) => item.id === track.id) || { minutes: 0, quiz: 0 };
  return `
    ${counterRow([
      { value: track.lessons.length, label: "lessons" },
      { value: stat.minutes, label: "minutes" },
      { value: stat.quiz, label: "quiz items" },
      { value: atlas.diagrams.length, label: "diagrams" },
    ])}
    <svg class="rough-frame" viewBox="0 0 760 90" aria-hidden="true"></svg>
    ${iconParade()}
    <h2>Floor charts</h2>
    ${chartsBlock(atlas.charts || [], (key) => citeHtml(atlas, key))}`;
}

export function lessonAside(lesson) {
  const items = [
    ["#lesson-top", "Summary"],
    ["#flow-player", "Walkthrough"],
    ["#lab-block", "Lab"],
    ["#fault-block", "Faults"],
    ["#card-block", "Flashcards"],
    ["#quiz-block", "Quiz"],
  ];
  return `<aside class="read-side"><strong>On this page</strong>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join("")}<p class="muted">${esc(lesson.level)} · ${esc(lesson.minutes)} min</p></aside>`;
}

function portsTable(atlas) {
  const rows = atlas.ports.map((row) => `<tr><td>${esc(row.use)}</td><td>${esc(row.proto)}</td><td>${esc(row.port)}</td><td>${esc(row.direction)}</td><td>${esc(row.note)}<div class="sources">${citeHtml(atlas, row.cite)}</div></td></tr>`).join("");
  return `<div class="table-wrap"><table class="ports"><thead><tr><th>Use</th><th>Protocol</th><th>Port</th><th>Direction</th><th>What the page supports</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function generic(atlas, id) {
  const page = atlas.pages.find((item) => item.id === id);
  if (!page) return null;
  return pageShell(page.title, esc(page.lede), blocksHtml(atlas, page));
}

async function viewDiagrams(reduced, mode) {
  const atlas = await loadAtlas();
  const flows = atlas.diagrams.filter((item) => item.family === "flow" && item.animated);
  const list = mode === "flow" ? flows : atlas.diagrams;
  const kinds = ["ladder", "routing", "architecture", "deployment", "migration", "troubleshoot", "data", "signal"];
  const filters = kinds.map((kind) => `<button type="button" data-jump="${esc(kind)}">${esc(kind)}</button>`).join("");
  const cards = list.map((spec) => diagramCard(spec, citeHtml(atlas, spec.cite), reduced)).join("");
  const title = mode === "flow" ? "Animated flows" : "Diagram atlas";
  const lede = mode === "flow"
    ? `${flows.length} animated call, signal, and data flows. Ladders, routing, architecture, deployment, migration cutover, and troubleshooting trees are in this set.`
    : `${atlas.diagrams.length} custom SVG diagrams. ${flows.length} of them are animated flows. Mermaid was not run; these SVGs are drawn on this floor.`;
  return pageShell(title, lede, `
    <nav class="uni-nav" aria-label="Flow kinds">${filters}</nav>
    <div class="diagram-grid">${cards}</div>`);
}

async function viewCharts() {
  const atlas = await loadAtlas();
  return pageShell("Charts", `${(atlas.charts || []).length} charts. Lesson, minute, and quiz bars are counted from this repository. Protocol bars count rows in the firewall table. Release bars are the published start month.`, `
    ${iconParade()}
    ${chartsBlock(atlas.charts || [], (key) => citeHtml(atlas, key))}
    <svg class="rough-frame" viewBox="0 0 760 90" aria-hidden="true"></svg>`);
}

async function viewAtlas(reduced) {
  const atlas = await loadAtlas();
  const diagrams = atlas.diagrams.map((spec) => diagramCard(spec, citeHtml(atlas, spec.cite), reduced)).join("");
  const regions = atlas.webrtc.map((item) => `<li><strong>${esc(item.region)}</strong> ${esc(item.fqdn)} — ${esc(item.note)}</li>`).join("");
  const inbound = atlas.ciphers.inbound.map((item) => `<li>${esc(item)}</li>`).join("");
  const outbound = atlas.ciphers.outbound.map((item) => `<li>${esc(item)}</li>`).join("");
  return pageShell("Ports, protocols, and the firewall matrix", esc(atlas.honesty), `
    <p>Select the applications you actually use on the ports page. This table keeps only rows whose wording names a port. It is not a copy of the allowlist.</p>
    ${portsTable(atlas)}
    <h2>WebRTC monitor hosts</h2>
    <ul>${regions}</ul>
    <p class="sources">${citeHtml(atlas, "ports")}</p>
    <h2>TLS ciphers</h2>
    <p>Minimum ${esc(atlas.ciphers.minimum)}. Support at least one cipher in each direction. Source: ${citeHtml(atlas, atlas.ciphers.cite)}</p>
    <div class="grid cards"><article class="card"><h2>Inbound, CXone to your servers</h2><ul>${inbound}</ul></article><article class="card"><h2>Outbound, your servers to CXone</h2><ul>${outbound}</ul></article></div>
    <h2>${atlas.diagrams.length} signal diagrams</h2>
    <div class="diagram-grid">${diagrams}</div>`);
}

async function viewRoadmap(manifest) {
  const atlas = await loadAtlas();
  const cycles = atlas.cycles.map((item) => `<article class="card"><header><h2>${esc(item.name)}</h2></header><p>${esc(item.window)}</p><p>${esc(item.note)}</p><p class="sources">${citeHtml(atlas, item.cite)}</p></article>`).join("");
  const plan = manifest.tracks.map((track, index) => `<li><a href="#/track/${esc(track.id)}">Day ${index * 4 + 1}–${index * 4 + 4}</a> — ${esc(track.title)}. ${esc(track.blurb)}</li>`).join("");
  return pageShell("Roadmap and what is new in 2026", "Dates are quoted from the release pages. The 26.3 and 26.4 windows overlap, and this floor does not pick a winner.", `
    <div class="grid cards">${cycles}</div>
    <h2>Study plan across the sixteen tracks</h2>
    <ol>${plan}</ol>
    <p class="sources">${citeHtml(atlas, "process")} · ${citeHtml(atlas, "notify")}</p>`);
}

async function viewExplorer(reduced) {
  const atlas = await loadAtlas();
  const spec = atlas.diagrams.find((item) => item.id === "orbit");
  const sisters = atlas.sisters.map((item) => `<article class="card" id="sis-${esc(item.name)}"><header><h2>${esc(item.name)}</h2></header><p>${esc(item.does)}</p><p class="sources">${citeHtml(atlas, item.cite)}</p></article>`).join("");
  const trees = atlas.troubles.map((item) => `<article class="callout"><strong>${esc(item.symptom)}</strong><p>${esc(item.check)}</p><p class="sources">${citeHtml(atlas, item.cite)}</p></article>`).join("");
  return pageShell("Flow explorer", "Click a sister system. The orbit is a study map. Each sentence has its own page. The mind map below is drawn with markmap after d3 loads from this floor.", `
    <svg id="ecosystem-markmap" class="markmap" viewBox="0 0 760 420" role="img" aria-label="Ecosystem mind map"></svg>
    <div class="explorer">
      <div>${diagramSvg(spec, reduced)}<p class="sources">${citeHtml(atlas, "studio")}</p></div>
      <div class="grid">${sisters}</div>
    </div>
    <h2>Troubleshooting tree</h2>
    ${trees}`);
}

async function viewPlay() {
  const atlas = await loadAtlas();
  const questions = atlas.game.map((item, index) => {
    const choices = item.choices.map((choice, choiceIndex) => `<label class="choice"><input type="radio" name="g${index}" value="${choiceIndex}"> ${esc(choice)}</label>`).join("");
    return `<fieldset><legend>${index + 1}. ${esc(item.q)}</legend>${choices}</fieldset>`;
  }).join("");
  const day = new Date().toISOString().slice(0, 10);
  const daily = atlas.daily[day.split("-").reduce((sum, part) => sum + Number(part), 0) % atlas.daily.length];
  return pageShell("Play floor", "The ports game uses the firewall table. The daily question changes with the UTC date. Scores stay in this browser.", `
    <h2>Ports mastery</h2>
    <form id="port-game">${questions}<button class="solid" type="submit">Score the board</button><p class="status" id="port-status" role="status"></p><div id="port-why"></div></form>
    <p><button type="button" class="ghost" id="share-card">Download a result card</button></p>
    <canvas id="share-canvas" width="900" height="480" hidden></canvas>
    <h2>Daily challenge · ${esc(day)}</h2>
    <form id="daily-form"><fieldset><legend>${esc(daily.q)}</legend>${daily.choices.map((choice, index) => `<label class="choice"><input type="radio" name="daily" value="${index}"> ${esc(choice)}</label>`).join("")}</fieldset><button class="solid" type="submit">Lock today’s answer</button><p class="status" id="daily-status" role="status"></p></form>
    <h2>Badges</h2>
    ${badgeHtml()}
    <p class="muted">The mascot also listens for the classic up-up-down-down-left-right-left-right-b-a code.</p>`);
}

function bindPlay(atlas) {
  const form = document.getElementById("port-game");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let correct = 0;
    const why = atlas.game.map((item, index) => {
      const selected = form.querySelector(`input[name="g${index}"]:checked`);
      const ok = selected && Number(selected.value) === item.answer;
      if (ok) correct += 1;
      return `<div class="callout ${ok ? "ok" : "danger"}"><strong>Q${index + 1}.</strong> ${esc(item.why)} ${citeHtml(atlas, item.cite)}</div>`;
    }).join("");
    document.getElementById("port-why").innerHTML = why;
    document.getElementById("port-status").textContent = `${correct} of ${atlas.game.length}.`;
    if (correct === atlas.game.length) {
      award("ports");
      burst();
    }
    sessionStorage.setItem("cxone-last-score", String(correct));
  });
  document.getElementById("share-card").addEventListener("click", () => drawCard(sessionStorage.getItem("cxone-last-score") || "—", atlas.game.length));
  const day = new Date().toISOString().slice(0, 10);
  const daily = atlas.daily[day.split("-").reduce((sum, part) => sum + Number(part), 0) % atlas.daily.length];
  document.getElementById("daily-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = event.target.querySelector("input:checked");
    const status = document.getElementById("daily-status");
    if (!selected) {
      status.textContent = "Choose an answer.";
      return;
    }
    const ok = Number(selected.value) === daily.answer;
    const store = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
    store[day] = ok;
    localStorage.setItem(DAILY_KEY, JSON.stringify(store));
    award("daily");
    const days = Object.keys(store);
    if (days.length >= 3) award("streak");
    status.textContent = ok ? `Correct. ${daily.why}` : `Review. ${daily.why}`;
  });
}

function drawCard(score, total) {
  const canvas = document.getElementById("share-canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#071018";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#3ecbff";
  ctx.strokeRect(24, 24, 852, 432);
  ctx.fillStyle = "#ffb020";
  ctx.font = "28px Georgia, serif";
  ctx.fillText("Signal Floor · NICE CXone Lab", 48, 90);
  ctx.fillStyle = "#e8f4f6";
  ctx.font = "64px Georgia, serif";
  ctx.fillText(`${score} / ${total}`, 48, 190);
  ctx.font = "22px sans-serif";
  ctx.fillText("Ports mastery on an independent study floor.", 48, 250);
  ctx.fillStyle = "#8adfff";
  ctx.fillText("https://cyphermonkeylabs.com", 48, 330);
  ctx.fillStyle = "#a9c0c9";
  ctx.font = "16px sans-serif";
  ctx.fillText("Not affiliated with NiCE. MIT code, CC BY-NC-SA content.", 48, 390);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "cxone-result-card.png";
  link.click();
}

async function viewDownloads() {
  const sheets = [
    ["ports", "Ports and protocols"],
    ["flows", "Call flows"],
    ["config", "Configuration checklist"],
    ["troubleshoot", "Troubleshooting tree"],
    ["glossary", "Glossary"],
    ["wfm", "WFM forecast"],
    ["recording", "Recording and QM"],
    ["e911", "E911"],
    ["crm-api", "CRM and APIs"],
    ["ai", "AI agents"],
    ["licensing", "Licenses and badges"],
    ["carrier", "Carrier and SIP"],
    ["security", "Security"],
    ["migration", "Migration checklist"],
    ["reporting", "Reporting"],
    ["flashcards", "Printable flashcards"],
  ];
  const cards = sheets.map(([stem, title]) => `<article class="card"><header><h2>${esc(title)}</h2></header><p><a href="downloads/${stem}.html">HTML</a> · <a href="downloads/${stem}.pdf">PDF</a> · <a href="downloads/${stem}.png">PNG</a></p></article>`).join("");
  return pageShell("Cheat Codes", "One-page sheets generated in this repo. They paraphrase public pages and link back. They are not vendor manuals.", `
    <div class="grid cards">${cards}</div>
    <h2>Decks and the offline bundle</h2>
    <p><a href="downloads/flashcards.json">Flashcard JSON</a> · <a href="downloads/cxone-offline-pack.json">Offline pack JSON</a> · <a href="downloads/cxone-offline-bundle.zip">Offline zip</a></p>
    <p>The top-bar download builds a fresh pack from the tracks loaded in this browser, including anything you have not opened yet. The zip is the printable cheat-code set.</p>
    <p class="muted">Each sheet carries cyphermonkeylabs.com, linktr.ee/cyphermonkey, the repo link, and the disclaimer. No LinkedIn. No email address.</p>`);
}

async function viewSandbox() {
  const buttons = ACTION_CATALOG.map((action) => `<button type="button" class="ghost" data-add="${esc(action.type)}">${esc(action.type)}</button>`).join("");
  return pageShell("Call-flow sandbox", "Chain the actions named in Studio help. Validate uses the same classroom rules as the builder. Export is still not a Studio import file.", `
    <div class="row" id="sand-palette">${buttons}<button type="button" class="ghost" id="sand-clear">Clear</button><button type="button" class="solid" id="sand-check">Validate</button><button type="button" class="ghost" id="sand-export">Export lab JSON</button></div>
    <div id="sand-svg"></div>
    <pre class="log" id="sand-out">Add BEGIN first.</pre>`);
}

function bindSandbox(reduced) {
  const host = document.getElementById("sand-palette");
  if (!host) return;
  const state = { actions: [], links: [] };
  const paint = () => {
    const labels = state.actions.map((action) => action.type);
    const spec = { title: "Sandbox flow", layout: "row", nodes: labels.map((label, index) => ({ id: "n" + index, label })), edges: labels.slice(0, -1).map((_, index) => ({ from: "n" + index, to: "n" + (index + 1), label: "next" })) };
    document.getElementById("sand-svg").innerHTML = labels.length ? diagramSvg(spec, reduced) : "<p>The chain is empty.</p>";
  };
  host.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    const id = "a" + (state.actions.length + 1);
    const type = button.dataset.add;
    const action = { id, type, caption: type };
    if (type === "MENU") action.branches = 2;
    if (type === "REQAGENT") {
      action.skill = "Sales_IB";
      action.high = 1;
      action.low = 5;
    }
    if (type === "UPDATECONTACT") {
      action.high = 1;
      action.low = 12;
    }
    if (state.actions.length) state.links.push({ from: state.actions[state.actions.length - 1].id, to: id, label: "next" });
    state.actions.push(action);
    paint();
  });
  document.getElementById("sand-clear").addEventListener("click", () => {
    state.actions = [];
    state.links = [];
    paint();
  });
  document.getElementById("sand-check").addEventListener("click", () => {
    const issues = validateScript(state);
    document.getElementById("sand-out").textContent = issues.map((issue) => `${issue.level.toUpperCase()}: ${issue.text}`).join("\n");
  });
  document.getElementById("sand-export").addEventListener("click", () => {
    const payload = { labSchema: "cxone-lab.studio/1", notOfficialStudioExport: true, note: "Sandbox chain. Not a Studio import.", actions: state.actions, links: state.links };
    document.getElementById("sand-out").textContent = JSON.stringify(payload, null, 2);
    award("studio");
  });
  paint();
}

async function viewProgress(manifest) {
  syncStudyBadges();
  let data = {};
  try { data = JSON.parse(localStorage.getItem("cxone-lab-progress") || "{}"); } catch (error) { data = {}; }
  const blocks = manifest.tracks.map((track) => {
    const done = track.lessonIds.filter((id) => data[`${track.id}/${id}`] && data[`${track.id}/${id}`].done).length;
    return `<a class="card" href="#/track/${esc(track.id)}"><header><h2>${esc(track.title)}</h2><span class="chip">${done}/${track.lessonIds.length}</span></header><div class="bar" aria-hidden="true"><span style="width:${Math.round((done / track.lessonIds.length) * 100)}%"></span></div></a>`;
  }).join("");
  const total = manifest.tracks.reduce((sum, track) => sum + track.lessonIds.length, 0);
  const finished = manifest.tracks.reduce((sum, track) => sum + track.lessonIds.filter((id) => data[`${track.id}/${id}`] && data[`${track.id}/${id}`].done).length, 0);
  return pageShell("Progress", `${finished} of ${total} lessons have a checked quiz in this browser.`, `<div class="grid cards">${blocks}</div><h2>Badges</h2>${badgeHtml()}`);
}

const REGION_LABELS = {
  AU1: "Australia — study label for the AU1 hostname prefix",
  CA1: "Canada — study label for the CA1 hostname prefix",
  EU1: "Europe — example grouping, not a published country",
  UK1: "United Kingdom — study label for the UK1 hostname prefix",
  NA1: "North America — example grouping, not a published country",
  JP1: "Japan — study label for the JP1 hostname prefix",
  JO1: "Jordan — study label for the JO1 hostname prefix",
};
const REGION_FLAGS = { AU1: "🇦🇺", CA1: "🇨🇦", EU1: "🇪🇺", UK1: "🇬🇧", NA1: "🇺🇸", JP1: "🇯🇵", JO1: "🇯🇴" };

async function viewRegions() {
  const atlas = await loadAtlas();
  const pins = (atlas.webrtc || []).map((row, index) => `
    <li class="region-pin" style="--n:${index}">
      <span class="flag" aria-hidden="true">${REGION_FLAGS[row.region] || "●"}</span>
      <div>
        <strong>${esc(row.region)}</strong>
        <code>${esc(row.fqdn)}</code>
        <p class="muted">${esc(REGION_LABELS[row.region] || "Published cluster code. Country reading is not claimed.")}</p>
      </div>
    </li>`).join("");
  const kinds = [
    ["Commercial", "The connectivity requirements page calls commercial the standard environment."],
    ["FedRAMP", "The same page calls FedRAMP an isolated U.S. federal environment with continuous monitoring and restricted access."],
    ["Sovereign", "The same page calls a sovereign cloud a region that keeps data residency and operations inside a country’s legal boundary."],
  ].map(([title, text], index) => `
    <article class="card holo region-kind"><header><h2>${esc(title)}</h2><span class="chip">${index + 1}</span></header><p>${esc(text)}</p></article>`).join("");
  return pageShell(
    "Regions and clusters",
    "Published WebRTC hostnames and the three cluster kinds named on the connectivity requirements page. Marker flags are a study sketch. This is not a PSTN coverage map, a carrier list, or a regulation guide.",
    `<ol class="region-list">${pins}</ol>
     <p class="callout">If you do not know the cluster, the connectivity page says to ask the account representative. Do not guess na1. IP addresses on that page are not copied here.</p>
     <div class="grid cards region-kinds">${kinds}</div>
     <p class="sources">Source: ${citeHtml(atlas, "ports")} · ${citeHtml(atlas, "portsHub")}</p>`,
  );
}

export async function renderUniversity(path, manifest, reduced) {
  const jump = () => {
    document.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = document.querySelector(`.diagram-card[data-flow="${button.dataset.jump}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };
  if (path === "#/diagrams") return { html: await viewDiagrams(reduced, "all"), active: "diagrams", bind: () => { decorateFloor(document.getElementById("main")); jump(); } };
  if (path === "#/flows") return { html: await viewDiagrams(reduced, "flow"), active: "flows", bind: () => { decorateFloor(document.getElementById("main")); jump(); } };
  if (path === "#/charts") return { html: await viewCharts(), active: "charts", bind: () => decorateFloor(document.getElementById("main")) };
  if (path === "#/atlas" || path === "#/ports") return { html: await viewAtlas(reduced), active: "atlas", bind: null };
  if (path === "#/roadmap") return { html: await viewRoadmap(manifest), active: "roadmap", bind: null };
  if (path === "#/explorer") return { html: await viewExplorer(reduced), active: "explorer", bind: () => decorateFloor(document.getElementById("main")) };
  if (path === "#/play") {
    const html = await viewPlay();
    return { html, active: "play", bind: async () => bindPlay(await loadAtlas()) };
  }
  if (path === "#/downloads" || path === "#/cheat" || path === "#/cheats") return { html: await viewDownloads(), active: "downloads", bind: null };
  if (path === "#/sandbox") return { html: await viewSandbox(), active: "sandbox", bind: () => bindSandbox(reduced) };
  if (path === "#/progress") return { html: await viewProgress(manifest), active: "progress", bind: null };
  if (path === "#/regions") return { html: await viewRegions(), active: "regions", bind: null };
  const atlas = await loadAtlas();
  const raw = path.replace(/^#\//, "");
  const id = raw === "careers" ? "career" : raw;
  const html = generic(atlas, id);
  if (!html) return null;
  return { html, active: id === "career" ? "careers" : "atlas", bind: null };
}

function applyLook() {
  const section = (location.hash || "#/").split("?")[0];
  let hash = 0;
  for (let index = 0; index < section.length; index += 1) hash = (hash + section.charCodeAt(index) * (index + 1)) % 997;
  const turn = Math.floor(Date.now() / 180000);
  document.documentElement.dataset.look = LOOKS[(hash + turn) % LOOKS.length];
}

export function bootUniversity({ downloadPack, reducedMotion, tone }) {
  const dock = document.getElementById("mascot-dock");
  let pose = 0;
  const applyPose = () => {
    if (!dock) return;
    dock.dataset.pose = POSES[pose % POSES.length];
  };
  applyLook();
  window.addEventListener("hashchange", applyLook);
  setInterval(applyLook, 180000);
  applyPose();
  if (dock) {
    dock.addEventListener("click", () => {
      pose = (pose + 1) % POSES.length;
      applyPose();
      tone(480 + pose * 40, 0.08, "triangle");
    });
  }
  if (poseTimer) clearInterval(poseTimer);
  poseTimer = setInterval(() => {
    pose = (pose + 1) % POSES.length;
    applyPose();
  }, 7000);
  const button = document.getElementById("download-pack");
  if (button) button.addEventListener("click", () => downloadPack(button));
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let cursor = 0;
  window.addEventListener("keydown", (event) => {
    const tag = document.activeElement && document.activeElement.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement && document.activeElement.isContentEditable);
    if (event.key === "/" && !typing && !event.altKey && !event.metaKey && !event.ctrlKey) {
      const field = document.getElementById("q");
      if (field) {
        event.preventDefault();
        field.focus();
      }
    }
    if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      const link = document.querySelector(event.key === "ArrowLeft" ? "a[rel='prev']" : "a[rel='next']");
      if (link) {
        event.preventDefault();
        location.hash = link.getAttribute("href");
      }
    }
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    cursor = key === sequence[cursor] ? cursor + 1 : (key === sequence[0] ? 1 : 0);
    if (cursor === sequence.length) {
      cursor = 0;
      award("konami");
      if (dock) dock.dataset.pose = "cheer";
      const egg = document.createElement("div");
      egg.className = "egg";
      egg.innerHTML = `<div class="egg-card" role="dialog" aria-label="Monkey signal"><h2>Monkey signal</h2><p>The mascot caught the classic code. A badge is saved on this browser.</p><p><a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a></p><button type="button" class="solid" id="egg-close">Close</button></div>`;
      document.body.appendChild(egg);
      document.getElementById("egg-close").addEventListener("click", () => egg.remove());
      egg.addEventListener("click", (click) => { if (click.target === egg) egg.remove(); });
      tone(660, 0.16, "square");
    }
  });
}

export function decorateHome(reduced) {
  const main = document.getElementById("main");
  decorateFloor(main);
  bindTilt(main);
  bindLightbox(main);
  startReel(reduced);
  document.querySelectorAll("[data-pose-set]").forEach((button) => {
    button.addEventListener("click", () => {
      const dock = document.getElementById("mascot-dock");
      if (dock) dock.dataset.pose = button.dataset.poseSet;
    });
  });
}

let reelFrame = 0;

export function startReel(reduced) {
  if (reelFrame) cancelAnimationFrame(reelFrame);
  const canvas = document.getElementById("signal-reel");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let frame = 0;
  const draw = () => {
    if (!canvas.isConnected) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#3ecbff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    ctx.lineTo(w - 40, h / 2);
    ctx.stroke();
    const stops = [40, 180, 340, 500, w - 40];
    const names = ["POC", "Script", "Skill", "Queue", "Agent"];
    stops.forEach((x, index) => {
      ctx.fillStyle = "#10202c";
      ctx.fillRect(x - 28, h / 2 - 16, 56, 32);
      ctx.strokeRect(x - 28, h / 2 - 16, 56, 32);
      ctx.fillStyle = "#e8f4f6";
      ctx.font = "12px sans-serif";
      ctx.fillText(names[index], x - 18, h / 2 + 4);
    });
    const t = reduced ? 0.2 : (frame % 200) / 200;
    const x = 40 + (w - 80) * t;
    ctx.fillStyle = "#ffb020";
    ctx.beginPath();
    ctx.arc(x, h / 2 - 24, 7, 0, Math.PI * 2);
    ctx.fill();
    frame += 1;
    if (!reduced) reelFrame = requestAnimationFrame(draw);
  };
  draw();
}

export async function buildPack(manifest, ensureTrack, ensureExtra) {
  const atlas = await loadAtlas();
  const tracks = {};
  for (const track of manifest.tracks) tracks[track.id] = await ensureTrack(track.id);
  const extras = {};
  for (const name of Object.keys(manifest.extras || {})) extras[name] = await ensureExtra(name);
  return {
    product: "NICE CXone Lab offline pack",
    generated: new Date().toISOString(),
    honesty: atlas.honesty,
    manifest,
    tracks,
    extras,
    atlas,
    footer: "https://cyphermonkeylabs.com · https://linktr.ee/cyphermonkey · https://github.com/cipher0x9/nice-cxone-lab-free-university-mesmerizing · Independent educational project. MIT code, CC BY-NC-SA content.",
  };
}
