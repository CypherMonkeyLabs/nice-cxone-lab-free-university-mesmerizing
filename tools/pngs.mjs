import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const downloads = join(dirname(fileURLToPath(import.meta.url)), "..", "campus", "downloads");
const sheets = readdirSync(downloads).filter((name) => name.endsWith(".html") && name !== "index.html" && name !== "test-table.html");
const diagramDir = join(downloads, "diagrams");
const diagrams = readdirSync(diagramDir).filter((name) => name.endsWith(".html")).map((name) => join("diagrams", name));
const endpoint = "http://127.0.0.1:9222";

function waitOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
}

async function shoot(fileUrl, pngPath) {
  const created = await fetch(`${endpoint}/json/new?${encodeURIComponent(fileUrl)}`, { method: "PUT" });
  if (!created.ok) throw new Error(`devtools new tab ${created.status}`);
  const page = await created.json();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await waitOpen(ws);
  let next = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const done = pending.get(message.id);
    if (done) done(message);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next;
    pending.set(id, (message) => {
      pending.delete(id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 1400, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: fileUrl });
  await new Promise((resolve) => setTimeout(resolve, 350));
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
  writeFileSync(pngPath, Buffer.from(shot.data, "base64"));
  ws.close();
  await fetch(`${endpoint}/json/close/${page.id}`);
}

const probe = await fetch(`${endpoint}/json/version`).catch(() => null);
if (!probe || !probe.ok) {
  console.error("Chrome DevTools is not listening on 9222");
  process.exit(1);
}

for (const sheet of sheets.concat(diagrams)) {
  const png = join(downloads, sheet.replace(/\.html$/, ".png"));
  await shoot(`file://${join(downloads, sheet)}`, png);
  console.log("png", sheet);
}
