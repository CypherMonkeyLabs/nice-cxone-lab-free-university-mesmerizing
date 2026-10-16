const CONFIRM_URLS = new Set([
  "https://help.nicecxone.com/content/releasenotes/20262release.htm",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.3",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.5",
]);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function isHiddenSource(row) {
  if (!row) return true;
  if (row.confirm || row.status === "confirm") return true;
  if (!row.url) return true;
  return CONFIRM_URLS.has(row.url);
}

export function citeFrom(atlas, key) {
  if (!key) return null;
  if (typeof key === "object") {
    if (!key.title && !key.url) return null;
    return key;
  }
  if (!atlas || !atlas.cites) return { title: String(key), confirm: true };
  return atlas.cites[key] || { title: String(key), confirm: true };
}

export function sourcesBlock(rows) {
  const seen = new Set();
  const items = [];
  for (const row of rows || []) {
    if (!row) continue;
    const hidden = isHiddenSource(row);
    const title = row.title || "Source";
    const key = hidden ? `confirm:${title}` : row.url;
    if (seen.has(key)) continue;
    seen.add(key);
    if (hidden) items.push(`<li>${esc(title)} — confirm</li>`);
    else {
      items.push(`<li><a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a> <span class="muted">last checked 2026-10</span></li>`);
    }
  }
  if (!items.length) items.push("<li>No opened page for this screen — confirm</li>");
  return `<ul class="source-list">${items.join("")}</ul><p class="muted">Last checked 2026-10. A line marked confirm has no URL.</p>`;
}

export function lessonCites(lesson) {
  const rows = [];
  for (const section of lesson.sections || []) rows.push(...(section.cites || []));
  for (const item of lesson.quiz || []) if (item.cite) rows.push(item.cite);
  for (const fault of lesson.faults || []) if (fault.cite) rows.push(fault.cite);
  for (const extra of lesson.also || []) rows.push(extra);
  return rows;
}
