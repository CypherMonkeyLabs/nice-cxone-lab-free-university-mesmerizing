/* First-open tour. Six steps, stored in this browser. Help can open it again. */

const KEY = "canon-tour-done";

const STEPS = [
  { title: "Home", selectors: ["a.brand"], body: "This is Home. The name in the header brings you back to the front door, where the tracks start." },
  { title: "Menu", selectors: ["#open-menu", "#open-menu-bar"], body: "Menu is the top-left button on a wide screen, and the left side of the bottom bar on a phone. It slides open. Escape, Close, or a tap outside puts it away." },
  { title: "Learn", selectors: ["a.section-chip[href='#/tracks']", "a[href='#/tracks']"], body: "Learn opens the course. Start here, then a track, then a room. Each room has takeaways, a picture, a worked example, and a quiz." },
  { title: "Diagrams", selectors: ["a.section-chip[href='#/diagrams']", "a[href='#/diagrams']"], body: "Diagrams are the moving study drawings. Open one, then use its download button if you want the SVG." },
  { title: "Play and Listen", selectors: ["a[href='#/play']", "[data-listen]"], body: "Play is the practice page. Listen reads the page with this browser's voice. Both stay buttons you can tap." },
  { title: "Downloads and the guide", selectors: ["a[href='#/downloads']", "#mascot-dock"], body: "Downloads holds the sheets, the card deck, and the zip. The monkey on the right is the guide. After this tour it greets you once in the middle, then sits on the right edge. You can drag it and close it." },
];

function ls(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (error) {
    return null;
  }
  return null;
}

function visible(el) {
  if (!el || el.closest("[hidden]")) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 8 && rect.height > 8 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

let layer = null;
let step = 0;

function targets() {
  const found = [];
  (STEPS[step].selectors || []).forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (found.includes(el) || !visible(el)) return;
      const scroller = el.closest(".banner-scroll");
      if (scroller) {
        const left = el.offsetLeft - 24;
        if (left < scroller.scrollLeft || left > scroller.scrollLeft + scroller.clientWidth - 80) scroller.scrollLeft = Math.max(0, left);
      }
      found.push(el);
    });
  });
  return found.slice(0, 2);
}

function placeCard(card) {
  const h1 = document.querySelector("h1");
  const h1rect = h1 ? h1.getBoundingClientRect() : null;
  const height = card.offsetHeight || 220;
  const bar = 72;
  let top = window.innerHeight - height - bar;
  if (h1rect && top < h1rect.bottom + 8 && top + height > h1rect.top) {
    const below = h1rect.bottom + 10;
    if (below + height < window.innerHeight - 8) top = below;
    else top = Math.max(8, h1rect.top - height - 8);
  }
  const maxTop = Math.max(8, window.innerHeight - height - 8);
  card.style.top = `${Math.max(8, Math.min(top, maxTop))}px`;
  card.style.left = "10px";
  card.style.width = "min(420px, calc(100vw - 20px))";
}

function paintSpots(nodes) {
  layer.querySelectorAll(".tour-spot").forEach((spot) => spot.remove());
  nodes.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const spot = document.createElement("div");
    spot.className = "tour-spot";
    spot.style.top = `${Math.max(4, rect.top - 6)}px`;
    spot.style.left = `${Math.max(4, rect.left - 6)}px`;
    spot.style.width = `${Math.min(window.innerWidth - 8, rect.width + 12)}px`;
    spot.style.height = `${rect.height + 12}px`;
    layer.appendChild(spot);
  });
  placeCard(layer.querySelector(".tour-card"));
}

function paint() {
  const card = layer.querySelector(".tour-card");
  const item = STEPS[step];
  card.querySelector("[data-tour-num]").textContent = String(step + 1);
  card.querySelector("h2").textContent = item.title;
  card.querySelector(".tour-text").textContent = item.body;
  card.querySelectorAll(".tour-dots span").forEach((dot, index) => {
    dot.classList.toggle("is-on", index === step);
  });
  const next = card.querySelector("[data-tour-next]");
  next.textContent = step === STEPS.length - 1 ? "OK" : "Next";
  card.querySelector("[data-tour-back]").hidden = step === 0;
  paintSpots(targets());
}

function close(finished) {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.body.classList.remove("onboard-open");
  if (layer) layer.remove();
  layer = null;
  if (finished === "done" || finished === "skip") {
    ls(KEY, finished === "done" ? "1" : "skip");
    document.dispatchEvent(new CustomEvent("canon-tour-finished"));
  }
}

export function openTour() {
  if (layer) return;
  document.body.classList.add("onboard-open");
  layer = document.createElement("div");
  layer.className = "tour-layer";
  layer.setAttribute("role", "dialog");
  layer.setAttribute("aria-modal", "true");
  layer.setAttribute("aria-labelledby", "tour-title");
  const dots = STEPS.map(() => "<span></span>").join("");
  layer.innerHTML = `<div class="tour-card"><p class="tour-kicker"><span class="tour-num" data-tour-num>1</span> Tour</p><h2 id="tour-title"></h2><p class="tour-text"></p><div class="tour-dots">${dots}</div><div class="tour-actions"><button type="button" data-tour-back hidden>Back</button><button type="button" data-tour-skip>Skip</button><button type="button" data-tour-next>Next</button></div></div>`;
  document.body.appendChild(layer);
  step = 0;
  paint();
  layer.querySelector("[data-tour-next]").focus();
  layer.addEventListener("click", (event) => {
    if (event.target.closest("[data-tour-back]")) {
      if (step > 0) {
        step -= 1;
        paint();
      }
      return;
    }
    if (event.target.closest("[data-tour-skip]")) {
      close("skip");
      return;
    }
    if (event.target.closest("[data-tour-next]")) {
      if (step >= STEPS.length - 1) close("done");
      else {
        step += 1;
        paint();
      }
    }
  });
  layer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close("skip");
  });
  window.addEventListener("resize", () => {
    if (layer) paintSpots(targets());
  });
}

export function bootTour() {
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-replay-onboard]")) return;
    event.preventDefault();
    ls(KEY, null);
    openTour();
  });
  if (!ls(KEY)) window.setTimeout(openTour, 700);
}
