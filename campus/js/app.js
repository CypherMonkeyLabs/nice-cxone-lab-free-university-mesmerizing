import { ACTION_CATALOG, overallPriority, proficiencyEligible, validateScript } from "./model.mjs";
import { award, bootUniversity, buildPack, decorateHome, homeExtra, lessonAside, renderUniversity, signalCounts, syncStudyBadges, trackFloor } from "./university.mjs";
import { burst, decorateFloor } from "./effects.mjs";
import { counterRow } from "./charts.mjs";
import { flyOut, mountHero, unmountHero } from "./hero-scene.mjs";
import { mountIconScenes, unmountIconScenes } from "./icon-scenes.mjs";
import { bindTilt, isoIcon, progressRing } from "./icons.mjs";
import { bindLightbox } from "./lightbox.mjs";
import { bootLang, currentLang, ensureLessonMt, setLang, t, trLesson } from "./i18n.mjs";

const SETTINGS_KEY = "cxone-lab-settings";
const PROGRESS_KEY = "cxone-lab-progress";
const STUDIO_KEY = "cxone-lab-studio";

const NAV = [
  { href: "#/", id: "home", label: "Floor", dot: "a1" },
  { href: "#/diagrams", id: "diagrams", label: "Diagrams", dot: "a2" },
  { href: "#/flows", id: "flows", label: "Flows", dot: "a3" },
  { href: "#/charts", id: "charts", label: "Charts", dot: "a4" },
  { href: "#/downloads", id: "downloads", label: "Cheat Codes", dot: "a1" },
  { href: "#/play", id: "play", label: "Play", dot: "a2" },
  { href: "#/ecosystem", id: "ecosystem", label: "Ecosystem", dot: "a3" },
  { href: "#/downloads", id: "downloads-hub", label: "Downloads", dot: "a4" },
  { href: "#/careers", id: "careers", label: "Careers", dot: "a1" },
  { href: "#/regions", id: "regions", label: "Regions", dot: "a2" },
  { href: "#/tracks", id: "tracks", label: "Tracks", dot: "a2" },
  { href: "#/studio", id: "studio", label: "Studio builder", dot: "a3" },
  { href: "#/routing", id: "routing", label: "Routing simulator", dot: "a4" },
  { href: "#/topology", id: "topology", label: "3D topology", dot: "a1" },
  { href: "#/atlas", id: "atlas", label: "Ports atlas", dot: "a2" },
  { href: "#/explorer", id: "explorer", label: "Flow explorer", dot: "a3" },
  { href: "#/roadmap", id: "roadmap", label: "Roadmap", dot: "a4" },
  { href: "#/incidents", id: "incidents", label: "Boss incidents", dot: "a1" },
  { href: "#/interview", id: "interview", label: "Interview", dot: "a2" },
];

const state = {
  manifest: null,
  tracks: new Map(),
  extras: new Map(),
  timers: new Set(),
  reveal: null,
  flow: null,
  sim: null,
  audio: null,
  voices: [],
};

const settings = loadSettings();

function loadSettings() {
  const base = {
    theme: document.documentElement.dataset.theme || "dark",
    font: document.documentElement.dataset.font || "md",
    sound: "on",
    narration: "off",
    voice: "",
    rate: "1",
    motion: document.documentElement.dataset.motion || "full",
  };
  try {
    return Object.assign(base, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"));
  } catch (error) {
    return base;
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.dataset.font = settings.font;
  document.documentElement.dataset.motion = settings.motion;
  window.dispatchEvent(new Event("cxone-theme"));
}

function progress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function markLesson(id, patch) {
  const data = progress();
  data[id] = Object.assign({ quiz: 0, done: false }, data[id], patch);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch (error) {
    return "";
  }
  return "";
}

function citeLink(cite) {
  if (!cite) return "";
  const href = safeUrl(cite.url);
  if (!href) return esc(cite.title || "");
  return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(cite.title || href)}</a>`;
}

function clearTimers() {
  state.timers.forEach((id) => clearInterval(id));
  state.timers.clear();
  if (state.sim) state.sim.stop();
  state.sim = null;
  if (state.reveal) state.reveal.disconnect();
  state.reveal = null;
  if (window.speechSynthesis) speechSynthesis.cancel();
  if (state.topology) state.topology.unmountTopology();
  unmountHero();
  unmountIconScenes();
}

function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "vendor/three.min.js";
    script.onload = () => resolve(window.THREE);
    script.onerror = () => reject(new Error("Three.js did not load from vendor/three.min.js"));
    document.head.appendChild(script);
  });
}

function tone(freq, dur, type) {
  if (settings.sound !== "on") return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!state.audio) state.audio = new AudioCtx();
  const ctx = state.audio;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

function reducedMotion() {
  return settings.motion === "reduce" || document.documentElement.dataset.motion === "reduce";
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Could not load " + path);
  return response.json();
}

async function ensureManifest() {
  if (!state.manifest) state.manifest = await loadJSON("data/manifest.json");
  return state.manifest;
}

async function ensureTrack(id) {
  if (state.tracks.has(id)) return state.tracks.get(id);
  const manifest = await ensureManifest();
  const meta = manifest.tracks.find((track) => track.id === id);
  if (!meta) return null;
  const track = await loadJSON(meta.file);
  state.tracks.set(id, track);
  return track;
}

async function ensureExtra(name) {
  if (state.extras.has(name)) return state.extras.get(name);
  const manifest = await ensureManifest();
  const file = manifest.extras[name];
  const data = await loadJSON(file);
  state.extras.set(name, data);
  return data;
}

function parseHash() {
  const raw = location.hash || "#/";
  const splitAt = raw.indexOf("?");
  const path = splitAt === -1 ? raw : raw.slice(0, splitAt);
  const params = new URLSearchParams(splitAt === -1 ? "" : raw.slice(splitAt + 1));
  return { path, params };
}

function setMain(html) {
  clearTimers();
  const main = document.getElementById("main");
  main.innerHTML = html;
  if (!reducedMotion()) {
    main.classList.remove("arrive");
    void main.offsetWidth;
    main.classList.add("arrive");
  }
  const heading = main.querySelector("h1");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  bindTilt(main);
  bindLightbox(main);
  mountIconScenes(main);
  state.reveal = revealIn(main);
}

function revealIn(root) {
  if (!root || reducedMotion() || typeof IntersectionObserver !== "function") return null;
  const nodes = [...root.querySelectorAll(".card, .diagram-card, .lesson-block, .callout")];
  if (!nodes.length) return null;
  nodes.forEach((node) => node.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  nodes.forEach((node) => observer.observe(node));
  return observer;
}

function lessonCount(manifest) {
  return manifest.tracks.reduce((sum, track) => sum + track.lessonIds.length, 0);
}

function doneCount(manifest) {
  const data = progress();
  return manifest.tracks.reduce((sum, track) => (
    sum + track.lessonIds.filter((id) => data[`${track.id}/${id}`] && data[`${track.id}/${id}`].done).length
  ), 0);
}

function renderRail(active) {
  const nav = document.getElementById("rail-nav");
  nav.innerHTML = NAV.map((item) => (
    `<a href="${item.href}" data-nav="${item.id}" ${active === item.id ? 'aria-current="page"' : ""}><span class="dot ${item.dot}" aria-hidden="true"></span>${esc(item.label)}</a>`
  )).join("");
  const current = NAV.find((item) => item.id === active);
  document.body.dataset.view = active || "";
  document.querySelectorAll(".bottom [data-nav], .phone-links a, .study-menu a").forEach((node) => {
    if (current && node.getAttribute("href") === current.href) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
}

function figureMarkup(figure) {
  if (!figure) return "";
  if (figure.kind === "rings") {
    const rings = (figure.rings || []).map((ring, index) => {
      const size = 220 - index * 48;
      return `<div class="ring" style="width:${size}px;height:${size}px;border-color:var(--cc-accent-${(index % 4) + 1})"><strong>${esc(ring.label)}</strong><br><span class="muted">${esc(ring.note || "")}</span></div>`;
    }).join("");
    const agents = (figure.agents || []).map((agent) => `${esc(agent.name)} · proficiency ${esc(agent.prof)}`).join(" · ");
    return `<figure class="figure"><div class="bullseye" role="img" aria-label="${esc(figure.caption)}">${rings}</div><figcaption>${esc(figure.caption)}${agents ? " — " + agents : ""}</figcaption></figure>`;
  }
  const nodes = figure.nodes || [];
  const width = 760;
  const height = 230;
  const gap = width / (nodes.length + 1);
  const pos = {};
  nodes.forEach((node, index) => {
    pos[node.id] = {
      x: node.x != null ? (node.x / 100) * width : gap * (index + 1),
      y: node.y != null ? (node.y / 100) * height : height / 2,
    };
  });
  const colors = ["#3ecbff", "#ffb020", "#b09cff", "#3ee0a4"];
  const edges = (figure.edges || []).map((edge) => {
    const a = pos[edge.from];
    const b = pos[edge.to];
    if (!a || !b) return "";
    const mx = (a.x + b.x) / 2;
    const my = Math.min(a.y, b.y) - 28;
    return `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="var(--cc-accent-1)" stroke-width="2"/><text x="${mx}" y="${my + 14}" text-anchor="middle" fill="var(--cc-ink)" font-size="12">${esc(edge.label || "")}</text>`;
  }).join("");
  const shapes = nodes.map((node) => {
    const p = pos[node.id];
    const fill = colors[(node.tone || 1) - 1] || colors[0];
    return `<g><rect x="${p.x - 58}" y="${p.y - 28}" width="116" height="56" rx="12" fill="var(--cc-surface)" stroke="${fill}" stroke-width="2"/><text x="${p.x}" y="${p.y - 4}" text-anchor="middle" fill="var(--cc-ink)" font-size="13" font-family="Palatino, Georgia, serif">${esc(node.label)}</text><text x="${p.x}" y="${p.y + 14}" text-anchor="middle" fill="var(--cc-muted)" font-size="11">${esc(node.sub || "")}</text></g>`;
  }).join("");
  return `<figure class="figure"><svg class="live-fig" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(figure.caption)}"><title>${esc(figure.caption)}</title>${edges}${shapes}</svg><figcaption>${esc(figure.caption)}</figcaption></figure>`;
}

