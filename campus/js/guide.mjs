import { motionReduced } from "./pixel.mjs";
import { createRetriever } from "../shared/cxbot-chat/engine.js";
import { chatMarkup, paintChat } from "../shared/cxbot-chat/ui.js";

const CHIPS = [
  "Where do I start?",
  "What is overall priority?",
  "What is bullseye routing?",
  "Why is Personal Connection acceleration zero?",
  "What is a point of contact?",
  "What is Autopilot?",
  "Is hold recorded?",
  "What can you help with?",
];

const KB_URL = "data/guide-kb.json";
const FALLBACK = "I only answer from the pages loaded in this lab. I do not have a cited sentence for that. Try priority, bullseye, ports, recording, digital skills, or the ecosystem.";

let kb = null;
let tour = null;
let quiz = null;
let quizIndex = 0;
let chain = Promise.resolve();

function enqueue(work) {
  chain = chain.then(work, work);
  return chain;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9+× ]/g, " ").replace(/\s+/g, " ").trim();
}

function dice(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.86;
  const grams = (text) => {
    const out = [];
    for (let i = 0; i < text.length - 1; i += 1) out.push(text.slice(i, i + 2));
    return out;
  };
  const left = grams(a);
  const right = grams(b);
  if (!left.length || !right.length) return 0;
  let hits = 0;
  const bag = right.slice();
  left.forEach((gram) => {
    const index = bag.indexOf(gram);
    if (index >= 0) {
      hits += 1;
      bag.splice(index, 1);
    }
  });
  return (2 * hits) / (left.length + right.length);
}

function scoreEntry(query, entry) {
  const q = norm(query);
  if (!q) return 0;
  const fields = [entry.a].concat(entry.q || []).map(norm);
  let best = 0;
  fields.forEach((field) => {
    if (!field) return;
    if (field.includes(q) || q.includes(field)) best = Math.max(best, 0.93);
    const tokens = q.split(" ").filter((part) => part.length > 2);
    if (tokens.length) {
      const hits = tokens.filter((part) => field.includes(part)).length;
      best = Math.max(best, hits / tokens.length);
    }
    best = Math.max(best, dice(q, field));
  });
  return best;
}

function localMatch(question, book) {
  const source = book || kb || { entries: [] };
  const ranked = (source.entries || []).map((entry) => ({ entry, score: scoreEntry(question, entry) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.score < 0.34) {
    return { source: "local", answer: FALLBACK, href: "#/search", cite: null, related: [] };
  }
  const related = ranked.slice(1, 3).filter((item) => item.score >= 0.34).map((item) => item.entry.q[0]);
  return {
    source: "local",
    answer: best.entry.a,
    href: best.entry.href || "",
    cite: best.entry.cite || null,
    labNote: !!best.entry.labNote,
    related,
  };
}

export async function askGuide(question, book) {
  const sourceBook = book || kb;
  const endpoint = (typeof window !== "undefined" && window.CXONE_GUIDE_ENDPOINT) || (sourceBook && sourceBook.endpoint) || "";
  if (endpoint && /^https:\/\//.test(endpoint)) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, lab: "nice-cxone" }),
      });
      if (response.ok) {
        const data = await response.json();
        const cite = data && data.cite;
        if (data && typeof data.answer === "string" && cite && /^https:\/\//.test(cite.url || "")) {
          return { source: "cloud", answer: data.answer, cite, href: data.href || "", related: [] };
        }
      }
    } catch (error) {
      /* The local book remains the answer. */
    }
  }
  return localMatch(question, sourceBook);
}

function logNode() {
  return document.getElementById("guide-log");
}

function addBubble(kind, text) {
  const bubble = document.createElement("p");
  bubble.className = `guide-bubble ${kind}`;
  bubble.textContent = text;
  logNode().appendChild(bubble);
  logNode().scrollTop = logNode().scrollHeight;
  return bubble;
}

async function say(text) {
  const bubble = addBubble("bot", "");
  if (motionReduced()) {
    bubble.textContent = text;
    return bubble;
  }
  const typing = document.createElement("span");
  typing.className = "guide-typing";
  typing.textContent = "…";
  bubble.appendChild(typing);
  await wait(280);
  typing.remove();
  let shown = "";
  const step = Math.max(1, Math.ceil(text.length / 40));
  for (let i = 0; i < text.length; i += step) {
    shown = text.slice(0, i + step);
    bubble.textContent = shown;
    logNode().scrollTop = logNode().scrollHeight;
    await wait(16);
  }
  bubble.textContent = text;
  return bubble;
}

