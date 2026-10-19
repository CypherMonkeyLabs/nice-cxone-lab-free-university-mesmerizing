/* Write data/lesson-map.json and data/source-catalog.json from the campus tracks.
   Usage: node scripts/build_lesson_map.mjs */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const campus = join(root, "campus");
const LEVEL = { foundation: 2, intermediate: 5, advanced: 8 };

function sourceId(url) {
  return `src-${createHash("sha256").update(url).digest("hex").slice(0, 12)}`;
}

const manifest = JSON.parse(readFileSync(join(campus, "data", "manifest.json"), "utf8"));
const catalog = new Map();

function addSource(title, url) {
  if (!url) return null;
  const id = sourceId(url);
  if (!catalog.has(id)) catalog.set(id, { id, title: title || url, url });
  return id;
}

const dir = join(campus, "data", "sources");
for (const name of readdirSync(dir)) {
  if (!name.endsWith(".json")) continue;
  const pack = JSON.parse(readFileSync(join(dir, name), "utf8"));
  for (const row of pack.sources || []) {
    if (row.status === "opened" && row.url) addSource(row.title, row.url);
  }
}

const lessons = [];
for (const meta of manifest.tracks) {
  const track = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
  for (const lesson of track.lessons) {
    const urls = [];
    for (const section of lesson.sections || []) {
      for (const cite of section.cites || []) if (cite.url) urls.push(cite);
    }
    for (const item of lesson.quiz || []) if (item.cite && item.cite.url) urls.push(item.cite);
    for (const fault of lesson.faults || []) if (fault.cite && fault.cite.url) urls.push(fault.cite);
    const sources = [];
    for (const cite of urls) {
      const id = addSource(cite.title, cite.url);
      if (id && !sources.includes(id)) sources.push(id);
    }
    const levelName = String(lesson.level || "");
    if (!Object.prototype.hasOwnProperty.call(LEVEL, levelName)) {
      console.error(`unknown level ${track.id}/${lesson.id}: ${levelName}`);
      process.exit(1);
    }
    const outcomes = (lesson.objectives || []).map((item) => String(item)).filter((item) => item.length >= 8);
    if (!outcomes.length) outcomes.push(`Study ${lesson.title} on the ${track.title} track.`);
    lessons.push({
      key: `${track.id}/${lesson.id}`,
      title: lesson.title,
      level: LEVEL[levelName],
      level_name: levelName,
      outcomes,
      sources,
      last_verified: null,
    });
  }
}

mkdirSync(join(root, "data"), { recursive: true });
const map = {
  lab: "nice-cxone",
  note: "last_verified is null because the source files record a month (2026-10), not a full day. Levels: foundation 2, intermediate 5, advanced 8.",
  lessons,
};
writeFileSync(join(root, "data", "lesson-map.json"), `${JSON.stringify(map, null, 2)}\n`);
writeFileSync(join(root, "data", "source-catalog.json"), `${JSON.stringify({ sources: [...catalog.values()] }, null, 2)}\n`);
const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Contact Path lesson map",
  type: "object",
  required: ["lab", "lessons"],
  properties: {
    lessons: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "title", "level", "outcomes", "sources", "last_verified"],
      },
    },
  },
};
writeFileSync(join(root, "data", "lesson-schema.json"), `${JSON.stringify(schema, null, 2)}\n`);
console.log(`lesson-map ${lessons.length} lessons, sources ${catalog.size}`);