function flowMarkup(flow) {
  return `<section class="player" id="flow-player" data-index="0">
    <h2>${esc(flow.title)}</h2>
    <div class="controls">
      <button type="button" class="solid" id="flow-play">Play</button>
      <button type="button" class="ghost" id="flow-pause">Pause</button>
      <button type="button" class="ghost" id="flow-step">Step</button>
      <button type="button" class="ghost" id="flow-inspect">Inspect</button>
    </div>
    <div id="flow-canvas"></div>
    <div class="inspect" id="flow-detail" hidden></div>
  </section>`;
}

function drawFlow(flow, index) {
  const host = document.getElementById("flow-canvas");
  if (!host) return;
  const lanes = flow.lanes;
  const width = Math.max(680, lanes.length * 150);
  const row = 64;
  const height = 54 + flow.steps.length * row;
  const col = width / lanes.length;
  const xOf = (lane) => {
    const at = lanes.indexOf(lane);
    return (at + 0.5) * col;
  };
  let heads = lanes.map((lane, i) => `<text x="${(i + 0.5) * col}" y="22" text-anchor="middle" fill="var(--cc-accent-2)" font-size="13">${esc(lane)}</text><line x1="${(i + 0.5) * col}" y1="32" x2="${(i + 0.5) * col}" y2="${height - 8}" stroke="var(--cc-line)"/>`).join("");
  const steps = flow.steps.map((step, i) => {
    const y = 48 + i * row;
    const x1 = xOf(step.from);
    const x2 = xOf(step.to);
    const active = i === index;
    const color = active ? "var(--cc-focus)" : "var(--cc-accent-1)";
    const left = Math.min(x1, x2);
    const dir = x2 >= x1 ? 1 : -1;
    return `<line x1="${x1}" y1="${y}" x2="${x2 - dir * 8}" y2="${y}" stroke="${color}" stroke-width="${active ? 3 : 1.5}"/><polygon points="${x2},${y} ${x2 - dir * 10},${y - 5} ${x2 - dir * 10},${y + 5}" fill="${color}"/><text x="${(left + Math.max(x1, x2)) / 2}" y="${y - 8}" text-anchor="middle" fill="var(--cc-ink)" font-size="12">${esc(step.label)}</text>`;
  }).join("");
  host.innerHTML = `<div class="ladder"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(flow.title)}, step ${index + 1} of ${flow.steps.length}">${heads}${steps}</svg></div>`;
}

function bindFlow(flow) {
  const player = document.getElementById("flow-player");
  if (!player) return;
  let index = 0;
  drawFlow(flow, index);
  const show = (inspect) => {
    const step = flow.steps[index];
    const detail = document.getElementById("flow-detail");
    detail.hidden = false;
    const rows = Object.entries(step.inspect || {}).map(([key, value]) => `<div><b>${esc(key)}</b> ${esc(value)}</div>`).join("");
    detail.innerHTML = `<p>${esc(step.detail)}</p>${rows}`;
    if (inspect) detail.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  };
  const stepForward = () => {
    index = (index + 1) % flow.steps.length;
    player.dataset.index = String(index);
    drawFlow(flow, index);
    show(false);
    tone(520 + index * 30, 0.08, "triangle");
  };
  document.getElementById("flow-step").addEventListener("click", stepForward);
  document.getElementById("flow-inspect").addEventListener("click", () => show(true));
  document.getElementById("flow-play").addEventListener("click", () => {
    if (state.flow) return;
    const id = setInterval(stepForward, reducedMotion() ? 1600 : 1100);
    state.timers.add(id);
    state.flow = id;
  });
  document.getElementById("flow-pause").addEventListener("click", () => {
    if (state.flow) {
      clearInterval(state.flow);
      state.timers.delete(state.flow);
      state.flow = null;
    }
  });
}

function quizMarkup(lesson) {
  const blocks = lesson.quiz.map((item, index) => {
    const choices = item.choices.map((choice, choiceIndex) => (
      `<label class="choice"><input type="radio" name="q${index}" value="${choiceIndex}"> <span>${esc(choice)}</span></label>`
    )).join("");
    return `<fieldset><legend>Question ${index + 1}. ${esc(item.q)}</legend>${choices}</fieldset>`;
  }).join("");
  return `<section class="quiz"><h2>Quiz</h2><form id="quiz-form">${blocks}<button class="solid" type="submit">Check answers</button><p class="status" id="quiz-status" role="status"></p><div id="quiz-why"></div></form></section>`;
}

function bindQuiz(trackId, lesson) {
  const form = document.getElementById("quiz-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let correct = 0;
    const why = lesson.quiz.map((item, index) => {
      const selected = form.querySelector(`input[name="q${index}"]:checked`);
      const value = selected ? Number(selected.value) : -1;
      const ok = value === item.answer;
      if (ok) correct += 1;
      return `<div class="callout ${ok ? "ok" : "danger"}"><strong>${ok ? "Correct" : "Review"} · Q${index + 1}.</strong> ${esc(item.why)} Source: ${citeLink(item.cite)}</div>`;
    }).join("");
    document.getElementById("quiz-why").innerHTML = why;
    const status = document.getElementById("quiz-status");
    status.textContent = `${correct} of ${lesson.quiz.length} correct.`;
    markLesson(`${trackId}/${lesson.id}`, { quiz: correct, done: true });
    syncStudyBadges();
    if (correct === lesson.quiz.length) burst();
    tone(correct === lesson.quiz.length ? 660 : 220, 0.15, "sine");
  });
}

