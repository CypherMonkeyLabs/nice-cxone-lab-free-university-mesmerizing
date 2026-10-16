import { gzipSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const campus = join(dirname(fileURLToPath(import.meta.url)), "..", "campus");
const files = ["index.html", "assets/app.css", "assets/kit.css", "assets/university.css", "assets/wow.css", "assets/phone.css", "js/app.js", "js/university.mjs", "js/kit.mjs", "sw.js"];
for (const file of files) {
  const source = join(campus, file);
  const gz = gzipSync(readFileSync(source), { level: 9 });
  writeFileSync(source + ".gz", gz);
  console.log(file, statSync(source).size, "->", gz.length);
}
