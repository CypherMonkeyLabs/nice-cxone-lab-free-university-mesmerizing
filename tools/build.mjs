import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { part1 } from "./part1.mjs";
import { part2 } from "./part2.mjs";
import { part3 } from "./part3.mjs";
import { part4 } from "./part4.mjs";
import { part5 } from "./part5.mjs";
import { part6 } from "./part6.mjs";
import { part7 } from "./part7.mjs";
import { part8 } from "./part8.mjs";
import { part9 } from "./part9.mjs";
import { part10 } from "./part10.mjs";
import { part11 } from "./part11.mjs";
import { part12 } from "./part12.mjs";
import { part13 } from "./part13.mjs";
import { part14 } from "./part14.mjs";
import { part15 } from "./part15.mjs";
import { glossary, boss, interview } from "./extras.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "campus", "data");
const tracks = [
  ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8,
  ...part9, ...part10, ...part11, ...part12, ...part13, ...part14, ...part15,
];

const ids = new Set();
for (const track of tracks) {
  if (ids.has(track.id)) throw new Error("duplicate track " + track.id);
  ids.add(track.id);
  const seen = new Set();
  for (const lesson of track.lessons) {
    if (seen.has(lesson.id)) throw new Error(track.id + " duplicate lesson " + lesson.id);
    seen.add(lesson.id);
  }
}

mkdirSync(join(root, "tracks"), { recursive: true });

const manifest = {
  product: "NICE CXone Lab",
  title: "Contact Path",
  honesty: "Independent study notes. Not NiCE, not a tenant, and not a support channel. Versions and click paths can move. Where two official sentences disagree, the lesson says so.",
  tape: "Overall priority is (time × acceleration) + initial priority  ·  Proficiency 1 is best  ·  Hold is not recorded  ·  New digital work uses skills, not new routing queues  ·  Access-key secrets are shown once  ·  26.3 and 26.4 dates overlap on the pages we read",
  tracks: tracks.map((track) => ({
    id: track.id,
    file: `data/tracks/${track.id}.json`,
    title: track.title,
    blurb: track.blurb,
    accent: track.accent,
    lessonIds: track.lessons.map((lesson) => lesson.id),
  })),
  extras: {
    glossary: "data/glossary.json",
    boss: "data/boss.json",
    interview: "data/interview.json",
  },
};

function write(path, data) {
  writeFileSync(path, JSON.stringify(data));
}

write(join(root, "manifest.json"), manifest);
write(join(root, "glossary.json"), glossary);
write(join(root, "boss.json"), boss);
write(join(root, "interview.json"), interview);
for (const track of tracks) {
  write(join(root, "tracks", `${track.id}.json`), {
    id: track.id,
    title: track.title,
    blurb: track.blurb,
    accent: track.accent,
    lessons: track.lessons,
  });
}

const lessons = tracks.reduce((sum, track) => sum + track.lessons.length, 0);
const quiz = tracks.reduce((sum, track) => sum + track.lessons.reduce((inner, lesson) => inner + lesson.quiz.length, 0), 0);
console.log(`tracks ${tracks.length} lessons ${lessons} quiz ${quiz} glossary ${glossary.length} boss ${boss.length} interview ${interview.length}`);
