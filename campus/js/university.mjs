import { diagramCard, diagramSvg } from "./diagrams.mjs";
import { ACTION_CATALOG, validateScript } from "./model.mjs";

const ATLAS = "data/atlas.json";
const BADGES_KEY = "cxone-lab-badges";
const DAILY_KEY = "cxone-lab-daily";
const POSES = ["still", "wave", "think", "headset", "cheer"];

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

function pageShell(title, lede, body) {
  return `<p class="muted"><a href="#/">Floor</a> · University</p><h1>${esc(title)}</h1><p class="lede">${lede}</p>${uniNav()}<div>${body}</div>`;
}

function uniNav() {
  const links = [
    ["#/atlas", "Ports atlas"],
    ["#/explorer", "Flow explorer"],
    ["#/sandbox", "Call-flow sandbox"],
    ["#/play", "Play floor"],
    ["#/downloads", "Cheat codes"],
    ["#/roadmap", "Roadmap"],
    ["#/deploy", "Deployment"],
    ["#/cutover", "Migration"],
    ["#/e911", "E911"],
    ["#/reporting", "Reporting"],
    ["#/security", "Security"],
    ["#/licensing", "Licenses"],
    ["#/byoc", "Carrier options"],
    ["#/career", "Study paths"],
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

export async function homeExtra(manifest, done, total) {
  const atlas = await loadAtlas();
  const reduced = document.documentElement.dataset.motion === "reduce";
  const featured = ["inbound", "priority", "bullseye", "legs", "e911", "orbit"].map((id) => atlas.diagrams.find((item) => item.id === id)).filter(Boolean);
  const cards = featured.map((spec) => diagramCard(spec, citeHtml(atlas, spec.cite), reduced)).join("");
  const fan = ["ACD", "Studio", "WFM", "QM", "AI", "API"].map((label, index) => (
    `<div class="fan-card" style="--ry:${(index - 2.5) * 14}deg">${esc(label)}</div>`
  )).join("");
  return `
    <section class="hero">
      <div class="hero-copy">
        <h2>Signal numbers that are real</h2>
        <p class="score-pip">${done} / ${total} lessons marked studied · ${manifest.tracks.length} tracks · ${atlas.diagrams.length} diagrams · ${atlas.ports.length} port rows</p>
        <p>The counters read this browser’s saved progress and the files on this floor. Zero means you have not checked a quiz yet.</p>
        <canvas class="reel" id="signal-reel" width="640" height="92" aria-label="Animated contact moving from a point of contact to an agent"></canvas>
      </div>
      <div class="fan" aria-hidden="true">${fan}</div>
    </section>
    <h2>Animated floor plans</h2>
    <div class="diagram-grid">${cards}</div>`;
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
  return pageShell("Flow explorer", "Click a sister system. The orbit is a study map. Each sentence has its own page.", `
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
    if (correct === atlas.game.length) award("ports");
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
    ["ports.html", "ports.pdf", "Ports and protocols"],
    ["flows.html", "flows.pdf", "Call flows"],
    ["config.html", "config.pdf", "Configuration checklist"],
    ["troubleshoot.html", "troubleshoot.pdf", "Troubleshooting tree"],
    ["glossary.html", "glossary.pdf", "Glossary"],
    ["wfm.html", "wfm.pdf", "WFM forecast"],
    ["recording.html", "recording.pdf", "Recording and QM"],
    ["e911.html", "e911.pdf", "E911"],
    ["crm-api.html", "crm-api.pdf", "CRM and APIs"],
    ["ai.html", "ai.pdf", "AI agents"],
    ["licensing.html", "licensing.pdf", "Licenses and badges"],
    ["carrier.html", "carrier.pdf", "Carrier and SIP"],
    ["security.html", "security.pdf", "Security"],
    ["migration.html", "migration.pdf", "Migration checklist"],
    ["reporting.html", "reporting.pdf", "Reporting"],
    ["flashcards.html", "flashcards.pdf", "Printable flashcards"],
  ];
  const cards = sheets.map(([html, pdf, title]) => `<article class="card"><header><h2>${esc(title)}</h2></header><p><a href="downloads/${html}">HTML</a> · <a href="downloads/${pdf}">PDF</a></p></article>`).join("");
  return pageShell("Cheat codes", "One-page sheets generated in this repo. They paraphrase public pages and link back. They are not vendor manuals.", `
    <div class="grid cards">${cards}</div>
    <h2>Decks and the full pack</h2>
    <p><a href="downloads/flashcards.json">Flashcard JSON</a> · <a href="downloads/cxone-offline-pack.json">Offline pack JSON</a></p>
    <p>The top-bar download builds a fresh pack from the tracks loaded in this browser, including anything you have not opened yet.</p>
    <p class="muted">Each file carries the CypherMonkey footer. No LinkedIn. No email address.</p>`);
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

export async function renderUniversity(path, manifest, reduced) {
  if (path === "#/atlas" || path === "#/ports") return { html: await viewAtlas(reduced), active: "atlas", bind: null };
  if (path === "#/roadmap") return { html: await viewRoadmap(manifest), active: "roadmap", bind: null };
  if (path === "#/explorer") return { html: await viewExplorer(reduced), active: "explorer", bind: null };
  if (path === "#/play") {
    const html = await viewPlay();
    return { html, active: "play", bind: async () => bindPlay(await loadAtlas()) };
  }
  if (path === "#/downloads") return { html: await viewDownloads(), active: "downloads", bind: null };
  if (path === "#/sandbox") return { html: await viewSandbox(), active: "sandbox", bind: () => bindSandbox(reduced) };
  if (path === "#/progress") return { html: await viewProgress(manifest), active: "progress", bind: null };
  const atlas = await loadAtlas();
  const html = generic(atlas, path.replace(/^#\//, ""));
  if (!html) return null;
  return { html, active: "atlas", bind: null };
}

export function bootUniversity({ downloadPack, reducedMotion, tone }) {
  const dock = document.getElementById("mascot-dock");
  let pose = 0;
  const applyPose = () => {
    if (!dock) return;
    dock.dataset.pose = POSES[pose % POSES.length];
  };
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
  startReel(reduced);
  const hero = document.querySelector(".hero");
  if (!hero || reduced) return;
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.transform = `translate3d(${x * 8}px, ${y * 6}px, 0)`;
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
