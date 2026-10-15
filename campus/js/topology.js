const NODES = [
  { id: "caller", label: "Caller", pos: [-7.2, 1.1, 0.2], color: 0x3ecbff },
  { id: "pstn", label: "Carrier", pos: [-5.1, 0.3, 1.3], color: 0xffb020 },
  { id: "edge", label: "Voice edge", pos: [-3.1, 1.7, -0.2], color: 0x3ecbff },
  { id: "poc", label: "POC", pos: [-1.1, 0.5, 0.5], color: 0xffb020 },
  { id: "studio", label: "Studio", pos: [1.0, 2.3, 0.1], color: 0xb09cff },
  { id: "acd", label: "ACD", pos: [3.0, 1.0, -0.2], color: 0x3ee0a4 },
  { id: "skill", label: "Skill", pos: [4.4, 2.4, -1.2], color: 0x3ee0a4 },
  { id: "agent", label: "Agent", pos: [6.3, 0.7, 0.5], color: 0x3ecbff },
  { id: "digital", label: "Digital", pos: [0.2, 0.35, -3.1], color: 0xb09cff },
  { id: "crm", label: "CRM", pos: [3.4, 0.25, 2.6], color: 0xffb020 },
  { id: "wfm", label: "WFM", pos: [5.5, 2.5, 2.1], color: 0x3ee0a4 },
  { id: "rec", label: "Recording", pos: [1.6, 0.2, 3.0], color: 0xff8d86 },
  { id: "ai", label: "Enlighten", pos: [0.5, 3.4, 1.3], color: 0xb09cff },
  { id: "api", label: "APIs", pos: [-2.3, 0.25, 2.7], color: 0x3ecbff },
  { id: "legacy", label: "UCCE / Avaya", pos: [-4.6, 2.5, 2.6], color: 0xffb020 },
];

const LINKS = [
  ["caller", "pstn"],
  ["pstn", "edge"],
  ["edge", "poc"],
  ["poc", "studio"],
  ["studio", "acd"],
  ["acd", "skill"],
  ["skill", "agent"],
  ["digital", "studio"],
  ["agent", "crm"],
  ["acd", "wfm"],
  ["agent", "rec"],
  ["studio", "ai"],
  ["api", "acd"],
  ["legacy", "wfm"],
  ["legacy", "rec"],
];

const FAILURES = {
  carrier: { links: [["pstn", "edge"]], text: "Carrier path is down. DID and TFN numbers still have to be configured with Professional Services before a point of contact can use them." },
  script: { links: [["poc", "studio"]], text: "The point of contact has no working script. Each POC is assigned one skill and one script." },
  bullseye: { links: [["skill", "agent"]], text: "The proficiency window never widens. Bullseye stays on the opening High/Low range, so qualified-but-lower-proficiency agents stay idle." },
  recording: { links: [["agent", "rec"]], text: "Recording gap. Hold audio is not captured; a hole during hold is expected, a hole during talk time is not." },
  crm: { links: [["agent", "crm"]], text: "CRM timeout. Salesforce Agent Workspace needs Lightning console navigation, or each record opens in a new browser tab." },
  apikey: { links: [["api", "acd"]], text: "Access key disabled. Tokens from that key stop immediately and cannot be refreshed." },
  ucce: { links: [["legacy", "wfm"], ["legacy", "rec"]], text: "UCCE historical feed stalled. The connector expects AW-HDS-DDS, and historical skill data is queried on a 15-minute interval." },
};

function sprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(6,16,24,0.72)";
  ctx.fillRect(8, 8, 240, 48);
  ctx.strokeStyle = color;
  ctx.strokeRect(8, 8, 240, 48);
  ctx.fillStyle = "#f4fbff";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const spriteMesh = new THREE.Sprite(material);
  spriteMesh.scale.set(2.4, 0.6, 1);
  return spriteMesh;
}

let handle = null;

