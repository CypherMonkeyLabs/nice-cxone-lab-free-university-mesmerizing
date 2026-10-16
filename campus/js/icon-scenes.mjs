import { cappedPixelRatio, motionReduced } from "./pixel.mjs";

let raf = 0;
let renderer = null;
let running = false;
let generation = 0;
const stops = [];

const KINDS = ["foundations", "platform", "acd", "people", "routing", "studio", "ivr", "digital", "wfm", "quality", "enlighten", "apis", "crm", "voice", "migration", "ecosystem", "skills-acd", "wfm-day", "qm-ia", "cti-cpaas", "eco-map"];

function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "vendor/three.min.js";
    script.onload = () => resolve(window.THREE);
    script.onerror = () => reject(new Error("Three.js did not load"));
    document.head.appendChild(script);
  });
}

function hexColor(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return Number.parseInt(raw.slice(1), 16);
  return fallback;
}

function palette() {
  return [
    hexColor("--cc-accent-1", 0x3ecbff),
    hexColor("--cc-accent-2", 0xffb020),
    hexColor("--cc-accent-3", 0xb09cff),
    hexColor("--cc-accent-4", 0x3ee0a4),
  ];
}

function shapeFor(THREE, kind) {
  if (kind === "platform") return new THREE.BoxGeometry(0.95, 0.95, 0.95);
  if (kind === "acd") return new THREE.OctahedronGeometry(0.78);
  if (kind === "people") return new THREE.SphereGeometry(0.58, 22, 22);
  if (kind === "routing") return new THREE.TorusGeometry(0.52, 0.16, 14, 36);
  if (kind === "studio") return new THREE.TorusKnotGeometry(0.4, 0.12, 70, 10);
  if (kind === "ivr") return new THREE.ConeGeometry(0.55, 1.05, 6);
  if (kind === "digital") return new THREE.TetrahedronGeometry(0.78);
  if (kind === "wfm") return new THREE.CylinderGeometry(0.42, 0.42, 0.95, 6);
  if (kind === "quality") return new THREE.TorusGeometry(0.48, 0.08, 8, 28);
  if (kind === "enlighten") return new THREE.DodecahedronGeometry(0.62);
  if (kind === "apis") return new THREE.OctahedronGeometry(0.62, 1);
  if (kind === "crm") return new THREE.BoxGeometry(1.15, 0.72, 0.22);
  if (kind === "voice") return new THREE.SphereGeometry(0.42, 18, 18);
  if (kind === "migration") return new THREE.ConeGeometry(0.42, 1.15, 4);
  if (kind === "ecosystem") return new THREE.IcosahedronGeometry(0.62, 1);
  if (kind === "skills-acd") return new THREE.OctahedronGeometry(0.7);
  if (kind === "wfm-day") return new THREE.BoxGeometry(0.9, 0.55, 0.7);
  if (kind === "qm-ia") return new THREE.TorusGeometry(0.46, 0.14, 10, 24);
  if (kind === "cti-cpaas") return new THREE.BoxGeometry(0.95, 0.62, 0.28);
  if (kind === "eco-map") return new THREE.DodecahedronGeometry(0.58);
  return new THREE.IcosahedronGeometry(0.72, 0);
}

function listen(target, type, fn, options) {
  target.addEventListener(type, fn, options);
  stops.push(() => target.removeEventListener(type, fn, options));
}

export function unmountIconScenes() {
  generation += 1;
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  while (stops.length) stops.pop()();
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }
}

function webglReady() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl") || probe.getContext("experimental-webgl");
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    return true;
  } catch (error) {
    return false;
  }
}

