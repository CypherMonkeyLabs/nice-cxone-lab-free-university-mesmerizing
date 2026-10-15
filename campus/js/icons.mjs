const GLYPHS = {
  foundations: `<polygon points="80,18 104,30 104,58 80,74 56,58 56,30" fill="url(#face)" stroke="var(--cc-ink)" stroke-width="2"/><path d="M80 34 v22" stroke="var(--cc-bg)" stroke-width="3"/>`,
  platform: `<polygon points="62,28 98,28 108,40 52,40" fill="url(#face)"/><polygon points="58,44 102,44 112,56 48,56" fill="url(#side)"/><polygon points="54,60 106,60 116,72 44,72" fill="var(--cc-accent-2)"/>`,
  acd: `<polygon points="80,22 108,48 80,78 52,48" fill="url(#face)" stroke="var(--cc-ink)"/><circle cx="80" cy="48" r="8" fill="var(--cc-bg)"/>`,
  people: `<circle cx="68" cy="36" r="10" fill="url(#face)"/><circle cx="94" cy="38" r="10" fill="url(#side)"/><path d="M50 70 Q68 52 86 70" fill="url(#face)"/><path d="M78 72 Q96 54 114 72" fill="url(#side)"/>`,
  routing: `<ellipse cx="80" cy="46" rx="34" ry="16" fill="none" stroke="var(--cc-accent-1)" stroke-width="4"/><ellipse cx="80" cy="46" rx="22" ry="10" fill="none" stroke="var(--cc-accent-2)" stroke-width="4"/><circle cx="80" cy="46" r="5" fill="var(--cc-accent-4)"/>`,
  studio: `<circle cx="58" cy="36" r="8" fill="url(#face)"/><circle cx="102" cy="34" r="8" fill="url(#side)"/><circle cx="80" cy="62" r="8" fill="var(--cc-accent-2)"/><path d="M66 38 L94 36 M66 42 L74 58 M94 40 L86 58" stroke="var(--cc-ink)" stroke-width="2"/>`,
  ivr: `<rect x="58" y="24" width="44" height="52" rx="6" fill="url(#face)"/><circle cx="70" cy="40" r="3" fill="var(--cc-bg)"/><circle cx="80" cy="40" r="3" fill="var(--cc-bg)"/><circle cx="90" cy="40" r="3" fill="var(--cc-bg)"/><circle cx="70" cy="52" r="3" fill="var(--cc-bg)"/><circle cx="80" cy="52" r="3" fill="var(--cc-accent-2)"/><circle cx="90" cy="52" r="3" fill="var(--cc-bg)"/>`,
  digital: `<rect x="48" y="28" width="40" height="26" rx="8" fill="url(#face)"/><rect x="72" y="44" width="44" height="26" rx="8" fill="url(#side)"/>`,
  wfm: `<rect x="52" y="28" width="56" height="46" rx="4" fill="url(#face)"/><path d="M52 40 h56" stroke="var(--cc-bg)"/><circle cx="68" cy="54" r="3" fill="var(--cc-accent-2)"/><circle cx="80" cy="54" r="3" fill="var(--cc-bg)"/><circle cx="92" cy="54" r="3" fill="var(--cc-bg)"/>`,
  quality: `<path d="M46 52 H58 L66 32 L78 70 L90 40 L98 52 H114" fill="none" stroke="var(--cc-accent-1)" stroke-width="4"/>`,
  enlighten: `<polygon points="80,20 88,42 112,42 92,56 100,78 80,64 60,78 68,56 48,42 72,42" fill="url(#face)" stroke="var(--cc-accent-2)"/>`,
  apis: `<rect x="46" y="40" width="22" height="16" rx="3" fill="url(#face)"/><path d="M68 48 H92" stroke="var(--cc-accent-2)" stroke-width="4"/><circle cx="100" cy="40" r="6" fill="url(#side)"/><circle cx="112" cy="56" r="6" fill="var(--cc-accent-4)"/><circle cx="96" cy="64" r="6" fill="var(--cc-accent-1)"/>`,
  crm: `<rect x="54" y="26" width="52" height="36" rx="4" fill="url(#face)"/><path d="M54 38 h52" stroke="var(--cc-bg)"/><rect x="62" y="46" width="28" height="6" fill="var(--cc-accent-2)"/>`,
  voice: `<path d="M62 40 a18 18 0 0 1 36 0 v8 a8 8 0 0 1 -8 8 h-4 v10 h-12 v-10 h-4 a8 8 0 0 1 -8 -8z" fill="url(#face)"/><path d="M58 78 h44" stroke="var(--cc-accent-2)" stroke-width="4"/>`,
  migration: `<path d="M40 70 L70 36 H96 L126 70" fill="none" stroke="url(#face)" stroke-width="8"/><path d="M70 36 V70 M96 36 V70" stroke="var(--cc-accent-2)" stroke-width="3"/>`,
  ecosystem: `<circle cx="80" cy="48" r="8" fill="var(--cc-accent-2)"/><ellipse cx="80" cy="48" rx="36" ry="14" fill="none" stroke="var(--cc-accent-1)" stroke-width="3"/><ellipse cx="80" cy="48" rx="14" ry="32" fill="none" stroke="var(--cc-accent-3)" stroke-width="3"/>`,
};

export function isoIcon(kind) {
  const id = String(kind || "x").replace(/[^a-z0-9-]/g, "");
  const glyph = (GLYPHS[kind] || GLYPHS.foundations)
    .replaceAll("url(#face)", `url(#face-${id})`)
    .replaceAll("url(#side)", `url(#side-${id})`);
  return `<svg class="iso" viewBox="0 0 160 150" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="top-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--cc-accent-1)"/><stop offset="1" stop-color="var(--cc-accent-3)"/></linearGradient>
      <linearGradient id="left-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cc-accent-3)"/><stop offset="1" stop-color="var(--cc-bg)"/></linearGradient>
      <linearGradient id="right-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cc-accent-2)"/><stop offset="1" stop-color="var(--cc-bg)"/></linearGradient>
      <linearGradient id="face-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--cc-accent-1)"/><stop offset="1" stop-color="var(--cc-accent-4)"/></linearGradient>
      <linearGradient id="side-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--cc-accent-3)"/><stop offset="1" stop-color="var(--cc-accent-2)"/></linearGradient>
      <filter id="sh-${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="4" flood-color="#000" flood-opacity="0.45"/></filter>
    </defs>
    <g filter="url(#sh-${id})">
      <polygon points="80,118 132,92 80,66 28,92" fill="url(#top-${id})"/>
      <polygon points="28,92 80,118 80,138 28,112" fill="url(#left-${id})"/>
      <polygon points="80,118 132,92 132,112 80,138" fill="url(#right-${id})"/>
      <g>${glyph}</g>
    </g>
  </svg>`;
}

export function progressRing(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const dash = (value / 100) * 94;
  return `<svg class="ring-meter" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" class="ring-track"/><circle cx="18" cy="18" r="15" class="ring-value" stroke-dasharray="${dash} 94"/></svg>`;
}

export function bindTilt(root) {
  const scope = root || document;
  scope.querySelectorAll(".holo").forEach((card) => {
    if (card.dataset.tilt === "1") return;
    card.dataset.tilt = "1";
    card.addEventListener("pointermove", (event) => {
      if (document.documentElement.dataset.motion === "reduce") return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}