function cardsMarkup(cards) {
  const first = cards[0];
  return `<section><h2>Flashcards</h2><p class="muted" id="card-count">Card 1 of ${cards.length}</p><button type="button" class="card card-flip" id="card-face"><strong>${esc(first.front)}</strong><p>Show the answer</p></button><div class="row"><button type="button" class="ghost" id="card-prev">Previous</button><button type="button" class="ghost" id="card-next">Next</button></div></section>`;
}

function bindCards(cards) {
  let index = 0;
  let show = false;
  const face = document.getElementById("card-face");
  const previous = document.getElementById("card-prev");
  const next = document.getElementById("card-next");
  if (!face || !previous || !next) return;
  const paint = () => {
    const card = cards[index];
    document.getElementById("card-count").textContent = `Card ${index + 1} of ${cards.length}`;
    face.innerHTML = show
      ? `<strong>${esc(card.front)}</strong><p>${esc(card.back)}</p>`
      : `<strong>${esc(card.front)}</strong><p>Show the answer</p>`;
  };
  face.addEventListener("click", () => { show = !show; paint(); });
  previous.addEventListener("click", () => {
    index = (index - 1 + cards.length) % cards.length;
    show = false;
    paint();
  });
  next.addEventListener("click", () => {
    index = (index + 1) % cards.length;
    show = false;
    paint();
  });
}

function presentLesson(track, lesson) {
  const key = `${track.id}/${lesson.id}`;
  return {
    title: trLesson(key, "title", lesson.title),
    summary: trLesson(key, "summary", lesson.summary),
    headings: lesson.sections.map((section, index) => trLesson(key, "h", section.h, index)),
    mt: currentLang() !== "en",
  };
}

function mtNote(shown) {
  if (!shown) return "";
  return `<p class="mt-note">${esc(t("mt"))}</p>`;
}

function lessonView(track, lesson) {
  const index = track.lessons.findIndex((item) => item.id === lesson.id);
  const prev = track.lessons[index - 1];
  const next = track.lessons[index + 1];
  const shown = presentLesson(track, lesson);
  const uncertain = (lesson.uncertain || []).map((note) => `<div class="callout danger"><strong>Marked uncertain.</strong> ${esc(note)}</div>`).join("");
  const sections = lesson.sections.map((section, index) => `
    <section class="lesson-block" style="padding:12px 14px;margin:12px 0">
      <h2>${esc(shown.headings[index])}</h2>
      ${section.p.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
      <p class="sources">Source: ${(section.cites || []).map(citeLink).join(" · ")}</p>
    </section>`).join("");
  const faults = lesson.faults.map((fault) => `
    <article class="callout danger">
      <h3>${esc(fault.title)}</h3>
      <p><strong>Symptom.</strong> ${esc(fault.symptom)}</p>
      <pre class="log">${esc(fault.log)}</pre>
      <p><strong>Cause.</strong> ${esc(fault.cause)}</p>
      <p><strong>Fix.</strong> ${esc(fault.fix)}</p>
      <p class="sources">Source: ${citeLink(fault.cite)}</p>
    </article>`).join("");
  const labSteps = lesson.lab.steps.map((step) => `<li>${esc(step)}</li>`).join("");
  return `
    <div class="read-layout"><article>
    <nav class="crumbs" aria-label="Breadcrumb" id="lesson-top"><a href="#/">Floor</a> · <a href="#/tracks">Tracks</a> · <a href="#/track/${esc(track.id)}">${esc(track.title)}</a> · ${esc(shown.title)}</nav>
    <p class="muted">${esc(lesson.level)} · ${esc(lesson.minutes)} min</p>
    <h1>${esc(shown.title)}</h1>
    ${mtNote(shown.mt)}
    <p class="lede">${esc(shown.summary)}</p>
    <div class="chips">${lesson.objectives.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div>
    ${figureMarkup(lesson.figure)}
    ${uncertain}
    ${sections}
    ${flowMarkup(lesson.flow)}
    <section id="lab-block">
      <h2>Lab · ${esc(lesson.lab.title)}</h2>
      <p>${esc(lesson.lab.goal)}</p>
      <ol>${labSteps}</ol>
      <p class="muted">${esc(lesson.lab.done)}</p>
    </section>
    <section id="fault-block"><h2>Fault and fix</h2>${faults}<p class="muted">Logs on this floor are synthetic classroom traces.</p></section>
    <div id="card-block">${cardsMarkup(lesson.cards)}</div>
    <div id="quiz-block">${quizMarkup(lesson)}</div>
    <div class="row">
      ${prev ? `<a class="icon-btn" rel="prev" href="#/lesson/${esc(track.id)}/${esc(prev.id)}">Previous</a>` : ""}
      ${next ? `<a class="icon-btn" rel="next" href="#/lesson/${esc(track.id)}/${esc(next.id)}">Next lesson</a>` : `<a class="icon-btn" href="#/track/${esc(track.id)}">Back to track</a>`}
      <button type="button" class="ghost" id="narrate">Read this lesson</button>
    </div>
    </article>${lessonAside(lesson)}</div>`;
}

function bindNarration(lesson) {
  const button = document.getElementById("narrate");
  if (!button) return;
  button.addEventListener("click", async () => {
    if (!window.speechSynthesis) {
      button.textContent = "This browser has no speech synthesis.";
      return;
    }
    speechSynthesis.cancel();
    const text = [lesson.title, lesson.summary].concat(lesson.sections.flatMap((section) => [section.h].concat(section.p))).join(". ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = Number(settings.rate) || 1;
    const voices = await loadVoices();
    const chosen = voices.find((voice) => voice.voiceURI === settings.voice);
    if (chosen) utter.voice = chosen;
    else if (edgeOnly(voices)) {
      document.getElementById("quiz-status") || button.insertAdjacentHTML("afterend", `<p class="callout">Narration is waiting for a voice choice. Open Settings and pick a voice. This floor will not silently start on a robotic Edge voice.</p>`);
      return;
    }
    speechSynthesis.speak(utter);
  });
}

function edgeOnly(voices) {
  if (!voices.length) return false;
  return voices.every((voice) => /edge/i.test(voice.name) && !/natural|neural/i.test(voice.name));
}

function rankVoice(voice) {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  let score = 0;
  if (/natural|neural|premium|enhanced/.test(name)) score += 40;
  if (/samantha|daniel|karen|moira|serena|allison|google|ava|nicky/.test(name)) score += 18;
  if (voice.lang && voice.lang.toLowerCase().startsWith("en")) score += 10;
  if (voice.localService) score += 2;
  if (/edge|microsoft/.test(name) && !/natural|neural/.test(name)) score -= 60;
  return score;
}

function loadVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve([]);
    const existing = synth.getVoices();
    if (existing.length) return resolve(existing);
    const finish = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", finish, { once: true });
    setTimeout(finish, 1200);
  });
}

function trackCard(track, withProgress) {
  const data = progress();
  const finished = track.lessonIds.filter((id) => data[`${track.id}/${id}`] && data[`${track.id}/${id}`].done).length;
  const pct = track.lessonIds.length ? Math.round((finished / track.lessonIds.length) * 100) : 0;
  const meter = withProgress ? progressRing(pct) : "";
  const bar = withProgress ? `<div class="bar" aria-hidden="true"><span style="width:${pct}%"></span></div><p class="studied">${finished} studied</p>` : "";
  return `<a class="card holo accent-${track.accent}" href="#/track/${esc(track.id)}"><canvas class="icon-live" data-icon-kind="${esc(track.id)}" width="160" height="128" aria-hidden="true"></canvas><div class="iso-wrap">${isoIcon(track.id)}</div><header><h2>${esc(track.title)}</h2>${meter}<span class="chip">${track.lessonIds.length}</span></header><p>${esc(track.blurb)}</p>${bar}</a>`;
}

