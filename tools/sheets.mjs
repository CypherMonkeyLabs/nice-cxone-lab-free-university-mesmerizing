import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const campus = join(root, "campus");
const out = join(campus, "downloads");
const atlas = JSON.parse(readFileSync(join(campus, "data", "atlas.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(campus, "data", "manifest.json"), "utf8"));
const glossary = JSON.parse(readFileSync(join(campus, "data", "glossary.json"), "utf8"));

const FOOT = "CypherMonkey Labs https://cyphermonkeylabs.com · https://linktr.ee/cyphermonkey · Repo https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing · Independent educational project, not affiliated with or endorsed by any vendor. Trademarks belong to their owners. MIT code, CC BY-NC-SA content. No email.";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)} · Signal Floor cheat sheet</title>
  <style>
    body { font: 13px/1.35 Georgia, serif; margin: 16px; color: #102028; }
    h1 { font-size: 20px; margin: 0 0 6px; }
    h2 { font-size: 14px; margin: 10px 0 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    td, th { border-bottom: 1px solid #c5d6de; text-align: left; vertical-align: top; padding: 3px 4px; }
    a { color: #0b5f78; }
    footer { margin-top: 12px; font: 10px/1.35 sans-serif; color: #3c5360; }
    .card { break-inside: avoid; border: 1px solid #c5d6de; padding: 8px; margin: 6px 0; }
    @media print { body { margin: 10mm; } a { color: inherit; text-decoration: none; } }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  ${body}
  <footer>${esc(FOOT)}</footer>
</body>
</html>`;
}

function pdfEscape(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
}

function pdf(lines) {
  const body = ["BT", "/F1 9 Tf", "36 770 Td", "14 TL"];
  const clipped = lines.length > 50 ? lines.slice(0, 49).concat(["Full text is in the matching HTML sheet."]) : lines;
  clipped.forEach((line, index) => {
    const text = pdfEscape(line).slice(0, 110);
    if (index === 0) body.push(`(${text}) Tj`);
    else body.push(`T* (${text}) Tj`);
  });
  body.push("ET");
  const stream = body.join("\n");
  const objects = [];
  const add = (text) => {
    objects.push(text);
    return objects.length;
  };
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>");
  add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  let offset = 0;
  let file = "%PDF-1.4\n";
  const xref = [0];
  objects.forEach((object, index) => {
    xref.push(file.length);
    file += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = file.length;
  file += `xref\n0 ${objects.length + 1}\n`;
  file += "0000000000 65535 f \n";
  xref.slice(1).forEach((pos) => {
    file += `${String(pos).padStart(10, "0")} 00000 n \n`;
  });
  file += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return file;
}

function citeLine(key) {
  const cite = atlas.cites[key];
  return cite ? `${cite.title} ${cite.url}` : "";
}

function writePair(stem, title, htmlBody, lines) {
  writeFileSync(join(out, `${stem}.html`), page(title, htmlBody));
  const pdfLines = [title, ""].concat(lines).concat(["", FOOT]);
  writeFileSync(join(out, `${stem}.pdf`), pdf(pdfLines));
}

mkdirSync(out, { recursive: true });

const portRows = atlas.ports.map((row) => `<tr><td>${esc(row.use)}</td><td>${esc(row.proto)}</td><td>${esc(row.port)}</td><td>${esc(row.note)}</td></tr>`).join("");
writePair(
  "ports",
  "Ports and protocols",
  `<p>Open only the apps you use. IP allowlists stay on the wizard. <a href="${esc(atlas.cites.ports.url)}">${esc(atlas.cites.ports.title)}</a></p><table><tr><th>Use</th><th>Protocol</th><th>Port</th><th>Note</th></tr>${portRows}</table>`,
  atlas.ports.map((row) => `${row.port} ${row.proto} — ${row.use}`)
);

const flowBody = atlas.diagrams.map((item) => `<p><strong>${esc(item.title)}.</strong> ${esc(item.caption)} <a href="${esc(item.cite.url)}">${esc(item.cite.title)}</a></p>`).join("");
writePair(
  "flows",
  "Call and data flows",
  flowBody,
  atlas.diagrams.map((item) => `${item.title}: ${item.caption}`)
);

function pageSheet(stem, title, id) {
  const source = atlas.pages.find((item) => item.id === id);
  const html = source.blocks.map((block) => `<h2>${esc(block.h)}</h2>${block.p.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}<p>${block.cites.map((key) => `<a href="${esc(atlas.cites[key].url)}">${esc(atlas.cites[key].title)}</a>`).join(" · ")}</p>`).join("");
  const lines = source.blocks.flatMap((block) => [block.h].concat(block.p));
  writePair(stem, title, html, lines);
}

pageSheet("config", "Configuration checklist", "deploy");
pageSheet("e911", "E911", "e911");
pageSheet("security", "Security", "security");
pageSheet("licensing", "Licenses and badges", "licensing");
pageSheet("carrier", "Carrier, SIP, and PSTN", "byoc");
pageSheet("migration", "Migration checklist", "cutover");
pageSheet("reporting", "Reporting and analytics", "reporting");

writePair(
  "troubleshoot",
  "Troubleshooting tree",
  atlas.troubles.map((item) => `<p><strong>${esc(item.symptom)}.</strong> ${esc(item.check)} <a href="${esc(atlas.cites[item.cite].url)}">${esc(atlas.cites[item.cite].title)}</a></p>`).join(""),
  atlas.troubles.map((item) => `${item.symptom} — ${item.check}`)
);

const gloss = glossary.slice(0, 28);
writePair(
  "glossary",
  "Glossary (first sheet)",
  `<p>The campus glossary is longer. This sheet is the first 28 terms. Each one links to its source from the full floor.</p>${gloss.map((item) => `<p><strong>${esc(item.term)}.</strong> ${esc(item.meaning)}</p>`).join("")}`,
  gloss.map((item) => `${item.term}: ${item.meaning}`)
);

writePair(
  "wfm",
  "WFM forecast",
  `<p>Forecast volume and average handle time, then staff to a target. A tighter speed of answer needs more agents. Bullseye can change the pool the forecast assumed.</p><p><a href="${esc(atlas.cites.forecast.url)}">${esc(atlas.cites.forecast.title)}</a> · <a href="${esc(atlas.cites.wfm.url)}">${esc(atlas.cites.wfm.title)}</a></p>`,
  ["Forecast volume and AHT from at least three months, and the page also recommends 13 weeks.", "Example targets: under 10 seconds versus 30 seconds. Lower average speed of answer needs more agents.", "CXone WFM and IEX are different products.", citeLine("forecast")]
);

writePair(
  "recording",
  "Recording and quality",
  `<p>Hold audio, including hold music, is not recorded. A consultation during hold is recorded. Screen monitoring uses the ports on the firewall sheet.</p><p><a href="${esc(atlas.cites.recording.url)}">${esc(atlas.cites.recording.title)}</a></p>`,
  ["Hold audio is not recorded. Consultation during hold is recorded.", "Screen NAT: UDP 443 or 3478 outbound. Internal 31322 unless OS Login.", citeLine("recording")]
);

writePair(
  "crm-api",
  "CRM and APIs",
  `<p>Discover api_endpoint per tenant. Salesforce billing follows the Agent Integrations attribute. CRM ticketing names Salesforce and Zendesk.</p><p><a href="${esc(atlas.cites.auth.url)}">${esc(atlas.cites.auth.title)}</a> · <a href="${esc(atlas.cites.sf.url)}">${esc(atlas.cites.sf.title)}</a> · <a href="${esc(atlas.cites.ticket.url)}">${esc(atlas.cites.ticket.title)}</a></p>`,
  ["Do not hard-code api-na1.", "Access-key secret is shown once and inherits the employee.", "CRM Ticketing needs its license. Retention on that page is 90 days.", citeLine("auth")]
);

writePair(
  "ai",
  "AI agents and summaries",
  `<p>Autopilot voice needs NiCE. Text needs Digital Experience. AutoSummary types are Structured, Generative, and Hybrid. Email is not supported.</p><p><a href="${esc(atlas.cites.autopilot.url)}">${esc(atlas.cites.autopilot.title)}</a> · <a href="${esc(atlas.cites.summary.url)}">${esc(atlas.cites.summary.title)}</a></p>`,
  ["Voice setup needs NiCE. Text uses Digital Experience and the script.", "AutoSummary: Structured, Generative, Hybrid. Not email.", "MAX also needs a Copilot for Agents license.", citeLine("autopilot")]
);

const cards = [];
for (const meta of manifest.tracks) {
  const track = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
  for (const lesson of track.lessons) {
    for (const card of lesson.cards || []) {
      cards.push({ track: track.title, lesson: lesson.title, front: card.front, back: card.back });
    }
  }
}
writeFileSync(join(out, "flashcards.json"), JSON.stringify({ count: cards.length, cards, footer: FOOT }));
const sample = cards.slice(0, 12);
writePair(
  "flashcards",
  "Flashcards",
  `<p>${cards.length} cards live in flashcards.json. This printable sample is the first 12. Print the HTML from a browser for the sample; the JSON is the full deck.</p>${sample.map((card) => `<article class="card"><strong>${esc(card.front)}</strong><p>${esc(card.back)}</p><p>${esc(card.track)} · ${esc(card.lesson)}</p></article>`).join("")}`,
  sample.map((card) => `${card.front} — ${card.back}`)
);

const tracks = {};
for (const meta of manifest.tracks) {
  tracks[meta.id] = JSON.parse(readFileSync(join(campus, meta.file), "utf8"));
}
writeFileSync(join(out, "cxone-offline-pack.json"), JSON.stringify({
  product: "NICE CXone Lab offline pack",
  footer: FOOT,
  manifest,
  glossary,
  atlas,
  tracks,
}));

const links = [
  "ports", "flows", "config", "troubleshoot", "glossary", "wfm", "recording", "e911", "crm-api", "ai", "licensing", "carrier", "security", "migration", "reporting", "flashcards",
].map((stem) => `<li><a href="${stem}.html">${stem}</a> · <a href="${stem}.pdf">pdf</a> · <a href="${stem}.png">png</a></li>`).join("");
writeFileSync(join(out, "index.html"), page("Cheat codes", `<ul>${links}</ul><p><a href="flashcards.json">flashcards.json</a> · <a href="cxone-offline-pack.json">cxone-offline-pack.json</a> · <a href="cxone-offline-bundle.zip">offline zip</a></p>`));
console.log("sheets", cards.length, "cards");
