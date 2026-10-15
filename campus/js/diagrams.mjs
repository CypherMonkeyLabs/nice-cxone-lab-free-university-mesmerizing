function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function motion(reduced) {
  if (reduced) return "";
  return `<animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1.8s" repeatCount="indefinite"/>`;
}

function edge(x1, y1, x2, y2, label, reduced) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `<path class="wire" d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="var(--cc-accent-1)" stroke-width="2" stroke-dasharray="7 5">${motion(reduced)}</path>
    <polygon points="${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}" fill="var(--cc-accent-2)"/>
    ${label ? `<text x="${mx}" y="${my - 8}" text-anchor="middle" fill="var(--cc-muted)" font-size="11">${esc(label)}</text>` : ""}`;
}

function node(x, y, label, tone) {
  const stroke = `var(--cc-accent-${(tone % 4) + 1})`;
  const lines = String(label).split("\n");
  const text = lines.map((line, index) => `<text x="${x}" y="${y + index * 14 - (lines.length - 1) * 7}" text-anchor="middle" fill="var(--cc-ink)" font-size="12" font-family="Palatino, Georgia, serif">${esc(line)}</text>`).join("");
  return `<g class="dnode"><rect x="${x - 62}" y="${y - 24}" width="124" height="${36 + lines.length * 8}" rx="14" fill="var(--cc-surface)" stroke="${stroke}" stroke-width="2"/>${text}</g>`;
}

export function diagramSvg(spec, reduced) {
  const title = esc(spec.title);
  if (spec.layout === "formula") {
    return `<svg class="live-diagram" viewBox="0 0 760 180" role="img" aria-label="${title}"><title>${title}</title>
      <rect x="24" y="28" width="712" height="120" rx="20" fill="var(--cc-surface)" stroke="var(--cc-accent-1)"/>
      <text x="380" y="78" text-anchor="middle" fill="var(--cc-accent-2)" font-size="22" font-family="ui-monospace, monospace">${esc(spec.formula)}</text>
      <text x="380" y="114" text-anchor="middle" fill="var(--cc-ink)" font-size="14">${esc(spec.example)}</text>
    </svg>`;
  }
  if (spec.layout === "rings") {
    const rings = (spec.rings || []).map((label, index) => {
      const size = 150 - index * 28;
      return `<circle cx="380" cy="100" r="${size / 2}" fill="none" stroke="var(--cc-accent-${(index % 4) + 1})" stroke-width="8" opacity="0.85"/>`;
    }).join("");
    const labels = (spec.rings || []).map((label, index) => `<text x="${80 + index * 160}" y="168" text-anchor="middle" fill="var(--cc-ink)" font-size="12">${esc(label)}</text>`).join("");
    return `<svg class="live-diagram" viewBox="0 0 760 190" role="img" aria-label="${title}"><title>${title}</title>${rings}<text x="380" y="104" text-anchor="middle" fill="var(--cc-ink)" font-size="13">1 is best</text>${labels}</svg>`;
  }
  if (spec.layout === "split") {
    const col = (items, x) => items.map((item, index) => node(x, 48 + index * 52, item, index)).join("");
    return `<svg class="live-diagram" viewBox="0 0 760 250" role="img" aria-label="${title}"><title>${title}</title>
      ${edge(250, 120, 510, 120, "", reduced)}
      ${col(spec.left || [], 160)}
      ${col(spec.right || [], 600)}
    </svg>`;
  }
  if (spec.layout === "orbit") {
    const around = spec.around || [];
    const cx = 380;
    const cy = 150;
    const satellites = around.map((label, index) => {
      const angle = (Math.PI * 2 * index) / around.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * 210;
      const y = cy + Math.sin(angle) * 110;
      return edge(cx + Math.cos(angle) * 46, cy + Math.sin(angle) * 28, x - Math.cos(angle) * 50, y - Math.sin(angle) * 16, "", reduced) + node(x, y, label, index);
    }).join("");
    return `<svg class="live-diagram" viewBox="0 0 760 300" role="img" aria-label="${title}"><title>${title}</title>
      ${satellites}
      ${node(cx, cy, spec.center || "ACD", 0)}
    </svg>`;
  }
  const nodes = spec.nodes || [];
  const width = 760;
  const height = spec.layout === "stack" ? 80 + nodes.length * 70 : 180;
  const placed = nodes.map((item, index) => {
    if (spec.layout === "stack") return { ...item, x: 380, y: 40 + index * 70 };
    return { ...item, x: 90 + index * ((width - 140) / Math.max(1, nodes.length - 1)), y: 90 };
  });
  const byId = Object.fromEntries(placed.map((item) => [item.id, item]));
  const wires = (spec.edges || []).map((item) => {
    const a = byId[item.from];
    const b = byId[item.to];
    if (!a || !b) return "";
    return edge(a.x + 62, a.y, b.x - 62, b.y, item.label, reduced);
  }).join("");
  const shapes = placed.map((item, index) => node(item.x, item.y, item.label, index)).join("");
  return `<svg class="live-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title>${wires}${shapes}</svg>`;
}

export function diagramCard(spec, citeHtml, reduced) {
  return `<figure class="figure diagram-card"><figcaption><strong>${esc(spec.title)}</strong> — ${esc(spec.caption)}</figcaption>${diagramSvg(spec, reduced)}<p class="sources">${citeHtml}</p></figure>`;
}
