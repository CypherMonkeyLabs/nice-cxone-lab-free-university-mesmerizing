let raf = 0;
let renderer = null;
let running = false;
let generation = 0;
let cameraRef = null;
let bloom = null;
let fly = null;
const stops = [];

const BLOOM_VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

function finishFly() {
  if (!fly) return;
  const resolve = fly.resolve;
  fly = null;
  if (resolve) resolve();
}

function attachBloom(THREE, source) {
  const full = new THREE.WebGLRenderTarget(2, 2);
  const half = new THREE.WebGLRenderTarget(2, 2);
  const brightRT = new THREE.WebGLRenderTarget(2, 2);
  const blurRT = new THREE.WebGLRenderTarget(2, 2);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const copyMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: BLOOM_VERT,
    fragmentShader: "uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tDiffuse, vUv); }",
    depthTest: false,
    depthWrite: false,
  });
  const brightMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, threshold: { value: 0.38 } },
    vertexShader: BLOOM_VERT,
    fragmentShader: "uniform sampler2D tDiffuse; uniform float threshold; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = max(c.r, max(c.g, c.b)); float k = smoothstep(threshold, threshold + 0.4, l); gl_FragColor = vec4(c.rgb * k, 1.0); }",
    depthTest: false,
    depthWrite: false,
  });
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, direction: { value: new THREE.Vector2(1, 0) } },
    vertexShader: BLOOM_VERT,
    fragmentShader: "uniform sampler2D tDiffuse; uniform vec2 direction; varying vec2 vUv; void main(){ vec4 sum = texture2D(tDiffuse, vUv) * 0.36; sum += texture2D(tDiffuse, vUv + direction) * 0.22; sum += texture2D(tDiffuse, vUv - direction) * 0.22; sum += texture2D(tDiffuse, vUv + direction * 2.0) * 0.1; sum += texture2D(tDiffuse, vUv - direction * 2.0) * 0.1; gl_FragColor = sum; }",
    depthTest: false,
    depthWrite: false,
  });
  const addMat = new THREE.ShaderMaterial({
    uniforms: { tBloom: { value: null }, strength: { value: 1.35 } },
    vertexShader: BLOOM_VERT,
    fragmentShader: "uniform sampler2D tBloom; uniform float strength; varying vec2 vUv; void main(){ vec3 glow = texture2D(tBloom, vUv).rgb * strength; gl_FragColor = vec4(glow, 1.0); }",
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(quadGeo, copyMat);
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  let cached = "";
  let passes = 2;
  function resize() {
    const w = Math.max(2, source.domElement.width);
    const h = Math.max(2, source.domElement.height);
    const hw = Math.max(2, Math.floor(w / 2));
    const hh = Math.max(2, Math.floor(h / 2));
    const key = `${w}x${h}`;
    if (key === cached) return { hw, hh };
    cached = key;
    full.setSize(w, h);
    half.setSize(hw, hh);
    brightRT.setSize(hw, hh);
    blurRT.setSize(hw, hh);
    return { hw, hh };
  }
  function render(scene, camera) {
    const { hw, hh } = resize();
    source.autoClear = true;
    source.setRenderTarget(full);
    source.render(scene, camera);
    quad.material = copyMat;
    copyMat.uniforms.tDiffuse.value = full.texture;
    source.setRenderTarget(null);
    source.render(quadScene, quadCam);
    source.setRenderTarget(half);
    source.render(quadScene, quadCam);
    quad.material = brightMat;
    brightMat.uniforms.tDiffuse.value = half.texture;
    source.setRenderTarget(brightRT);
    source.render(quadScene, quadCam);
    quad.material = blurMat;
    blurMat.uniforms.tDiffuse.value = brightRT.texture;
    blurMat.uniforms.direction.value.set(2.2 / hw, 0);
    source.setRenderTarget(blurRT);
    source.render(quadScene, quadCam);
    if (passes > 1) {
      blurMat.uniforms.tDiffuse.value = blurRT.texture;
      blurMat.uniforms.direction.value.set(0, 2.2 / hh);
      source.setRenderTarget(brightRT);
      source.render(quadScene, quadCam);
      addMat.uniforms.tBloom.value = brightRT.texture;
    } else {
      addMat.uniforms.tBloom.value = blurRT.texture;
    }
    quad.material = addMat;
    source.autoClear = false;
    source.setRenderTarget(null);
    source.render(quadScene, quadCam);
    source.autoClear = true;
  }
  function dispose() {
    full.dispose();
    half.dispose();
    brightRT.dispose();
    blurRT.dispose();
    copyMat.dispose();
    brightMat.dispose();
    blurMat.dispose();
    addMat.dispose();
    quadGeo.dispose();
  }
  return {
    render,
    resize,
    dispose,
    lite() { passes = 1; },
  };
}

export function flyOut() {
  if (!running || !cameraRef || !window.THREE) return Promise.resolve();
  finishFly();
  return new Promise((resolve) => {
    const timer = setTimeout(() => finishFly(), 720);
    fly = {
      mode: "out",
      from: cameraRef.position.clone(),
      to: new window.THREE.Vector3(cameraRef.position.x * 0.15, 2.2, 3.4),
      start: performance.now(),
      dur: 520,
      resolve: () => {
        clearTimeout(timer);
        resolve();
      },
    };
  });
}

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
  finishFly();
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  while (stops.length) stops.pop()();
  if (bloom) {
    bloom.dispose();
    bloom = null;
  }
  cameraRef = null;
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }
}

