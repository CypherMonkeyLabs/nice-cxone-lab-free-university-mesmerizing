let raf = 0;
let renderer = null;
let running = false;
let generation = 0;
const stops = [];

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
  return {
    bg: hexColor("--cc-bg", 0x071018),
    a: hexColor("--cc-accent-1", 0x3ecbff),
    b: hexColor("--cc-accent-2", 0xffb020),
    c: hexColor("--cc-accent-3", 0xb09cff),
    d: hexColor("--cc-accent-4", 0x3ee0a4),
  };
}

function listen(target, type, fn, options) {
  target.addEventListener(type, fn, options);
  stops.push(() => target.removeEventListener(type, fn, options));
}

function showFallback(canvas, stage) {
  canvas.hidden = true;
  const fallback = stage && stage.querySelector(".hero-fallback");
  if (fallback) fallback.hidden = false;
}

export function unmountHero() {
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

export async function mountHero(canvas) {
  unmountHero();
  const token = generation;
  if (!canvas) return { ok: false };
  const stage = canvas.closest(".hero-stage");
  const reduced = document.documentElement.dataset.motion === "reduce"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "full";
  if (document.documentElement.dataset.motion === "reduce") {
    showFallback(canvas, stage);
    return { ok: false, reason: "reduced" };
  }
  let THREE;
  try {
    THREE = await loadThree();
  } catch (error) {
    if (token !== generation) return { ok: false, reason: "stale" };
    showFallback(canvas, stage);
    return { ok: false, reason: "webgl" };
  }
  if (token !== generation || !canvas.isConnected) return { ok: false, reason: "stale" };
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    showFallback(canvas, stage);
    return { ok: false, reason: "webgl" };
  }
  canvas.hidden = false;
  const fallback = stage && stage.querySelector(".hero-fallback");
  if (fallback) fallback.hidden = true;

  const colors = palette();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);
  scene.fog = new THREE.FogExp2(colors.bg, 0.032);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);
  camera.position.set(0, 5.6, 14);

  scene.add(new THREE.AmbientLight(0xffffff, 0.38));
  const key = new THREE.PointLight(colors.a, 22, 48);
  key.position.set(5, 9, 7);
  const fill = new THREE.PointLight(colors.c, 14, 46);
  fill.position.set(-7, 3, 5);
  const rim = new THREE.PointLight(colors.b, 10, 36);
  rim.position.set(0, -2, -8);
  scene.add(key, fill, rim);

  const grid = new THREE.GridHelper(40, 32, colors.a, colors.c);
  grid.position.y = -1.6;
  const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMats.forEach((mat) => {
    mat.transparent = true;
    mat.opacity = 0.55;
  });
  scene.add(grid);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 1),
    new THREE.MeshBasicMaterial({ color: colors.c, wireframe: true, transparent: true, opacity: 0.7 }),
  );
  scene.add(core);
  const coreGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 24, 24),
    new THREE.MeshBasicMaterial({ color: colors.a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  scene.add(coreGlow);

  const rings = new THREE.Group();
  const ringMats = [];
  for (let index = 0; index < 5; index += 1) {
    const mat = new THREE.MeshBasicMaterial({
      color: [colors.a, colors.b, colors.c, colors.d, colors.a][index],
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    ringMats.push(mat);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.2 + index * 0.78, 0.03, 10, 120), mat);
    torus.rotation.x = Math.PI / 2.2 + index * 0.22;
    torus.rotation.y = index * 0.45;
    rings.add(torus);
  }
  scene.add(rings);

  const labels = ["Contact", "POC", "Script", "Skill", "Agent", "WFM", "QM", "API"];
  const nodeMats = [];
  const nodes = labels.map((label, index) => {
    const tone = [colors.a, colors.b, colors.c, colors.d][index % 4];
    const mat = new THREE.MeshStandardMaterial({
      color: tone,
      emissive: tone,
      emissiveIntensity: 0.95,
      roughness: 0.22,
      metalness: 0.45,
    });
    nodeMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 28), mat);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshBasicMaterial({ color: tone, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    mesh.add(halo);
    mesh.add(labelSprite(THREE, label, tone));
    scene.add(mesh);
    return mesh;
  });

  const curve = new THREE.CatmullRomCurve3(nodes.map((node) => node.position), true, "catmullrom", 0.35);
  const samples = 96;
  const linePos = new Float32Array(samples * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: colors.b, transparent: true, opacity: 0.9 });
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
  const scratch = new THREE.Vector3();
  const packet = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  const packetHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 12),
    new THREE.MeshBasicMaterial({ color: colors.b, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  packet.add(packetHalo);
  scene.add(packet);

  const count = 520;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 36;
    positions[index * 3 + 1] = Math.random() * 12 - 2;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 36;
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dotsMat = new THREE.PointsMaterial({ color: colors.a, size: 0.065, transparent: true, opacity: 0.8 });
  const dots = new THREE.Points(dotsGeo, dotsMat);
  scene.add(dots);

  let pointerX = 0;
  let pointerY = 0;
  let scrollP = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(2, rect.width);
    const height = Math.max(2, rect.height);
    const cap = width < 800 ? 1.15 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function place(time) {
    nodes.forEach((mesh, index) => {
      const angle = time * 0.22 + (index / nodes.length) * Math.PI * 2;
      const radius = 4.4 + (index % 3) * 0.45;
      mesh.position.set(
        Math.cos(angle) * radius,
        0.55 + Math.sin(time * 0.8 + index) * 0.42,
        Math.sin(angle) * radius * 0.78,
      );
    });
    for (let index = 0; index < samples; index += 1) {
      curve.getPoint(index / (samples - 1), scratch);
      linePos[index * 3] = scratch.x;
      linePos[index * 3 + 1] = scratch.y;
      linePos[index * 3 + 2] = scratch.z;
    }
    lineGeo.attributes.position.needsUpdate = true;
    curve.getPoint((time * 0.08) % 1, scratch);
    packet.position.copy(scratch);
  }
  function recolor() {
    const next = palette();
    scene.background.setHex(next.bg);
    scene.fog.color.setHex(next.bg);
    key.color.setHex(next.a);
    fill.color.setHex(next.c);
    rim.color.setHex(next.b);
    gridMats.forEach((mat) => mat.color.setHex(next.a));
    core.material.color.setHex(next.c);
    coreGlow.material.color.setHex(next.a);
    ringMats.forEach((mat, index) => mat.color.setHex([next.a, next.b, next.c, next.d, next.a][index]));
    nodeMats.forEach((mat, index) => {
      const tone = [next.a, next.b, next.c, next.d][index % 4];
      mat.color.setHex(tone);
      mat.emissive.setHex(tone);
    });
    lineMat.color.setHex(next.b);
    packetHalo.material.color.setHex(next.b);
    dotsMat.color.setHex(next.a);
  }
  listen(window, "resize", resize);
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    stops.push(() => observer.disconnect());
  }
  listen(window, "pointermove", (event) => {
    pointerX = event.clientX / Math.max(1, window.innerWidth) - 0.5;
    pointerY = event.clientY / Math.max(1, window.innerHeight) - 0.5;
  });
  listen(window, "scroll", () => {
    scrollP = Math.min(1, window.scrollY / 700);
  }, { passive: true });
  listen(window, "cxone-theme", recolor);
  resize();
  place(0);
  renderer.render(scene, camera);
  running = true;
  const clock = new THREE.Clock();
  const loop = () => {
    if (!running || token !== generation || !canvas.isConnected) return;
    raf = requestAnimationFrame(loop);
    if (document.visibilityState === "hidden") return;
    const time = clock.getElapsedTime();
    rings.rotation.y = time * 0.18;
    rings.rotation.z = Math.sin(time * 0.22) * 0.18;
    core.rotation.y = time * 0.35;
    core.rotation.x = Math.sin(time * 0.2) * 0.25;
    coreGlow.scale.setScalar(1 + Math.sin(time * 1.4) * 0.06);
    dots.rotation.y = time * 0.04;
    place(time);
    const drift = Math.sin(time * 0.17) * 1.6;
    camera.position.x += (pointerX * 5 + drift - camera.position.x) * 0.045;
    camera.position.y += (5.4 - pointerY * 1.8 + scrollP * 2.4 - camera.position.y) * 0.045;
    camera.position.z += (14.2 - scrollP * 4.2 - camera.position.z) * 0.045;
    camera.lookAt(0, 0.5, 0);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  return { ok: true, reduced };
}
