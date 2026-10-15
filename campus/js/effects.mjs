import { animate } from "../vendor/anime.esm.min.js";
import rough from "../vendor/rough.esm.js";
import confetti from "../vendor/confetti.module.mjs";

function reduced() {
  return document.documentElement.dataset.motion === "reduce";
}

function loadScript(src) {
  const existing = document.querySelector(`script[data-src="${src}"]`);
  if (existing) {
    return existing.dataset.ready === "1" ? Promise.resolve() : new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(src)), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.dataset.src = src;
    script.onload = () => {
      script.dataset.ready = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(src));
    document.head.appendChild(script);
  });
}

export function countUp(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-count]").forEach((node) => {
    const target = Number(node.dataset.count);
    const out = node.querySelector("b") || node;
    if (!Number.isFinite(target)) return;
    if (reduced()) {
      out.textContent = String(target);
      return;
    }
    const state = { n: 0 };
    try {
      animate(state, {
        n: target,
        duration: 900,
        onUpdate: () => {
          out.textContent = String(Math.round(state.n));
        },
      });
    } catch (error) {
      out.textContent = String(target);
    }
  });
}

export function drawRoughFrame(root) {
  const scope = root || document;
  const svg = scope.querySelector("svg.rough-frame");
  if (!svg || svg.dataset.rough === "1") return;
  try {
    const rc = rough.svg(svg, { options: { roughness: 1.3, bowing: 0.8 } });
    svg.appendChild(rc.rectangle(8, 8, 744, 74, { stroke: "#3ecbff", strokeWidth: 2 }));
    svg.dataset.rough = "1";
  } catch (error) {
    svg.dataset.rough = "skip";
  }
}

export async function drawD3Chart(root) {
  const scope = root || document;
  const host = scope.querySelector("#d3-lessons");
  const dataNode = scope.querySelector("#d3-lessons-data");
  if (!host || !dataNode || host.dataset.drawn === "1") return;
  let series = [];
  try {
    series = JSON.parse(dataNode.textContent || "[]");
  } catch (error) {
    return;
  }
  if (!series.length) return;
  try {
    await loadScript("vendor/d3.min.js");
  } catch (error) {
    return;
  }
  const d3 = window.d3;
  if (!d3) return;
  const width = 760;
  const row = 18;
  const height = 12 + series.length * row;
  const max = d3.max(series, (item) => Number(item.value) || 0) || 1;
  const scale = d3.scaleLinear().domain([0, max]).range([0, 420]);
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");
  svg.append("title").text("Same lesson counts, drawn with d3");
  const rows = svg.selectAll("g").data(series).join("g").attr("transform", (item, index) => `translate(0, ${index * row})`);
  rows.append("text").attr("x", 4).attr("y", 12).attr("fill", "currentColor").attr("font-size", 11).text((item) => item.label);
  rows.append("rect").attr("x", 250).attr("y", 2).attr("height", 12).attr("rx", 3).attr("fill", "#3ecbff").attr("width", (item) => scale(Number(item.value) || 0));
  host.dataset.drawn = "1";
}

export async function mountMarkmap(root) {
  const scope = root || document;
  const svg = scope.querySelector("#ecosystem-markmap");
  if (!svg || svg.dataset.drawn === "1") return;
  try {
    await loadScript("vendor/d3.min.js");
    await loadScript("vendor/markmap-view.js");
  } catch (error) {
    return;
  }
  const Markmap = window.markmap && window.markmap.Markmap;
  if (!Markmap) return;
  const leaf = (content) => ({ content, children: [] });
  const data = {
    content: "CXone",
    children: [
      { content: "Studio", children: [leaf("MENU"), leaf("REQAGENT")] },
      { content: "ACD", children: [leaf("Skill"), leaf("Bullseye")] },
      { content: "WFM", children: [leaf("Forecast"), leaf("IEX is separate")] },
      { content: "QM", children: [leaf("Recording"), leaf("Hold gap")] },
      { content: "Enlighten", children: [leaf("Autopilot"), leaf("AutoSummary")] },
      { content: "APIs", children: [leaf("Discovery"), leaf("Access key")] },
    ],
  };
  const map = new Markmap(svg, { duration: reduced() ? 0 : 500 });
  map.setData(data).then(() => map.fit()).catch(() => {
    svg.dataset.drawn = "err";
  });
  svg.dataset.drawn = "1";
}

export function burst() {
  if (reduced()) return;
  try {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, disableForReducedMotion: true });
  } catch (error) {
    return;
  }
}

export function decorateFloor(root) {
  const scope = root || document;
  countUp(scope);
  drawRoughFrame(scope);
  drawD3Chart(scope);
  mountMarkmap(scope);
}