function setChips(items) {
  const host = document.getElementById("guide-chips");
  host.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-chip";
    button.textContent = item.label;
    button.addEventListener("click", () => handle(item.ask));
    host.appendChild(button);
  });
}

function starterChips() {
  const here = (location.hash || "#/").split("?")[0];
  const chips = [
    { label: "Finish in 10 minutes", ask: "/go #/tracks" },
    { label: "Full course", ask: "/go #/roadmap" },
    { label: "Just download", ask: "/go #/downloads" },
    { label: "Priority formula", ask: "What is overall priority?" },
    { label: "Who is Lucky", ask: "Who is Lucky?" },
  ];
  if (here.startsWith("#/lesson") || here.startsWith("#/track")) chips.unshift({ label: "Download this section", ask: "/go #/downloads" });
  setChips(chips);
}

function citeLine(result) {
  if (!result.cite || !result.cite.url) return "";
  return ` Source: ${result.cite.title}. ${result.cite.url}`;
}

async function showAnswer(result) {
  const extra = result.href ? ` Open ${result.href}.` : "";
  await say(`${result.answer}${citeLine(result)}${extra}`);
  const chips = [{ label: "Ask another", ask: "/home" }];
  (result.related || []).forEach((label) => chips.push({ label, ask: label }));
  if (result.href) chips.push({ label: "Go there", ask: `/go ${result.href}` });
  setChips(chips);
}

async function startTour(id) {
  const found = (kb.tours || []).find((item) => item.id === id) || kb.tours[0];
  if (!found) {
    await say(FALLBACK);
    starterChips();
    return;
  }
  tour = { steps: found.steps, index: 0, title: found.title };
  quiz = null;
  await say(`${found.title}. ${found.steps.length} stops. I will only describe Contact Path and the pages it already cites.`);
  await showTourStep();
}

async function showTourStep() {
  const step = tour.steps[tour.index];
  if (step.href) location.hash = step.href;
  await say(`Stop ${tour.index + 1} of ${tour.steps.length}. ${step.say}`);
  const chips = [];
  if (tour.index < tour.steps.length - 1) chips.push({ label: "Next stop", ask: "/tour next" });
  chips.push({ label: "End tour", ask: "/home" });
  setChips(chips);
}

async function startQuiz() {
  quizIndex = 0;
  quiz = { score: 0 };
  tour = null;
  await say(`Quiz from this lab’s cited sentences. ${kb.quizzes.length} questions. I will not add a choice that the page does not support.`);
  await showQuiz();
}

async function showQuiz() {
  const item = kb.quizzes[quizIndex];
  await say(item.ask);
  setChips(item.choices.map((choice, index) => ({ label: choice, ask: `/answer ${index}` })));
}

async function grade(choice) {
  const item = kb.quizzes[quizIndex];
  const picked = Number(choice);
  const ok = picked === item.answer;
  if (ok) quiz.score += 1;
  await say(`${ok ? "That matches the page." : "That is not the sentence on the page."} ${item.why} Source: ${item.cite.title}. ${item.cite.url}`);
  quizIndex += 1;
  if (quizIndex >= kb.quizzes.length) {
    await say(`Score ${quiz.score} of ${kb.quizzes.length}. The why on each card is the cited sentence, not a new rule.`);
    quiz = null;
    starterChips();
    return;
  }
  setChips([{ label: "Next question", ask: "/quiz next" }]);
}

function handle(raw) {
  return enqueue(() => runTurn(raw));
}

