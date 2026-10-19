/* Bot dock, read-along, idle offer, and section export. Voice stays off until a button turns it on. */

import { bindDragbot } from "./dragbot.mjs";

const GREET_KEY = "cg-greet-done";
const POKE_COUNT = "cg-poke-count";
const POKE_OFF = "cg-poke-off";

function ls(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (error) {
    return null;
  }
  return null;
}

function pose(name) {
  const dock = document.getElementById("mascot-dock");
  if (dock) dock.dataset.pose = name;
}

function settings() {
  try {
    return JSON.parse(localStorage.getItem("cxone-lab-settings") || "{}");
  } catch (error) {
    return {};
  }
}

function voices() {
  const synth = window.speechSynthesis;
  if (!synth) return [];
  return synth.getVoices();
}

function pickVoice() {
  const wanted = settings().voice;
  const list = voices();
  return list.find((voice) => voice.voiceURI === wanted) || list.find((voice) => /natural|neural/i.test(voice.name)) || null;
}

let reading = null;
let readIndex = 0;
let blocks = [];

function clearMarks() {
  document.querySelectorAll(".read-now, .is-reading").forEach((node) => {
    node.classList.remove("read-now", "is-reading");
  });
}

function speakBlock() {
  if (!reading || readIndex >= blocks.length) {
    reading = null;
    clearMarks();
    pose("still");
    return;
  }
  const node = blocks[readIndex];
  clearMarks();
  node.classList.add("read-now");
  const section = node.closest("section, article, .lesson-block") || node;
  section.classList.add("is-reading");
  node.scrollIntoView({ block: "center", behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
  const utter = new SpeechSynthesisUtterance(node.textContent || "");
  const prefs = settings();
  utter.rate = Number(prefs.rate) || 1;
  utter.pitch = Number(prefs.pitch) || 1;
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.onend = () => {
    readIndex += 1;
    speakBlock();
  };
  window.speechSynthesis.speak(utter);
  pose("headset");
}

function startRead() {
  if (!window.speechSynthesis) {
    const input = document.getElementById("guide-q");
    if (input) input.focus();
    return;
  }
  window.speechSynthesis.cancel();
  const main = document.getElementById("main");
  blocks = [...main.querySelectorAll("h1, h2, p, li")].filter((node) => (node.textContent || "").trim().length > 1);
  readIndex = 0;
  reading = true;
  speakBlock();
}

function exportSection() {
  const main = document.getElementById("main");
  const title = (main.querySelector("h1") || {}).textContent || "CXone lab section";
  const disclaimer = "Independent, free, learning-only study material. It respects every vendor. Trademarks belong to their owners. There is no affiliation and no endorsement. Ask for a removal or a correction at https://cyphermonkeylabs.com/#contact. Nothing here is sold. The author is happy to volunteer. Public pages opened in 2026-10 are linked. A confirm line has no URL.";
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'"><title>${title}</title><body><h1>${title}</h1><aside>${disclaimer}</aside>${main.innerHTML}<p>Sources and go deeper: see the matching room in the lab.</p><p><a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> · <a href="https://github.com/CypherMonkeyLabs">GitHub</a> · <a href="https://linktr.ee/cyphermonkey">Linktree</a></p><p>© 2026 CypherMonkeyLabs</p></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cxone-section.html";
  link.click();
}

function greetOnce() {
  if (ls(GREET_KEY)) return;
  const dock = document.getElementById("mascot-dock");
  if (!dock) return;
  ls(GREET_KEY, "1");
  dock.classList.add("is-greet");
  pose("wave");
  window.setTimeout(() => {
    dock.classList.remove("is-greet");
    pose("still");
  }, 2600);
}

function offerHelp() {
  if (ls(POKE_OFF) === "1") return;
  const count = Number(ls(POKE_COUNT) || "0");
  if (count >= 3) return;
  if (document.querySelector(".poke") || document.body.classList.contains("onboard-open")) return;
  ls(POKE_COUNT, String(count + 1));
  const note = document.createElement("div");
  note.className = "poke";
  note.innerHTML = `<p>Need a hand with this section?</p><div class="tour-actions"><button type="button" data-poke-yes>Show me</button><button type="button" data-poke-later>Not now</button><button type="button" data-poke-stop>Stop offering</button></div>`;
  document.body.appendChild(note);
  const dock = document.getElementById("mascot-dock");
  if (dock) {
    const rect = dock.getBoundingClientRect();
    note.style.top = `${Math.max(8, rect.top)}px`;
  }
  pose("think");
  note.addEventListener("click", (event) => {
    if (event.target.closest("[data-poke-stop]")) ls(POKE_OFF, "1");
    if (event.target.closest("[data-poke-yes]")) {
      const open = document.getElementById("guide-open");
      if (open) open.click();
    }
    note.remove();
    pose("still");
  });
}

function bindDock() {
  const dock = document.getElementById("mascot-dock");
  if (!dock) return;
  bindDragbot({
    onTap: () => {
      const open = document.getElementById("guide-open");
      if (open) open.click();
      pose("wave");
    },
  });
}

function bindListen() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-export-room]")) {
      event.preventDefault();
      exportSection();
      return;
    }
    const save = event.target.closest("[data-save-svg]");
    if (save) {
      const svg = save.closest("figure")?.querySelector("svg");
      if (!svg) return;
      const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${save.closest("figure").id || "diagram"}.svg`;
      link.click();
    }
    if (!event.target.closest("[data-listen]")) return;
    const button = event.target.closest("[data-listen]");
    const pressed = button.getAttribute("aria-pressed") === "true";
    document.querySelectorAll("[data-listen]").forEach((item) => item.setAttribute("aria-pressed", pressed ? "false" : "true"));
    if (pressed) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      reading = null;
      clearMarks();
      return;
    }
    startRead();
  });
}

function bindMic() {
  const button = document.getElementById("guide-mic");
  if (!button) return;
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  button.addEventListener("click", () => {
    const input = document.getElementById("guide-q");
    if (!Rec) {
      if (input) input.focus();
      button.textContent = "Type instead";
      return;
    }
    const rec = new Rec();
    rec.lang = "en-US";
    rec.onresult = (event) => {
      if (input) input.value = event.results[0][0].transcript;
    };
    rec.start();
  });
}

let ambient = null;

function syncAmbient() {
  const mode = settings().ambient || "off";
  if (mode === "off") {
    if (ambient) ambient.close();
    ambient = null;
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx || ambient) return;
  ambient = new Ctx();
  const osc = ambient.createOscillator();
  const gain = ambient.createGain();
  osc.type = "sine";
  osc.frequency.value = 174;
  gain.gain.value = 0.012;
  osc.connect(gain);
  gain.connect(ambient.destination);
  osc.start();
}

function fitBanner() {
  const scroller = document.querySelector(".banner-scroll");
  if (!scroller) return;
  scroller.style.maxWidth = "";
  if (window.innerWidth < 900) return;
  const chips = [...scroller.querySelectorAll(":scope > a, :scope > button")];
  const box = scroller.getBoundingClientRect();
  const limit = box.right - 4;
  let fitRight = box.left;
  chips.forEach((chip) => {
    const rect = chip.getBoundingClientRect();
    if (rect.right <= limit && rect.width > 8) fitRight = rect.right;
  });
  const width = Math.ceil(fitRight - box.left + 2);
  if (width > 120 && width < box.width - 8) scroller.style.maxWidth = `${width}px`;
}

export function bootKit() {
  const refit = () => fitBanner();
  window.addEventListener("resize", refit);
  window.addEventListener("load", refit);
  window.requestAnimationFrame(() => window.requestAnimationFrame(refit));
  window.setTimeout(refit, 250);
  bindDock();
  bindListen();
  bindMic();
  document.addEventListener("canon-tour-finished", greetOnce);
  document.addEventListener("cxone-theme", syncAmbient);
  const wait = 180000;
  window.setTimeout(() => {
    offerHelp();
    window.setInterval(offerHelp, wait);
  }, wait);
  const hash = () => {
    const open = document.getElementById("guide-panel");
    if (!open || open.hidden) return;
    pose("think");
  };
  window.addEventListener("hashchange", hash);
}