async function viewHome() {
  const manifest = await ensureManifest();
  const total = lessonCount(manifest);
  const done = doneCount(manifest);
  const counts = await signalCounts();
  const extra = await homeExtra(manifest, done, total);
  const poses = ["still", "wave", "think", "headset", "cheer"].map((pose) => (
    `<button type="button" data-pose-set="${pose}">${pose}</button>`
  )).join("");
  const cards = manifest.tracks.map((track) => trackCard(track, true)).join("");
  setMain(`
    <section class="hero-stage">
      <canvas id="hero-webgl" aria-label="Orbit of a contact moving through script, skill, agent, workforce, quality, and API"></canvas>
      <div class="hero-fallback" hidden>
        <div class="orbit-fallback" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
        <p>Flat drawing. Motion is reduced, or this browser has no WebGL.</p>
      </div>
      <div class="hero-sheet">
        <div class="hero-glass">
          <p class="chip">${esc(t("greeting"))}</p>
          <h1>${esc(t("hero"))}</h1>
          <p class="ticker" id="study-clock" aria-live="polite"></p>
        </div>
        <div class="hero-counters">
          ${counterRow([
            { value: total, label: "lessons" },
            { value: manifest.tracks.length, label: "tracks" },
            { value: done, label: "studied" },
            { value: counts.diagrams, label: "diagrams" },
            { value: counts.flows, label: "flows" },
            { value: counts.charts, label: "charts" },
          ])}
        </div>
      </div>
    </section>
    <h2 class="fold-label">Tracks</h2>
    <div class="grid cards fold-grid">${cards}</div>
    <section class="hero-follow">
      <div class="pose-strip" aria-label="Mascot variations">${poses}</div>
      <p class="lede">${esc(t("lede"))}</p>
      <p class="muted">${esc(t("note"))}</p>
    </section>
    <div id="home-extra">${extra}</div>
    <p class="muted">${done} of ${total} lessons marked studied. ${esc(manifest.honesty)}</p>
    <div class="tape" aria-hidden="true"><span>${esc(manifest.tape)} &nbsp; ${esc(manifest.tape)} &nbsp;</span></div>`);
  renderRail("home");
  decorateHome(reducedMotion());
  const clock = document.getElementById("study-clock");
  const tick = () => {
    if (!clock || !clock.isConnected) return;
    clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  tick();
  state.timers.add(setInterval(tick, 1000));
  mountHero(document.getElementById("hero-webgl"));
}

async function viewTracks() {
  const manifest = await ensureManifest();
  const cards = manifest.tracks.map((track) => trackCard(track, true)).join("");
  setMain(`<h1>Tracks</h1><p class="lede">Sixteen paths from prerequisites through migration. Open one track at a time; lesson bodies load with that track.</p><div class="grid cards">${cards}</div>`);
  renderRail("tracks");
}

async function viewTrack(id) {
  const track = await ensureTrack(id);
  if (!track) return viewMissing();
  const data = progress();
  const items = track.lessons.map((lesson, index) => {
    const done = data[`${track.id}/${lesson.id}`] && data[`${track.id}/${lesson.id}`].done;
    const shown = presentLesson(track, lesson);
    return `<a class="card holo" href="#/lesson/${esc(track.id)}/${esc(lesson.id)}"><header><h2>${index + 1}. ${esc(shown.title)}</h2><span class="chip">${done ? "Studied" : esc(lesson.level)}</span></header><p>${esc(shown.summary)}</p></a>`;
  }).join("");
  const banner = currentLang() === "en" ? "" : mtNote(true);
  setMain(`<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Floor</a> · <a href="#/tracks">Tracks</a> · ${esc(track.title)}</nav><div class="track-hero"><canvas class="icon-live" data-icon-kind="${esc(track.id)}" width="160" height="128" aria-hidden="true"></canvas><div class="iso-wrap">${isoIcon(track.id)}</div><div><h1>${esc(track.title)}</h1><p class="lede">${esc(track.blurb)}</p>${banner}</div></div><div id="track-floor">${await trackFloor(track)}</div><div class="grid cards">${items}</div>`);
  renderRail("tracks");
  decorateFloor(document.getElementById("main"));
}

async function viewLesson(trackId, lessonId) {
  const track = await ensureTrack(trackId);
  const lesson = track && track.lessons.find((item) => item.id === lessonId);
  if (!lesson) return viewMissing();
  setMain(lessonView(track, lesson));
  bindFlow(lesson.flow);
  bindQuiz(track.id, lesson);
  bindCards(lesson.cards);
  bindNarration(lesson);
  renderRail("tracks");
  if (settings.narration === "on") document.getElementById("narrate").click();
}

function viewMissing() {
  setMain(`<h1>That path is not on the floor</h1><p>The link does not match a track, lesson, or tool. Head back to the floor or the track list.</p><p><a href="#/">Floor</a> · <a href="#/tracks">Tracks</a></p>`);
  renderRail("home");
}

function defaultScript() {
  return {
    actions: [
      { id: "b1", type: "BEGIN", caption: "Begin", x: 40, y: 40, branches: 1 },
      { id: "m1", type: "MENU", caption: "Main menu", x: 250, y: 40, branches: 2, variable: "choice" },
      { id: "r1", type: "REQAGENT", caption: "Sales", x: 480, y: 20, skill: "Sales_IB", high: 1, low: 5 },
      { id: "mu", type: "MUSIC", caption: "90 seconds", x: 700, y: 20, seconds: 90 },
      { id: "u1", type: "UPDATECONTACT", caption: "Widen", x: 700, y: 180, high: 1, low: 8 },
      { id: "w1", type: "WAIT", caption: "Wait", x: 480, y: 180 },
    ],
    links: [
      { from: "b1", to: "m1", label: "start" },
      { from: "m1", to: "r1", label: "1 sales" },
      { from: "r1", to: "mu", label: "queue" },
      { from: "mu", to: "u1", label: "after 90s" },
      { from: "u1", to: "w1", label: "pool 1–8" },
    ],
  };
}

function loadStudio() {
  try {
    const saved = JSON.parse(localStorage.getItem(STUDIO_KEY) || "null");
    if (saved && saved.actions) return saved;
  } catch (error) {
    return defaultScript();
  }
  return defaultScript();
}

function viewStudio() {
  const script = loadStudio();
  const palette = ACTION_CATALOG.map((action) => (
    `<button type="button" class="ghost" data-add="${esc(action.type)}">${esc(action.type)}<br><span class="muted">${esc(action.group)}</span></button>`
  )).join("");
  setMain(`
    <h1>Studio-style script builder</h1>
    <p class="lede">A learning canvas for the actions named in NiCE Studio help. Export is a lab file, not a Studio import.</p>
    <div class="callout">This builder does not claim to emit proprietary Studio script XML or JSON. NiCE does not document the on-canvas file as a public import format on the pages cited here.</div>
    <div class="studio">
      <div class="palette">
        <strong>Actions</strong>
        ${palette}
        <button type="button" class="ghost" id="studio-sample">Load Classics sample</button>
        <button type="button" class="ghost" id="studio-clear">Clear</button>
      </div>
      <div>
        <div class="canvas-wrap" id="studio-canvas"></div>
        <div class="row" style="margin-top:8px">
          <button type="button" class="solid" id="studio-validate">Validate</button>
          <button type="button" class="ghost" id="studio-export">Export lab JSON</button>
          <p class="status" id="link-hint">Select Connect on an action, then choose the next action.</p>
        </div>
        <pre class="log" id="studio-out" hidden></pre>
      </div>
      <div class="inspector" id="studio-inspector"><p class="muted">Select an action.</p></div>
    </div>`);
  renderRail("studio");
  bindStudio(script);
}

function bindStudio(script) {
  let selected = script.actions[0] ? script.actions[0].id : null;
  let arm = null;
  const canvas = document.getElementById("studio-canvas");
  function persist() {
    localStorage.setItem(STUDIO_KEY, JSON.stringify(script));
  }
  function paint() {
    const lines = script.links.map((link) => {
      const from = script.actions.find((action) => action.id === link.from);
      const to = script.actions.find((action) => action.id === link.to);
      if (!from || !to) return "";
      const x1 = from.x + 150;
      const y1 = from.y + 28;
      const x2 = to.x;
      const y2 = to.y + 28;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3ecbff" stroke-width="2"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" fill="#d7f3ff" font-size="11">${esc(link.label || "")}</text>`;
    }).join("");
    const nodes = script.actions.map((action) => `
      <article class="s-node ${action.id === selected ? "selected" : ""}" style="left:${action.x}px;top:${action.y}px" data-id="${esc(action.id)}">
        <header>${esc(action.type)}</header>
        <div>${esc(action.caption || "")}</div>
        <div class="row">
          <button type="button" data-connect="${esc(action.id)}">Connect</button>
          <button type="button" data-select="${esc(action.id)}">Edit</button>
        </div>
      </article>`).join("");
    canvas.innerHTML = `<svg class="links" viewBox="0 0 980 640" preserveAspectRatio="none">${lines}</svg>${nodes}`;
    canvas.querySelectorAll("[data-select]").forEach((button) => {
      button.addEventListener("click", () => {
        selected = button.dataset.select;
        if (arm && arm !== selected) {
          script.links.push({ from: arm, to: selected, label: "next" });
          arm = null;
          document.getElementById("link-hint").textContent = "Connector added.";
          persist();
        }
        paint();
        inspect();
      });
    });
    canvas.querySelectorAll("[data-connect]").forEach((button) => {
      button.addEventListener("click", () => {
        arm = button.dataset.connect;
        document.getElementById("link-hint").textContent = "Now choose the action that should run next.";
      });
    });
  }
  function inspect() {
    const action = script.actions.find((item) => item.id === selected);
    const host = document.getElementById("studio-inspector");
    if (!action) {
      host.innerHTML = "<p class='muted'>Select an action.</p>";
      return;
    }
    const catalog = ACTION_CATALOG.find((item) => item.type === action.type);
    host.innerHTML = `
      <h2>${esc(action.type)}</h2>
      <p>${esc(catalog ? catalog.summary : "")}</p>
      <label>Caption <input id="cap" value="${esc(action.caption || "")}"></label>
      ${action.type === "REQAGENT" ? `<label>Skill <input id="skill" value="${esc(action.skill || "")}"></label><label>High proficiency <input id="high" type="number" min="1" max="20" value="${esc(action.high || 1)}"></label><label>Low proficiency <input id="low" type="number" min="1" max="20" value="${esc(action.low || 5)}"></label>` : ""}
      ${action.type === "UPDATECONTACT" ? `<label>High proficiency <input id="high" type="number" min="1" max="20" value="${esc(action.high || 1)}"></label><label>Low proficiency <input id="low" type="number" min="1" max="20" value="${esc(action.low || 8)}"></label>` : ""}
      ${action.type === "MENU" ? `<label>Branches <input id="branches" type="number" min="1" max="9" value="${esc(action.branches || 2)}"></label><label>Variable <input id="variable" value="${esc(action.variable || "choice")}"></label>` : ""}
      ${action.type === "MUSIC" ? `<label>Seconds <input id="seconds" type="number" min="1" value="${esc(action.seconds || 90)}"></label>` : ""}
      <button type="button" class="solid" id="apply-node">Apply</button>
      <button type="button" class="ghost" id="delete-node">Remove</button>
      <p class="sources">${catalog ? `<a href="${esc(catalog.cite)}" target="_blank" rel="noopener noreferrer">Action help</a>` : ""}</p>`;
    document.getElementById("apply-node").addEventListener("click", () => {
      action.caption = document.getElementById("cap").value;
      ["skill", "high", "low", "branches", "variable", "seconds"].forEach((key) => {
        const input = document.getElementById(key);
        if (input) action[key] = input.type === "number" ? Number(input.value) : input.value;
      });
      persist();
      paint();
      tone(600, 0.06, "sine");
    });
    document.getElementById("delete-node").addEventListener("click", () => {
      script.actions = script.actions.filter((item) => item.id !== action.id);
      script.links = script.links.filter((link) => link.from !== action.id && link.to !== action.id);
      selected = script.actions[0] ? script.actions[0].id : null;
      persist();
      paint();
      inspect();
    });
  }
  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.add;
      const id = type.slice(0, 2).toLowerCase() + Math.floor(Math.random() * 1000);
      script.actions.push({
        id,
        type,
        caption: type,
        x: 40 + (script.actions.length % 5) * 40,
        y: 80 + (script.actions.length % 6) * 36,
        branches: type === "MENU" ? 2 : 1,
        high: 1,
        low: type === "UPDATECONTACT" ? 8 : 5,
        skill: "",
        variable: "choice",
        seconds: 90,
      });
      selected = id;
      persist();
      paint();
      inspect();
    });
  });
  document.getElementById("studio-sample").addEventListener("click", () => {
    const sample = defaultScript();
    script.actions = sample.actions;
    script.links = sample.links;
    selected = "b1";
    persist();
    paint();
    inspect();
  });
  document.getElementById("studio-clear").addEventListener("click", () => {
    script.actions = [];
    script.links = [];
    selected = null;
    persist();
    paint();
    inspect();
  });
  document.getElementById("studio-validate").addEventListener("click", () => {
    const issues = validateScript(script);
    const out = document.getElementById("studio-out");
    out.hidden = false;
    out.textContent = issues.map((issue) => `${issue.level.toUpperCase()}: ${issue.text}`).join("\n");
    tone(issues.some((issue) => issue.level === "error") ? 180 : 700, 0.12, "square");
  });
  document.getElementById("studio-export").addEventListener("click", () => {
    const payload = {
      labSchema: "cxone-lab.studio/1",
      notOfficialStudioExport: true,
      note: "Learning model for the NICE CXone Lab. Not a documented Studio import file.",
      actions: script.actions,
      links: script.links,
    };
    const out = document.getElementById("studio-out");
    out.hidden = false;
    out.textContent = JSON.stringify(payload, null, 2);
    award("studio");
  });
  paint();
  inspect();
}

function freshSim() {
  return {
    running: false,
    timer: null,
    seconds: 0,
    initial: 4,
    acceleration: 1,
    maximum: 1000,
    high: 1,
    low: 5,
    expandAt: 90,
    expandLow: 8,
    mode: "inbound",
    agents: [
      { name: "Amina", prof: 2, idle: 40, busy: 0 },
      { name: "Luis", prof: 6, idle: 12, busy: 0 },
      { name: "Noor", prof: 4, idle: 25, busy: 0 },
      { name: "Eli", prof: 9, idle: 55, busy: 0 },
    ],
    queue: [],
    log: ["Synthetic floor. Names are not real agents."],
  };
}

function viewRouting() {
  setMain(`
    <h1>Routing simulator</h1>
    <p class="lede">Watch the documented priority formula and a bullseye proficiency window. Longest-idle is this classroom's tie-break, not a claim about every production delivery mode.</p>
    <div class="sim">
      <form id="sim-form" class="form-grid">
        <label>Mode
          <select name="mode"><option value="inbound">Inbound queue</option><option value="pc">Personal Connection</option></select>
        </label>
        <label>Initial priority <input name="initial" type="number" value="4"></label>
        <label>Acceleration <input name="acceleration" type="number" step="0.1" value="1"></label>
        <label>Maximum priority <input name="maximum" type="number" value="1000"></label>
        <label>Opening high proficiency <input name="high" type="number" value="1" min="1" max="20"></label>
        <label>Opening low proficiency <input name="low" type="number" value="5" min="1" max="20"></label>
        <label>Widen after seconds <input name="expandAt" type="number" value="90"></label>
        <label>Widened low proficiency <input name="expandLow" type="number" value="8"></label>
        <div class="row">
          <button class="solid" type="button" id="sim-play">Play</button>
          <button class="ghost" type="button" id="sim-pause">Pause</button>
          <button class="ghost" type="button" id="sim-step">Step</button>
          <button class="ghost" type="button" id="sim-reset">Reset</button>
        </div>
        <p class="muted">Worked example from help: initial 4 and acceleration 1 reaches priority 7 after three minutes. Personal Connection skills set acceleration to 0 because there is no contact queue.</p>
      </form>
      <div>
        <p id="sim-clock" class="chip">t = 0s</p>
        <div class="agents" id="sim-agents"></div>
        <h2>Queue</h2>
        <div id="sim-queue"></div>
        <h2>Decision trace</h2>
        <pre class="log" id="sim-log"></pre>
      </div>
    </div>`);
  renderRail("routing");
  const sim = freshSim();
  state.sim = {
    stop() {
      sim.running = false;
      if (sim.timer) clearInterval(sim.timer);
      sim.timer = null;
    },
  };
  const paint = () => {
    document.getElementById("sim-clock").textContent = `t = ${sim.seconds}s · mode ${sim.mode}`;
    document.getElementById("sim-agents").innerHTML = sim.agents.map((agent) => {
      const windowLow = sim.seconds >= sim.expandAt ? sim.expandLow : sim.low;
      const eligible = proficiencyEligible(agent.prof, sim.high, windowLow);
      return `<article class="agent"><div><strong>${esc(agent.name)}</strong><br><span class="muted">proficiency ${agent.prof} · idle ${agent.idle}s ${agent.busy ? "· on contact" : ""}</span></div><span class="chip">${eligible && !agent.busy ? "in window" : "out"}</span></article>`;
    }).join("");
    document.getElementById("sim-queue").innerHTML = sim.queue.map((contact) => {
      const minutes = contact.wait / 60;
      const accel = sim.mode === "pc" ? 0 : sim.acceleration;
      const priority = overallPriority(sim.initial, accel, minutes, sim.maximum);
      return `<p class="chip">${esc(contact.id)} wait ${contact.wait}s · priority ${priority.toFixed(2)}</p>`;
    }).join("") || "<p class='muted'>Queue is empty.</p>";
    document.getElementById("sim-log").textContent = sim.log.slice(-12).join("\n");
  };
  function readForm() {
    const form = document.getElementById("sim-form");
    const data = new FormData(form);
    sim.mode = data.get("mode");
    sim.initial = Number(data.get("initial"));
    sim.acceleration = Number(data.get("acceleration"));
    sim.maximum = Number(data.get("maximum"));
    sim.high = Number(data.get("high"));
    sim.low = Number(data.get("low"));
    sim.expandAt = Number(data.get("expandAt"));
    sim.expandLow = Number(data.get("expandLow"));
  }
  function tick() {
    readForm();
    sim.seconds += 15;
    sim.agents.forEach((agent) => {
      if (agent.busy > 0) {
        agent.busy -= 15;
        if (agent.busy <= 0) {
          agent.busy = 0;
          agent.idle = 0;
        }
      } else agent.idle += 15;
    });
    sim.queue.forEach((contact) => { contact.wait += 15; });
    if (sim.mode === "inbound" && sim.seconds % 30 === 0) {
      sim.queue.push({ id: "C" + sim.seconds, wait: 0 });
    }
    if (sim.mode === "pc") {
      sim.log.push(`${sim.seconds}s Personal Connection acceleration forced to 0 in this model. There is no contact queue to age.`);
    }
    const accel = sim.mode === "pc" ? 0 : sim.acceleration;
    const low = sim.seconds >= sim.expandAt ? sim.expandLow : sim.low;
    sim.queue.sort((a, b) => overallPriority(sim.initial, accel, b.wait / 60, sim.maximum) - overallPriority(sim.initial, accel, a.wait / 60, sim.maximum));
    const next = sim.queue[0];
    if (next) {
      const eligible = sim.agents.filter((agent) => !agent.busy && proficiencyEligible(agent.prof, sim.high, low));
      eligible.sort((a, b) => b.idle - a.idle);
      const priority = overallPriority(sim.initial, accel, next.wait / 60, sim.maximum);
      if (eligible.length) {
        const agent = eligible[0];
        agent.busy = 45;
        sim.queue.shift();
        sim.log.push(`${sim.seconds}s ${next.id} priority ${priority.toFixed(2)} window ${sim.high}–${low} → ${agent.name} (prof ${agent.prof}, idle tie-break)`);
        tone(640, 0.08, "triangle");
      } else {
        sim.log.push(`${sim.seconds}s ${next.id} priority ${priority.toFixed(2)} waits. No available agent inside ${sim.high}–${low}.`);
      }
    }
    paint();
  }
  document.getElementById("sim-step").addEventListener("click", () => {
    award("sim");
    tick();
  });
  document.getElementById("sim-play").addEventListener("click", () => {
    if (sim.running) return;
    sim.running = true;
    sim.timer = setInterval(tick, reducedMotion() ? 1400 : 800);
    state.timers.add(sim.timer);
  });
  document.getElementById("sim-pause").addEventListener("click", () => state.sim.stop());
  document.getElementById("sim-reset").addEventListener("click", () => {
    state.sim.stop();
    const fresh = freshSim();
    Object.assign(sim, fresh);
    paint();
  });
  paint();
}

async function viewTopology() {
  const topoModule = await import("./topology.js");
  state.topology = topoModule;
  const { failureCopy, nodeList } = topoModule;
  const failures = failureCopy();
  const toggles = Object.keys(failures).map((id) => (
    `<label class="choice"><input type="checkbox" value="${esc(id)}"> ${esc(id)}</label>`
  )).join("");
  const list = nodeList().map((label) => `<li>${esc(label)}</li>`).join("");
  setMain(`
    <h1>3D topology</h1>
    <p class="lede">Orbit the floor. Toggle a failure to turn that path red. Drag to orbit, scroll to dolly. Reduced motion keeps the text map.</p>
    <div class="topo-wrap">
      <div>
        <canvas id="topo" aria-label="Three-dimensional map of a NiCE CXone contact path"></canvas>
        <div class="fallback-map" id="topo-fallback" hidden>
          <h2>Flat map</h2>
          <ul>${list}</ul>
          <p id="fallback-note"></p>
        </div>
      </div>
      <form id="topo-form">
        <h2>Failure toggles</h2>
        ${toggles}
        <p id="topo-copy" class="muted">No failure forced.</p>
        <p class="sources"><a href="https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm">Bullseye</a> · <a href="https://help.nicecxone.com/Content/recording/managerecordings.htm">Recording</a> · <a href="https://help.nicecxone.com/content/workforcemanagement/ciscoucce.htm">UCCE connector</a></p>
      </form>
    </div>`);
  renderRail("topology");
  const canvas = document.getElementById("topo");
  const reduced = reducedMotion();
  let mounted = { ok: false };
  if (!reduced) {
    try {
      await loadThree();
      mounted = topoModule.mountTopology(canvas, false);
    } catch (error) {
      mounted = { ok: false };
    }
  }
  const fallback = document.getElementById("topo-fallback");
  if (!mounted.ok) {
    canvas.hidden = true;
    fallback.hidden = false;
  }
  const form = document.getElementById("topo-form");
  const apply = () => {
    const active = [...form.querySelectorAll("input:checked")].map((input) => input.value);
    if (mounted.ok) mounted.setFailures(active);
    const copy = active.map((id) => failures[id].text).join(" ");
    document.getElementById("topo-copy").textContent = copy || "No failure forced.";
    const note = document.getElementById("fallback-note");
    if (note) note.textContent = copy;
  };
  form.addEventListener("change", apply);
}

async function viewEcosystem() {
  const glossary = await ensureExtra("glossary");
  const terms = glossary.map((item) => `<article class="card"><header><h2>${esc(item.term)}</h2></header><p>${esc(item.meaning)}</p><p class="sources">${citeLink(item.cite)}</p></article>`).join("");
  setMain(`
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Floor</a> · Ecosystem</nav>
    <h1>Ecosystem</h1>
    <p class="lede">Sister systems around the ACD: WFM, quality and recording, CRM, Enlighten, APIs, and the UCCE and Avaya bridges. The map is a study aid. Each edge is only as strong as its citation. The <a href="#/explorer">flow explorer</a> adds E911, analytics, and the troubleshooting tree.</p>
    <svg id="ecosystem-markmap" class="markmap" viewBox="0 0 760 420" role="img" aria-label="Ecosystem mind map"></svg>
    <div class="mind">${mindMap()}</div>
    <h2>Glossary</h2>
    <div class="grid cards">${terms}</div>`);
  renderRail("ecosystem");
  decorateFloor(document.getElementById("main"));
}

function mindMap() {
  const nodes = [
    ["ACD", 360, 180],
    ["Studio", 180, 80],
    ["IVR", 180, 180],
    ["Digital", 180, 280],
    ["WFM", 540, 70],
    ["QM", 540, 170],
    ["Enlighten", 540, 270],
    ["CRM", 360, 320],
    ["APIs", 80, 180],
    ["UCCE", 700, 120],
    ["Avaya", 700, 230],
  ];
  const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [8, 0], [9, 4], [10, 4], [9, 5], [10, 5]];
  const circles = nodes.map(([label, x, y]) => `<g><circle cx="${x}" cy="${y}" r="36" fill="var(--cc-surface)" stroke="var(--cc-accent-1)"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="var(--cc-ink)" font-size="12">${label}</text></g>`).join("");
  const lines = edges.map(([a, b]) => `<line x1="${nodes[a][1]}" y1="${nodes[a][2]}" x2="${nodes[b][1]}" y2="${nodes[b][2]}" stroke="var(--cc-accent-2)" stroke-width="2"/>`).join("");
  return `<svg viewBox="0 0 780 380" role="img" aria-label="Mind map with ACD at the center and Studio, IVR, digital, WFM, QM, Enlighten, CRM, APIs, UCCE, and Avaya around it"><title>CXone ecosystem mind map</title>${lines}${circles}</svg>`;
}

async function viewIncidents() {
  const incidents = await ensureExtra("boss");
  const cards = incidents.map((incident) => `<article class="card" id="${esc(incident.id)}"><header><h2>${esc(incident.title)}</h2><span class="chip">${esc(incident.severity)}</span></header><p>${esc(incident.summary)}</p><pre class="log">${esc(incident.log)}</pre><form data-boss="${esc(incident.id)}">${incident.steps.map((step, index) => `<fieldset><legend>${esc(step.ask)}</legend>${step.choices.map((choice, choiceIndex) => `<label class="choice"><input type="radio" name="${esc(incident.id)}-${index}" value="${choiceIndex}"> ${esc(choice)}</label>`).join("")}</fieldset>`).join("")}<button class="solid" type="submit">Check the bridge</button><p class="status" role="status"></p></form><p class="sources">${citeLink(incident.cite)}</p></article>`).join("");
  setMain(`<h1>Boss incidents</h1><p class="lede">Synthetic sev-2 nights. The logs were written for this lab. The underlying failure modes are the ones the help pages describe.</p><div class="grid">${cards}</div>`);
  renderRail("incidents");
  document.querySelectorAll("form[data-boss]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const incident = incidents.find((item) => item.id === form.dataset.boss);
      let correct = 0;
      incident.steps.forEach((step, index) => {
        const selected = form.querySelector(`input[name="${incident.id}-${index}"]:checked`);
        if (selected && Number(selected.value) === step.answer) correct += 1;
      });
      form.querySelector(".status").textContent = `${correct} of ${incident.steps.length}. ${incident.fix}`;
      tone(correct === incident.steps.length ? 700 : 200, 0.12, "sine");
    });
  });
}

async function viewInterview() {
  const items = await ensureExtra("interview");
  const blocks = items.map((item, index) => `<article class="card"><header><h2>${index + 1}. ${esc(item.q)}</h2></header><p>${esc(item.a)}</p><p class="sources">${citeLink(item.cite)}</p></article>`).join("");
  setMain(`<h1>Interview floor</h1><p class="lede">Answers stay inside what the cited page actually says. If a page is ambiguous, the answer says so.</p><div class="grid">${blocks}</div>`);
  renderRail("interview");
}

async function viewSearch(params) {
  const query = (params.get("q") || "").trim();
  const manifest = await ensureManifest();
  const needle = query.toLowerCase();
  const hits = [];
  if (needle) {
    for (const meta of manifest.tracks) {
      const track = await ensureTrack(meta.id);
      for (const lesson of track.lessons) {
        const shown = presentLesson(track, lesson);
        const hay = `${lesson.title} ${lesson.summary} ${shown.title} ${shown.summary} ${lesson.sections.map((section) => section.p.join(" ")).join(" ")}`.toLowerCase();
        if (hay.includes(needle)) hits.push({ track, lesson, shown });
      }
    }
  }
  const list = hits.map(({ track, lesson, shown }) => `<a class="card" href="#/lesson/${esc(track.id)}/${esc(lesson.id)}"><header><h2>${esc(shown.title)}</h2></header><p>${esc(track.title)} · ${esc(shown.summary)}</p></a>`).join("");
  setMain(`<h1>Search</h1><p class="lede">${needle ? `${hits.length} lesson${hits.length === 1 ? "" : "s"} for “${esc(query)}”.` : "Type a term in the search box."}</p><div class="grid">${list || "<p>No lesson text matched.</p>"}</div>`);
  renderRail("home");
  document.getElementById("q").value = query;
}

function playSectionFly() {
  const layer = document.getElementById("fly-layer");
  const motion = reducedMotion();
  if (layer && !motion) {
    layer.hidden = false;
    layer.classList.remove("fly-go");
    void layer.offsetWidth;
    layer.classList.add("fly-go");
  }
  const wait = motion ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, 520));
  return Promise.all([flyOut(), wait]).then(() => {
    if (layer) layer.hidden = true;
  });
}

let routedOnce = false;

async function route() {
  const { path, params } = parseHash();
  try {
    const fly = routedOnce ? playSectionFly() : Promise.resolve();
    routedOnce = true;
    await Promise.all([ensureLessonMt(), fly]);
    if (path === "#/" || path === "" || path === "#") return viewHome();
    if (path === "#/tracks" || path === "#/track" || path === "#/track/") return viewTracks();
    if (path === "#/studio") return viewStudio();
    if (path === "#/routing") return viewRouting();
    if (path === "#/topology") return viewTopology();
    if (path === "#/ecosystem") return viewEcosystem();
    if (path === "#/incidents") return viewIncidents();
    if (path === "#/interview") return viewInterview();
    if (path === "#/search") return viewSearch(params);
    const university = await renderUniversity(path, await ensureManifest(), reducedMotion());
    if (university) {
      setMain(university.html);
      renderRail(university.active);
      if (university.bind) await university.bind();
      return;
    }
    const track = path.match(/^#\/track\/([a-z0-9-]+)$/);
    if (track) return viewTrack(track[1]);
    const lesson = path.match(/^#\/lesson\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (lesson) return viewLesson(lesson[1], lesson[2]);
    if (path === "#/lesson" || path === "#/lesson/") return viewTracks();
    return viewMissing();
  } catch (error) {
    setMain(`<h1>The floor could not load</h1><p>${esc(error.message)}</p><p><button class="solid" type="button" id="retry">Try again</button></p>`);
    document.getElementById("retry").addEventListener("click", () => route());
  }
}

function bindPhoneMenu() {
  const dialog = document.getElementById("phone-menu");
  if (!dialog) return;
  let closingFromPop = false;
  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    document.body.classList.add("menu-open");
    if (!history.state || !history.state.phoneMenu) history.pushState({ phoneMenu: true }, "");
    const close = document.getElementById("close-menu");
    if (close) close.focus();
  };
  const shut = () => {
    document.body.classList.remove("menu-open");
    if (dialog.open) dialog.close();
  };
  document.getElementById("open-menu").addEventListener("click", open);
  document.getElementById("open-menu-bar").addEventListener("click", open);
  document.getElementById("close-menu").addEventListener("click", shut);
  dialog.addEventListener("close", () => {
    document.body.classList.remove("menu-open");
    if (closingFromPop) return;
    if (history.state && history.state.phoneMenu) history.back();
  });
  window.addEventListener("popstate", () => {
    if (!dialog.open) return;
    closingFromPop = true;
    dialog.close();
    closingFromPop = false;
  });
  dialog.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.hash.startsWith("#/")) return;
      event.preventDefault();
      closingFromPop = true;
      dialog.close();
      closingFromPop = false;
      history.replaceState(null, "", url.hash);
      route();
    });
  });
  document.getElementById("menu-search").addEventListener("submit", (event) => {
    event.preventDefault();
    const q = document.getElementById("menu-q").value.trim();
    document.getElementById("q").value = q;
    closingFromPop = true;
    dialog.close();
    closingFromPop = false;
    history.replaceState(null, "", `#/search?q=${encodeURIComponent(q)}`);
    route();
  });
  const listen = document.getElementById("listen-btn");
  const dock = document.querySelector(".audio-dock");
  if (listen && dock) {
    listen.addEventListener("click", () => {
      const openDock = dock.classList.toggle("is-open");
      listen.setAttribute("aria-pressed", openDock ? "true" : "false");
      const details = dock.querySelector("details");
      if (details && openDock) details.open = true;
      if (openDock) {
        const play = dock.querySelector("[data-clip]");
        if (play) play.focus();
      }
    });
  }
}

function bindChrome() {
  bootLang();
  document.querySelectorAll("[data-lang-select]").forEach((select) => {
    select.addEventListener("change", () => {
      if (select.value === currentLang()) return;
      setLang(select.value);
      route();
    });
  });
  bindPhoneMenu();
  const briefing = document.getElementById("briefing");
  const briefRate = document.getElementById("brief-rate");
  document.querySelectorAll("[data-clip]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!briefing) return;
      const next = button.dataset.clip;
      if (briefing.getAttribute("src") !== next) {
        briefing.src = next;
        briefing.load();
      }
      briefing.playbackRate = briefRate ? Number(briefRate.value) : 1;
      briefing.play().catch(() => {});
    });
  });
  if (briefRate && briefing) {
    briefRate.addEventListener("input", () => {
      briefing.playbackRate = Number(briefRate.value) || 1;
    });
  }
  document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const q = document.getElementById("q").value.trim();
    location.hash = `#/search?q=${encodeURIComponent(q)}`;
  });
  const dialog = document.getElementById("settings");
  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      const phone = document.getElementById("phone-menu");
      if (phone && phone.open && phone.contains(button)) phone.close();
      openSettings(dialog);
    });
  });
  document.getElementById("close-settings").addEventListener("click", () => dialog.close());
  document.getElementById("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    settings.theme = data.get("theme");
    settings.font = data.get("font");
    settings.sound = data.get("sound");
    settings.narration = data.get("narration");
    settings.voice = data.get("voice");
    settings.rate = data.get("rate");
    settings.motion = data.get("motion");
    const nextLang = data.get("language");
    saveSettings();
    if (nextLang && nextLang !== currentLang()) setLang(nextLang);
    document.getElementById("settings-status").textContent = "Saved on this browser.";
    tone(520, 0.08, "sine");
  });
  document.getElementById("cache-all").addEventListener("click", async () => {
    const status = document.getElementById("settings-status");
    const manifest = await ensureManifest();
    for (const track of manifest.tracks) await ensureTrack(track.id);
    for (const name of Object.keys(manifest.extras)) await ensureExtra(name);
    status.textContent = "Tracks are cached for offline use after the service worker stores them.";
  });
  document.querySelectorAll("[data-theme-set]").forEach((button) => {
    button.addEventListener("click", () => {
      settings.theme = button.dataset.themeSet;
      saveSettings();
      const select = document.querySelector("#settings-form [name=theme]");
      if (select) select.value = settings.theme;
    });
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      settings.theme = settings.theme === "light" ? "dark" : "light";
      saveSettings();
      const select = document.querySelector("#settings-form [name=theme]");
      if (select) select.value = settings.theme;
    });
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("online", () => { document.getElementById("net-chip").textContent = "Online"; });
  window.addEventListener("offline", () => { document.getElementById("net-chip").textContent = "Offline"; });
  if (!navigator.onLine) document.getElementById("net-chip").textContent = "Offline";
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