export function mountTopology(canvas, reduced) {
  unmountTopology();
  if (!window.THREE || reduced) return { ok: false };
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (error) {
    return { ok: false };
  }
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071018, 0.045);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const root = new THREE.Group();
  scene.add(root);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.PointLight(0x3ecbff, 18, 30);
  key.position.set(4, 6, 4);
  scene.add(key);
  const amber = new THREE.PointLight(0xffb020, 10, 24);
  amber.position.set(-4, 2, 3);
  scene.add(amber);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshStandardMaterial({ color: 0x10202c, metalness: 0.2, roughness: 0.8 })
  );
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);

  const meshes = {};
  const lines = [];
  for (const node of NODES) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 24, 16),
      new THREE.MeshStandardMaterial({ color: node.color, emissive: node.color, emissiveIntensity: 0.45, roughness: 0.35 })
    );
    mesh.position.set(node.pos[0], node.pos[1], node.pos[2]);
    const label = sprite(node.label, "#" + node.color.toString(16).padStart(6, "0"));
    label.position.set(0, 0.55, 0);
    mesh.add(label);
    root.add(mesh);
    meshes[node.id] = mesh;
  }
  for (const [a, b] of LINKS) {
    const start = meshes[a].position;
    const end = meshes[b].position;
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 0.45;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const mat = new THREE.LineBasicMaterial({ color: 0x8adfff, transparent: true, opacity: 0.85 });
    const line = new THREE.Line(geo, mat);
    line.userData.link = [a, b];
    root.add(line);
    lines.push(line);
  }

  const spherical = { r: 16, phi: 1.05, theta: 0.55 };
  let dragging = false;
  let lx = 0;
  let ly = 0;
  function applyCamera() {
    camera.position.set(
      spherical.r * Math.sin(spherical.phi) * Math.sin(spherical.theta),
      spherical.r * Math.cos(spherical.phi),
      spherical.r * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    );
    camera.lookAt(0, 1.1, 0);
  }
  function resize() {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth || 640;
    const height = canvas.clientHeight || 520;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }
  function onDown(event) {
    dragging = true;
    lx = event.clientX;
    ly = event.clientY;
  }
  function onMove(event) {
    if (!dragging) return;
    spherical.theta -= (event.clientX - lx) * 0.005;
    spherical.phi = Math.min(1.45, Math.max(0.3, spherical.phi - (event.clientY - ly) * 0.005));
    lx = event.clientX;
    ly = event.clientY;
    applyCamera();
  }
  function onUp() { dragging = false; }
  function onWheel(event) {
    event.preventDefault();
    spherical.r = Math.min(28, Math.max(8, spherical.r + event.deltaY * 0.01));
    applyCamera();
  }
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement || canvas);
  applyCamera();
  resize();

  let frame = 0;
  let stopped = false;
  const clock = { t: 0 };
  function loop() {
    if (stopped) return;
    clock.t += 0.016;
    if (!reduced) {
      for (const node of Object.values(meshes)) {
        node.material.emissiveIntensity = 0.35 + Math.sin(clock.t * 2 + node.position.x) * 0.15;
      }
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  }
  loop();

  function setFailures(active) {
    const hot = new Set();
    for (const id of active) {
      for (const pair of (FAILURES[id] && FAILURES[id].links) || []) hot.add(pair.join("|"));
    }
    for (const line of lines) {
      const key = line.userData.link.join("|");
      const bad = hot.has(key);
      line.material.color.set(bad ? 0xff5d5d : 0x8adfff);
      line.material.opacity = bad ? 1 : 0.8;
    }
  }

  handle = {
    setFailures,
    destroy() {
      stopped = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      observer.disconnect();
      renderer.dispose();
    },
  };
  return { ok: true, setFailures };
}

export function unmountTopology() {
  if (handle) handle.destroy();
  handle = null;
}

export function failureCopy() {
  return FAILURES;
}

export function nodeList() {
  return NODES.map((node) => node.label);
}