function labelSprite(THREE, text, color) {
  const board = document.createElement("canvas");
  board.width = 256;
  board.height = 64;
  const ctx = board.getContext("2d");
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = "rgba(4, 10, 20, 0.62)";
  ctx.fillRect(8, 8, 240, 48);
  ctx.strokeStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 240, 48);
  ctx.fillStyle = "#f4fbff";
  ctx.font = "600 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(board), transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.position.y = 0.62;
  sprite.scale.set(1.85, 0.46, 1);
  return sprite;
}

export async function mountHero(canvas) {
  unmountHero();
  const token = generation;
  if (!canvas) return { ok: false };
  const stage = canvas.closest(".hero-stage");
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    bloom = attachBloom(THREE, renderer);
  } catch (error) {
    showFallback(canvas, stage);
    return { ok: false, reason: "webgl" };
  }
  try {
  canvas.hidden = false;
  const fallback = stage && stage.querySelector(".hero-fallback");
  if (fallback) fallback.hidden = true;

  const colors = palette();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);
  scene.fog = new THREE.FogExp2(colors.bg, 0.032);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);
  camera.position.set(7, 16, 28);
  cameraRef = camera;
  fly = {
    mode: "in",
    from: camera.position.clone(),
    to: new THREE.Vector3(0, 5.6, 14),
    start: performance.now(),
    dur: 1300,
    resolve: null,
  };

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
      emissiveIntensity: 1.45,
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
    const cap = width < 800 ? 1 : 1.25;
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
  if (bloom) bloom.resize();
  place(0);
  paintFrame();
  running = true;
  const clock = new THREE.Clock();
  let frameCount = 0;
  let frameStamp = performance.now();
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
    if (fly) {
      const u = Math.min(1, (performance.now() - fly.start) / fly.dur);
      const eased = 1 - (1 - u) ** 3;
      camera.position.lerpVectors(fly.from, fly.to, eased);
      if (u >= 1) finishFly();
    } else {
      camera.position.x += (pointerX * 5 + drift - camera.position.x) * 0.045;
      camera.position.y += (5.4 - pointerY * 1.8 + scrollP * 2.4 - camera.position.y) * 0.045;
      camera.position.z += (14.2 - scrollP * 4.2 - camera.position.z) * 0.045;
    }
    camera.lookAt(0, 0.5, 0);
    paintFrame();
    frameCount += 1;
    if (frameCount === 8) frameStamp = performance.now();
    if (frameCount === 32) {
      const fps = 24 * 1000 / Math.max(1, performance.now() - frameStamp);
      if (fps < 45 && bloom) bloom.lite();
    }
  };
  function paintFrame() {
    if (!bloom) {
      renderer.render(scene, camera);
      return;
    }
    try {
      bloom.render(scene, camera);
    } catch (error) {
      bloom.dispose();
      bloom = null;
      renderer.render(scene, camera);
    }
  }
  raf = requestAnimationFrame(loop);
  canvas.dataset.hero = "ok";
  return { ok: true };
  } catch (error) {
    unmountHero();
    if (canvas.isConnected) showFallback(canvas, stage);
    return { ok: false, reason: "scene" };
  }
}