async function runTurn(raw) {
  const text = String(raw || "").trim();
  if (!text || !kb) return;
  if (text === "/home") {
    tour = null;
    quiz = null;
    await say("Ask in your own words. I answer only when this lab already has the sentence.");
    starterChips();
    return;
  }
  if (text === "/tour next" && tour) {
    tour.index += 1;
    await showTourStep();
    return;
  }
  if (text === "/quiz next" && quiz) {
    await showQuiz();
    return;
  }
  if (text.startsWith("/answer ") && quiz) {
    addBubble("user", kb.quizzes[quizIndex].choices[Number(text.slice(8))] || text);
    await grade(text.slice(8));
    return;
  }
  if (text.startsWith("/go ")) {
    location.hash = text.slice(4).trim();
    await say("Opened that section.");
    starterChips();
    return;
  }
  addBubble("user", text);
  if (text === "/tour floor" || /tour the floor/i.test(text) || /tour the path/i.test(text)) {
    await startTour("floor");
    return;
  }
  if (text === "/tour routing" || /tour routing/i.test(text)) {
    await startTour("routing");
    return;
  }
  if (text === "/quiz" || /quiz me/i.test(text)) {
    await startQuiz();
    return;
  }
  const result = await askGuide(text, kb);
  await showAnswer(result);
}

export async function bootGuide() {
  const panel = document.getElementById("guide-panel");
  const open = document.getElementById("guide-open");
  const close = document.getElementById("guide-close");
  if (!panel || !open) return;
  try {
    const response = await fetch(KB_URL);
    if (!response.ok) throw new Error("kb");
    kb = await response.json();
  } catch (error) {
    kb = { entries: [], tours: [], quizzes: [], endpoint: "" };
  }
  const toggle = (show) => {
    panel.hidden = !show;
    open.setAttribute("aria-expanded", show ? "true" : "false");
    if (show && !logNode().childElementCount) {
      enqueue(async () => {
        await say("I am the Guide Bot for Contact Path. I only repeat sentences this lab already cites, plus the lab’s own note about Lucky. I will say so when I do not have a page.");
        starterChips();
      });
    }
  };
  open.addEventListener("click", () => toggle(panel.hidden));
  close.addEventListener("click", () => toggle(false));
  mountOfflineChat(panel);
  document.getElementById("guide-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("guide-q");
    const value = input.value;
    input.value = "";
    handle(value);
  });
}

function mountOfflineChat(panel) {
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = new URL("../shared/cxbot-chat/chat.css", import.meta.url).href;
  document.head.appendChild(sheet);
  fetch(new URL("../data/cxbot-index.json", import.meta.url).href)
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("index"))))
    .then((index) => {
      const host = document.createElement("div");
      host.innerHTML = chatMarkup(CHIPS);
      panel.appendChild(host);
      ["guide-log", "guide-chips", "guide-form", "guide-mic"].forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.hidden = true;
      });
      const root = host.querySelector("[data-py-chat]");
      const retriever = createRetriever(index);
      const messages = [{
        role: "bot",
        text: "Ask a Contact Path topic. I quote this lab and I do not guess.",
      }];
      const draw = () => paintChat(root, messages, false);
      const ask = (raw) => {
        const text = String(raw || "").trim();
        if (!text) return;
        messages.push({ role: "user", text });
        const answer = retriever.ask(text, {});
        messages.push({
          role: "bot",
          text: answer.text,
          href: answer.href || "",
          link: answer.href ? (answer.link || "Open this page") : "",
          example: answer.example || "",
          follow: answer.follow || "",
          followQ: answer.followQ || "",
          closest: answer.mode === "fallback" && answer.intent !== "injection" ? (answer.closest || []) : [],
        });
        draw();
      };
      root.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = root.querySelector("#py-chat-input");
        const value = input.value;
        input.value = "";
        ask(value);
      });
      root.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-py-ask]");
        if (chip) {
          event.preventDefault();
          ask(chip.getAttribute("data-py-ask"));
          return;
        }
        if (event.target.closest("[data-py-clear]")) {
          messages.length = 0;
          messages.push({ role: "bot", text: "Ask a Contact Path topic. I quote this lab and I do not guess." });
          retriever.reset();
          draw();
          return;
        }
        const read = event.target.closest("[data-py-read]");
        if (read && window.speechSynthesis) {
          const index = Number(read.getAttribute("data-py-read"));
          const line = messages[index] && messages[index].text;
          if (!line) return;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(line));
        }
      });
      draw();
    })
    .catch(() => {
      /* The older guide form stays available if the index is missing. */
    });
}

if (typeof document !== "undefined") bootGuide();
