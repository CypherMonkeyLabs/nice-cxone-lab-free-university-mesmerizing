/* Draggable guide monkey, adapted from the UC lab guide/dragbot.js. Pointer Events drag, edge snap,
   tilt from velocity, saved position, reset button. With no saved spot the bot sits at its home corner
   and steps aside to the nearest clear spot when it would cover a heading. */
const KEY = "cg-bot-pos-v1";
const M = 8;

export function bindDragbot({ onTap } = {}) {
  const dock = document.getElementById("mascot-dock");
  if (!dock) return;
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = new URL("../assets/dragbot.css", import.meta.url).href;
  document.head.appendChild(sheet);
  sheet.addEventListener("load", () => apply());
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  const phone = matchMedia("(max-width: 800px)");
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "bot-reset";
  reset.hidden = true;
  reset.setAttribute("aria-label", "Move the guide back to its home spot");
  reset.textContent = "\u21BA";
  document.body.appendChild(reset);

  let pos = null, drag = null, dodge = null, timer = 0;
  try { pos = JSON.parse(localStorage.getItem(KEY)); } catch (e) { pos = null; }
  if (!pos || typeof pos.fx !== "number" || typeof pos.fy !== "number") pos = null;

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  function bounds() {
    const bar = document.querySelector("nav.bottom");
    let bottom = M;
    if (bar && getComputedStyle(bar).display !== "none") bottom = Math.max(M, innerHeight - bar.getBoundingClientRect().top + M);
    const w = dock.offsetWidth, h = dock.offsetHeight;
    return { x0: M, y0: M, x1: innerWidth - w - M, y1: innerHeight - h - bottom };
  }
  function place(x, y) {
    const s = dock.style;
    s.left = Math.round(x) + "px"; s.top = Math.round(y) + "px"; s.right = "auto"; s.bottom = "auto";
  }
  function home() {
    const s = dock.style;
    s.left = s.top = s.right = s.bottom = "";
  }
  function greeting() { return dock.classList.contains("is-greet"); }
  function apply() {
    if (drag && drag.moved) return;
    dock.classList.toggle("is-moved", !!pos);
    reset.hidden = !pos || greeting();
    if (greeting()) { home(); return; }
    if (pos) {
      const b = bounds();
      place(clamp(b.x0 + pos.fx * (b.x1 - b.x0), b.x0, b.x1), clamp(b.y0 + pos.fy * (b.y1 - b.y0), b.y0, b.y1));
      return;
    }
    if (dodge) place(dodge.x, dodge.y); else home();
  }
  function store(x, y) {
    const b = bounds();
    pos = { fx: b.x1 > b.x0 ? (x - b.x0) / (b.x1 - b.x0) : 0, fy: b.y1 > b.y0 ? (y - b.y0) / (b.y1 - b.y0) : 0 };
    try { localStorage.setItem(KEY, JSON.stringify(pos)); } catch (e) { /* storage off */ }
  }
  function tilt(rx, ry, lift) {
    const svg = dock.querySelector("svg");
    if (svg) svg.style.transform = rx || ry || lift ? `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${lift ? 1.08 : 1})` : "";
  }
  function goHome() {
    pos = null; dodge = null;
    try { localStorage.removeItem(KEY); } catch (e) { /* storage off */ }
    dock.classList.add("is-snapping"); home(); apply(); tilt(0, 0, 0); schedule(50);
  }

  // Default home: stay clear of visible headings. Never overrides a spot the reader chose.
  function headings() {
    const main = document.getElementById("main") || document.body;
    return [...main.querySelectorAll("h1, h2, h3")].map((n) => n.getBoundingClientRect()).filter((r) => r.width > 0 && r.bottom > 0 && r.top < innerHeight);
  }
  function hits(x, y, w, h, list) {
    return list.some((r) => x < r.right + 6 && x + w > r.left - 6 && y < r.bottom + 6 && y + h > r.top - 6);
  }
  function dodgeHeadings() {
    if (pos || drag || greeting() || document.body.classList.contains("menu-open")) return;
    const list = headings();
    const b = bounds(), w = dock.offsetWidth, h = dock.offsetHeight;
    const homeX = b.x1, homeY = b.y1;
    let pick = null;
    if (hits(homeX, homeY, w, h, list)) {
      const step = 24;
      for (let y = b.y1; y >= b.y0 && !pick; y -= step) if (!hits(homeX, y, w, h, list)) pick = { x: homeX, y };
      for (let y = b.y1; y >= b.y0 && !pick; y -= step) if (!hits(b.x0, y, w, h, list)) pick = { x: b.x0, y };
    }
    const same = (!pick && !dodge) || (pick && dodge && pick.x === dodge.x && pick.y === dodge.y);
    if (same) return;
    dodge = pick;
    dock.classList.add("is-snapping");
    if (pick) place(pick.x, pick.y); else home();
  }
  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(dodgeHeadings, ms === undefined ? 260 : ms);
  }

  dock.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const r = dock.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, x: r.left, y: r.top, px: e.clientX, py: e.clientY, t: e.timeStamp, vx: 0, vy: 0, moved: false };
    try { dock.setPointerCapture(e.pointerId); } catch (err) { /* no capture */ }
  });
  dock.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 6) return;
    if (!drag.moved) { drag.moved = true; dock.classList.remove("is-snapping"); }
    const b = bounds(), dt = Math.max(1, e.timeStamp - drag.t);
    drag.vx = drag.vx * 0.6 + ((e.clientX - drag.px) / dt) * 0.4;
    drag.vy = drag.vy * 0.6 + ((e.clientY - drag.py) / dt) * 0.4;
    drag.px = e.clientX; drag.py = e.clientY; drag.t = e.timeStamp;
    drag.x = clamp(drag.ox + e.clientX - drag.sx, b.x0, b.x1);
    drag.y = clamp(drag.oy + e.clientY - drag.sy, b.y0, b.y1);
    place(drag.x, drag.y);
    if (!calm.matches) tilt(clamp(-drag.vy * 22, -25, 25).toFixed(1), clamp(drag.vx * 22, -25, 25).toFixed(1), true);
    else tilt(0, 0, true);
  });
  function end(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    try { dock.releasePointerCapture(e.pointerId); } catch (err) { /* released */ }
    if (!d.moved) { if (e.type === "pointerup" && onTap) onTap(); return; }
    const b = bounds(), dist = [d.x - b.x0, b.x1 - d.x, d.y - b.y0, b.y1 - d.y], k = dist.indexOf(Math.min(...dist));
    const x = k === 0 ? b.x0 : k === 1 ? b.x1 : d.x, y = k === 2 ? b.y0 : k === 3 ? b.y1 : d.y;
    dock.classList.add("is-snapping");
    place(x, y); tilt(0, 0, 0); store(x, y); dock.classList.add("is-moved"); reset.hidden = false;
  }
  dock.addEventListener("pointerup", end);
  dock.addEventListener("pointercancel", end);
  dock.addEventListener("transitionend", (e) => { if (e.target === dock) dock.classList.remove("is-snapping"); });
  reset.addEventListener("click", goHome);
  addEventListener("resize", () => { apply(); schedule(); });
  addEventListener("scroll", () => schedule(), { passive: true });
  addEventListener("hashchange", () => { dodge = null; apply(); schedule(700); });
  new MutationObserver(() => { apply(); schedule(); }).observe(dock, { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(() => schedule(400)).observe(document.getElementById("main") || document.body, { childList: true, subtree: true });
  apply();
  schedule(900);
  void phone;
}
