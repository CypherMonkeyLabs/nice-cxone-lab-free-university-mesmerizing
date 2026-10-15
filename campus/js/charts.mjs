function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function chartSvg(chart) {
  const series = chart.series || [];
  const max = Math.max(1, ...series.map((item) => Number(item.value) || 0));
  const row = 22;
  const height = 36 + series.length * row;
  const bars = series.map((item, index) => {
    const y = 28 + index * row;
    const width = Math.max(2, Math.round(((Number(item.value) || 0) / max) * 430));
    return `<text x="8" y="${y + 12}" fill="var(--cc-ink)" font-size="11">${esc(item.label)}</text>
      <rect x="250" y="${y}" width="${width}" height="14" rx="4" fill="var(--cc-accent-${(index % 4) + 1})"/>
      <text x="${258 + width}" y="${y + 12}" fill="var(--cc-ink)" font-size="11">${esc(item.value)}</text>`;
  }).join("");
  return `<svg class="chart-svg" viewBox="0 0 760 ${height}" role="img" aria-label="${esc(chart.title)}"><title>${esc(chart.title)}</title>${bars}</svg>`;
}

export function chartsBlock(charts, citeHtml) {
  const cards = (charts || []).map((chart, index) => {
    const source = chart.cite && citeHtml ? `<p class="sources">${citeHtml(chart.cite)}</p>` : "";
    const d3 = index === 0 ? `<div id="d3-lessons" class="d3-host"></div><script type="application/json" id="d3-lessons-data">${JSON.stringify(chart.series || [])}</script>` : "";
    return `<article class="chart-card" id="chart-${esc(chart.id)}"><h3>${esc(chart.title)}</h3><p class="muted">${esc(chart.note)}</p>${chartSvg(chart)}${d3}${source}</article>`;
  }).join("");
  return `<div class="chart-grid">${cards}</div>`;
}

export function iconParade() {
  const icons = [
    ["ACD", "a1"],
    ["Studio", "a2"],
    ["WFM", "a3"],
    ["QM", "a4"],
    ["AI", "a2"],
    ["API", "a1"],
    ["SIP", "a3"],
    ["E911", "a4"],
  ];
  const cubes = icons.map(([label, tone], index) => (
    `<span class="cube ${tone}" style="--i:${index}"><b>${esc(label)}</b></span>`
  )).join("");
  return `<div class="parade" aria-label="Product symbols">${cubes}</div>`;
}

export function counterRow(items) {
  const cells = items.map((item) => (
    `<span data-count="${Number(item.value) || 0}"><b>0</b><small>${esc(item.label)}</small></span>`
  )).join("");
  return `<div class="live-counters" id="live-counters">${cells}</div>`;
}
