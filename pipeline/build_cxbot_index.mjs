/* Build the offline Guide index from Contact Path lessons only.
   Usage: node pipeline/build_cxbot_index.mjs
   Writes campus/data/cxbot-index.json. Do not edit that file by hand. */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tokens } from "../campus/shared/cxbot-chat/engine.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const campus = join(root, "campus");
const outPath = join(campus, "data", "cxbot-index.json");

const SYN = {
  incontact: "cxone",
  niceincontact: "cxone",
  priorty: "priority",
  prioritys: "priority",
  skil: "skill",
  skils: "skill",
  studo: "studio",
  studdio: "studio",
  proficency: "proficiency",
  accelaration: "acceleration",
  accel: "acceleration",
  conection: "connection",
  enlighen: "enlighten",
  enlightn: "enlighten",
  salesforse: "salesforce",
  consol: "console",
  recored: "record",
  adherance: "adherence",
  forcast: "forecast",
  workfroce: "workforce",
  managment: "management",
  meny: "menu",
  digitl: "digital",
  softphne: "softphone",
  contct: "contact",
  pont: "point",
  secert: "secret",
  acces: "access",
  sentment: "sentiment",
  windos: "window",
  routting: "routing",
  ovverall: "overall",
  musc: "music",
  omilia: "autopilot",
  autosummary: "summary",
  webrtc: "softphone",
  iex: "iex",
  ucce: "ucce",
  cpaas: "cpaas",
  dnis: "dnis",
};

const TOPICS = [
  "Where do I start?",
  "What is overall priority?",
  "What is bullseye routing?",
  "Why is Personal Connection acceleration zero?",
  "What is a point of contact?",
  "What is Autopilot?",
  "Is hold recorded?",
  "What can you help with?",
];

function plain(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clip(text, max = 320) {
  const clean = plain(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  if (stop > 80) return cut.slice(0, stop + 1);
  return cut.trim();
}

function checkedByUrl() {
  const map = new Map();
  const dir = join(campus, "data", "sources");
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const pack = JSON.parse(readFileSync(join(dir, name), "utf8"));
    for (const row of pack.sources || []) {
      if (row.url && row.checked && !map.has(row.url)) map.set(row.url, row.checked);
    }
  }
  return map;
}

const checked = checkedByUrl();
const docs = [];

function add(doc) {
  const bodyText = [doc.ti, doc.body].filter(Boolean).join("\n");
  docs.push({
    i: doc.i,
    k: doc.k,
    ti: doc.ti,
    h: doc.h,
    s: doc.s || "",
    ex: doc.ex,
    eg: String(doc.eg || "").slice(0, 180),
    fu: doc.fu || "",
    fq: doc.fq || "",
    act: doc.act || "",
    w: tokens(bodyText, SYN, 3),
    tw: tokens(doc.ti, SYN, 2),
  });
}

const manifest = JSON.parse(readFileSync(join(campus, "data", "manifest.json"), "utf8"));
const lessonTitles = [];

for (const meta of manifest.tracks) {
  const track = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
  add({
    i: `track:${track.id}`,
    k: "level",
    ti: track.title,
    h: `#/track/${track.id}`,
    s: track.id,
    ex: clip(`${track.title}. ${plain(track.blurb)} These are themed worlds inside Contact Path.`),
    eg: plain(track.blurb).slice(0, 180),
    body: `${track.title} ${track.blurb}`,
  });
  for (const lesson of track.lessons) {
    const paragraphs = [];
    for (const section of lesson.sections || []) {
      for (const part of section.p || []) paragraphs.push(plain(part));
    }
    const first = paragraphs[0] || plain(lesson.summary);
    let checkedMonth = "";
    for (const section of lesson.sections || []) {
      for (const cite of section.cites || []) {
        if (cite.url && checked.has(cite.url)) {
          checkedMonth = checked.get(cite.url);
          break;
        }
      }
      if (checkedMonth) break;
    }
    const notes = [];
    if (Array.isArray(lesson.uncertain) && lesson.uncertain.length) notes.push("Unconfirmed on this page.");
    if (checkedMonth) notes.push(`Source checked ${checkedMonth} (month).`);
    const suffix = notes.join(" ");
    const room = 340 - suffix.length;
    const ex = `${clip(`${lesson.title}. ${plain(lesson.summary)} ${first}`, Math.max(120, room))} ${suffix}`.trim();
    add({
      i: `lesson:${track.id}/${lesson.id}`,
      k: "lesson",
      ti: lesson.title,
      h: `#/lesson/${track.id}/${lesson.id}`,
      s: track.id,
      ex,
      eg: clip(first, 170),
      body: [lesson.title, lesson.summary, lesson.objectives, paragraphs, (lesson.uncertain || [])].flat().join("\n"),
    });
    lessonTitles.push({ id: `lesson:${track.id}/${lesson.id}`, h: `#/lesson/${track.id}/${lesson.id}`, ti: lesson.title, ex, eg: clip(first, 170) });
  }
}

const tools = [
  ["game:routing", "game", "Routing simulator", "#/routing", "The routing simulator ages a contact with the classroom formula and labels its tie-break as a simulation. It does not contact NiCE."],
  ["game:studio", "game", "Studio builder", "#/studio", "The Studio builder validates a classroom script and exports JSON marked not an official Studio export. It is a simulation."],
  ["game:callflow", "game", "Call-flow sandbox", "#/callflow", "The call-flow sandbox steps a number, a point of contact, a script, a skill, and an agent. It is a simulation. It does not place a call."],
  ["game:play", "game", "Ports practice", "#/play", "Ports practice is the in-browser page for the port quiz and the daily challenge. Nothing leaves the browser."],
  ["page:downloads", "download", "Downloads", "#/downloads", "Downloads in this lab are the cheat-code sheets, the card deck, and the offline pack."],
  ["page:tracks", "page", "Tracks", "#/tracks", "Tracks are the themed worlds. Open one track, then a lesson."],
];
for (const [id, kind, title, href, body] of tools) {
  add({ i: id, k: kind, ti: title, h: href, ex: body, eg: "", body: `${title} ${body}` });
}

function titleTokens(title) {
  return tokens(title, SYN, 2).filter((term) => term.length >= 5);
}

const owners = new Map();
for (const lesson of lessonTitles) {
  for (const term of titleTokens(lesson.ti)) {
    if (!owners.has(term)) owners.set(term, []);
    owners.get(term).push(lesson);
  }
}

const seeds = [];
for (const lesson of lessonTitles) {
  const terms = titleTokens(lesson.ti);
  const unique = terms.filter((term) => term.length >= 7 && owners.get(term).length === 1);
  if (!unique.length) continue;
  const token = unique.sort((a, b) => b.length - a.length)[0];
  seeds.push({
    i: lesson.id,
    h: lesson.h,
    ti: lesson.ti,
    k: "lesson",
    ex: lesson.ex,
    eg: lesson.eg,
    topic: token,
    all: [],
    any: [token],
    allow: [],
    block: [],
    loose: true,
    how: false,
    rank: 8,
  });
}

const index = {
  v: 2,
  lab: "nice-cxone",
  topics: TOPICS,
  syn: SYN,
  seeds,
  docs,
};

writeFileSync(outPath, `${JSON.stringify(index)}\n`);
const hash = createHash("sha256").update(JSON.stringify(index)).digest("hex").slice(0, 12);
console.log(`cxbot index docs ${docs.length} seeds ${seeds.length} sha ${hash} -> ${outPath}`);