async function openSettings(dialog) {
  const form = document.getElementById("settings-form");
  form.theme.value = settings.theme;
  form.font.value = settings.font;
  form.sound.value = settings.sound;
  form.narration.value = settings.narration;
  form.rate.value = settings.rate;
  form.motion.value = settings.motion;
  if (form.language) form.language.value = currentLang();
  const select = document.getElementById("voice-select");
  const note = document.getElementById("voice-note");
  const voices = await loadVoices();
  state.voices = voices.slice().sort((a, b) => rankVoice(b) - rankVoice(a));
  select.innerHTML = `<option value="">Choose a voice</option>` + state.voices.map((voice) => (
    `<option value="${esc(voice.voiceURI)}">${esc(voice.name)} · ${esc(voice.lang)}</option>`
  )).join("");
  if (settings.voice) select.value = settings.voice;
  const robotic = state.voices.filter((voice) => /edge/i.test(voice.name) && !/natural|neural/i.test(voice.name));
  note.textContent = robotic.length
    ? "Robotic Edge voices stay in the list so you can pick one on purpose. They are not the automatic choice."
    : "Prefer a natural or enhanced voice when this browser offers one.";
  if (!dialog.open) dialog.showModal();
}

async function downloadPack(button) {
  button.disabled = true;
  const previous = button.textContent;
  button.textContent = "Packing…";
  try {
    const manifest = await ensureManifest();
    const pack = await buildPack(manifest, ensureTrack, ensureExtra);
    const blob = new Blob([JSON.stringify(pack)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cxone-offline-pack.json";
    link.click();
    button.textContent = "Pack downloaded";
  } catch (error) {
    button.textContent = "Pack failed";
  }
  setTimeout(() => {
    button.disabled = false;
    button.textContent = previous;
  }, 2400);
}

bootUniversity({ downloadPack, reducedMotion, tone });
bindChrome();
route();
