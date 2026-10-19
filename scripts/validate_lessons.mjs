/* Validate data/lesson-map.json against campus track files.
   Exit 1 on any problem.
   Usage: node scripts/validate_lessons.mjs */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const campus = join(root, "campus");
const map = JSON.parse(readFileSync(join(root, "data", "lesson-map.json"), "utf8"));
const schema = JSON.parse(readFileSync(join(root, "data", "lesson-schema.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(root, "data", "source-catalog.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(campus, "data", "manifest.json"), "utf8"));

const problems = [];
const required = schema.properties.lessons.items.required;
const sourceIds = new Set(catalog.sources.map((row) => row.id));
const sourceUrls = new Set(catalog.sources.map((row) => row.url));
const mapped = new Map(map.lessons.map((lesson) => [lesson.key, lesson]));
const seen = new Set();

for (const name of readdirSync(join(campus, "data", "sources"))) {
  if (!name.endsWith(".json")) continue;
  const pack = JSON.parse(readFileSync(join(campus, "data", "sources", name), "utf8"));
  for (const row of pack.sources || []) {
    if (row.status === "opened" && row.url && !sourceUrls.has(row.url)) {
      problems.push(`${name}: opened url missing from source catalog ${row.url}`);
    }
  }
}

for (const meta of manifest.tracks) {
  const track = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
  for (const lesson of track.lessons) {
    const key = `${track.id}/${lesson.id}`;
    seen.add(key);
    const row = mapped.get(key);
    if (!row) {
      problems.push(`${key}: not in lesson-map.json`);
      continue;
    }
    for (const field of required) if (!(field in row)) problems.push(`${key}: missing field ${field}`);
    if (!Number.isInteger(row.level) || row.level < 0 || row.level > 10) problems.push(`${key}: level must be 0-10`);
    if (!Array.isArray(row.outcomes) || row.outcomes.length < 1 || row.outcomes.some((item) => typeof item !== "string" || item.length < 8)) {
      problems.push(`${key}: needs at least one outcome`);
    }
    if (!Array.isArray(row.sources) || row.sources.length < 1) problems.push(`${key}: needs at least one source`);
    for (const id of row.sources || []) if (!sourceIds.has(id)) problems.push(`${key}: unknown source id ${id}`);
    if (row.title !== lesson.title) problems.push(`${key}: title differs from the lesson file`);
    if (row.last_verified !== null && !/^\d{4}-\d{2}-\d{2}$/.test(row.last_verified)) {
      problems.push(`${key}: last_verified must be null or YYYY-MM-DD`);
    }
    const urls = [];
    for (const section of lesson.sections || []) for (const cite of section.cites || []) if (cite.url) urls.push(cite.url);
    if (!urls.length) problems.push(`${key}: lesson has no section cite url`);
    for (const url of urls) if (!sourceUrls.has(url)) problems.push(`${key}: cite url missing from catalog`);
  }
}
for (const key of mapped.keys()) if (!seen.has(key)) problems.push(`${key}: in lesson-map.json but no such lesson`);

const perLevel = {};
for (const row of map.lessons) perLevel[row.level] = (perLevel[row.level] || 0) + 1;
for (const problem of problems) console.log("FAIL", problem);
console.log("lessons:", seen.size, "mapped:", mapped.size, "per level:", JSON.stringify(perLevel));
console.log("validate_lessons:", problems.length, "problems");
process.exit(problems.length ? 1 : 0);