export async function mountIconScenes(root) {
  unmountIconScenes();
  const token = generation;
  const scope = root || document;
  const canvases = [...scope.querySelectorAll("canvas.icon-live")];
  canvases.forEach((canvas) => { delete canvas.dataset.live; });
  if (!canvases.length) return { ok: false };
  if (motionReduced() || !webglReady()) return { ok: false, reason: "webgl" };
  let THREE;
  try {
    THREE = await loadThree();
  } catch (error) {
    return { ok: false, reason: "webgl" };
  }
  if (token !== generation) return { ok: false, reason: "stale" };
  const cell = 128;
  const cols = 4;
  const rows = Math.ceil(KINDS.length / cols);
  const atlas = document.createElement("canvas");
  atlas.width = cell * cols;
  atlas.height = cell * rows;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: atlas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch (error) {
    return { ok: false, reason: "webgl" };
  }
  renderer.setSize(atlas.width, atlas.height, false);
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);
  const colors = palette();
  const scenes = KINDS.map((kind, index) => {
    const scene = new THREE.Scene();
    const tone = colors[index % colors.length];
    const mesh = new THREE.Mesh(shapeFor(THREE, kind), new THREE.MeshBasicMaterial({ color: tone }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.03, 8, 40), new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    halo.rotation.x = Math.PI / 2.4;
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(mesh, halo, packet);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 0.4, 3.3);
    camera.lookAt(0, 0, 0);
    return { kind, scene, mesh, halo, packet, camera, tone };
  });
  const byKind = Object.fromEntries(scenes.map((item) => [item.kind, item]));
  const targets = canvases.map((canvas) => {
    const ctx = canvas.getContext("2d");
    if (ctx) canvas.dataset.live = "1";
    return { canvas, ctx, kind: canvas.dataset.iconKind };
  }).filter((item) => item.ctx);
  const dropLive = () => {
    running = false;
    targets.forEach((item) => { delete item.canvas.dataset.live; });
  };
  atlas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    dropLive();
  });
  function recolor() {
    const next = palette();
    scenes.forEach((item, index) => {
      const tone = next[index % next.length];
      item.mesh.material.color.setHex(tone);
      item.halo.material.color.setHex(tone);
    });
  }
  function resizeTargets() {
    targets.forEach((item) => {
      const rect = item.canvas.getBoundingClientRect();
      const ratio = cappedPixelRatio();
      const width = Math.max(2, Math.round(rect.width * ratio));
      const height = Math.max(2, Math.round(rect.height * ratio));
      if (item.canvas.width !== width || item.canvas.height !== height) {
        item.canvas.width = width;
        item.canvas.height = height;
      }
    });
  }
  listen(window, "cxone-theme", recolor);
  listen(window, "resize", resizeTargets);
  resizeTargets();
  running = true;
  const clock = new THREE.Clock();
  let batch = 0;
  let iconsOnScreen = true;
  function arm() {
    if (!running || token !== generation || raf) return;
    if (document.visibilityState === "hidden" || !iconsOnScreen) return;
    raf = requestAnimationFrame(loop);
  }
  const loop = () => {
    raf = 0;
    if (!running || token !== generation) return;
    if (motionReduced()) {
      running = false;
      return;
    }
    if (document.visibilityState === "hidden" || !iconsOnScreen) return;
    raf = requestAnimationFrame(loop);
    const time = clock.getElapsedTime();
    renderer.setClearColor(0x000000, 0);
    const batchStart = batch * 8;
    const batches = Math.ceil(scenes.length / 8) || 1;
    batch = (batch + 1) % batches;
    scenes.forEach((item, index) => {
      if (index < batchStart || index >= batchStart + 8) return;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cell;
      const y = (rows - 1 - row) * cell;
      item.mesh.rotation.y = time * 0.7 + index;
      item.mesh.rotation.x = Math.sin(time * 0.5 + index) * 0.35;
      item.halo.rotation.z = time * 0.8;
      const angle = time * 1.3 + index;
      item.packet.position.set(Math.cos(angle) * 0.85, Math.sin(angle * 1.3) * 0.18, Math.sin(angle) * 0.85);
      const fly = Math.min(1, time / 0.9);
      const dist = 5.4 - fly * 2.1;
      item.camera.position.z = dist;
      item.camera.lookAt(0, 0, 0);
      renderer.setViewport(x, y, cell, cell);
      renderer.setScissor(x, y, cell, cell);
      renderer.clear();
      renderer.render(item.scene, item.camera);
    });
    targets.forEach((item) => {
      if (!item.canvas.isConnected) return;
      const index = KINDS.indexOf(item.kind);
      if (index < 0) return;
      const col = index % cols;
      const row = Math.floor(index / cols);
      item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
      item.ctx.drawImage(atlas, col * cell, row * cell, cell, cell, 0, 0, item.canvas.width, item.canvas.height);
    });
  };
  listen(document, "visibilitychange", arm);
  if (typeof IntersectionObserver === "function") {
    const seen = new IntersectionObserver((entries) => {
      iconsOnScreen = entries.some((entry) => entry.isIntersecting);
      if (iconsOnScreen) arm();
    });
    canvases.forEach((canvas) => seen.observe(canvas));
    stops.push(() => seen.disconnect());
  }
  arm();
  return { ok: true, shared: true, byKind: Object.keys(byKind).length };
}
