const endpoint = "http://127.0.0.1:9222";
const base = "http://127.0.0.1:41773/campus/";

function waitOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
}

const created = await fetch(`${endpoint}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
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
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem("canon-tour-done","1"); localStorage.setItem("cg-greet-done","1");` });
await send("Page.navigate", { url: base + "#/" });
await new Promise((r) => setTimeout(r, 1200));
const expr = `(() => {
  const boxes = [];
  for (const sel of [".topbar",".quick-bar",".bottom",".lab-bar",".phone-bar","h1",".hero-glass",".mascot-dock",".disclaimer-box",".shell",".stage","main",".rail"]) {
    const el = document.querySelector(sel);
    if (!el) { boxes.push([sel, "missing"]); continue; }
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    boxes.push([sel, s.display, s.position, Math.round(r.top), Math.round(r.left), Math.round(r.width), Math.round(r.height), s.visibility]);
  }
  const wide = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > document.documentElement.clientWidth + 2 && r.height > 0) {
      wide.push((el.id || el.className || el.tagName).toString().slice(0, 80) + " " + Math.round(r.width));
    }
  });
  return JSON.stringify({ boxes, wide: wide.slice(0, 12), scroll: document.documentElement.scrollWidth });
})()`;
const phone = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log("PHONE", phone.result.value);
await send("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: base + "#/lesson/foundations/what-routes" });
await new Promise((r) => setTimeout(r, 1200));
const ipad = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log("IPAD", ipad.result.value);
ws.close();
await fetch(`${endpoint}/json/close/${page.id}`);
