import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "screenshots");
mkdirSync(out, { recursive: true });
const endpoint = "http://127.0.0.1:9222";
const base = "http://127.0.0.1:41773/campus/";

function waitOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
}

async function session() {
  const created = await fetch(`${endpoint}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!created.ok) throw new Error(`devtools ${created.status}`);
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
      if (message.error) reject(new Error(`${method}: ${message.error.message}`));
      else resolve(message.result);
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  return {
    page,
    send,
    async close() {
      ws.close();
      await fetch(`${endpoint}/json/close/${page.id}`);
    },
  };
}

async function shot(send, file) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  writeFileSync(file, Buffer.from(result.data, "base64"));
}

async function metrics(send) {
  const result = await send("Runtime.evaluate", {
    expression: `(() => {
      const h1 = document.querySelector("h1");
      const r = h1 ? h1.getBoundingClientRect() : null;
      const tour = document.querySelector(".tour-card");
      const tr = tour ? tour.getBoundingClientRect() : null;
      const bar = document.querySelector(".topbar");
      const br = bar ? bar.getBoundingClientRect() : null;
      const monkeys = document.querySelectorAll("#mascot-dock, .guide-monkey, .glasses-monkey").length;
      const quick = document.querySelector(".quick-bar");
      const qr = quick ? getComputedStyle(quick).display : "missing";
      const disc = document.querySelector(".disclaimer-box");
      const foot = document.querySelector(".lab-foot");
      const overlap = disc && foot ? disc.getBoundingClientRect().bottom > foot.getBoundingClientRect().bottom + 2 : false;
      return JSON.stringify({
        title: document.title,
        brand: (document.querySelector(".topbar .brand-name") || {}).innerText || null,
        h1: h1 ? h1.textContent.slice(0, 80) : null,
        h1Top: r && Math.round(r.top),
        h1Bottom: r && Math.round(r.bottom),
        h1Clipped: r ? r.top < (br ? br.bottom : 0) - 1 : true,
        tour: !!tour,
        tourLeft: tr && Math.round(tr.left),
        tourRight: tr && Math.round(tr.right),
        tourTop: tr && Math.round(tr.top),
        tourBottom: tr && Math.round(tr.bottom),
        tourOverH1: tr && r ? !(tr.right < r.left || tr.left > r.right || tr.bottom < r.top || tr.top > r.bottom) : false,
        pathSize: (() => { const el = document.querySelector(".contact-path b"); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : null; })(),
        canvasShown: [...document.querySelectorAll(".hero-stage canvas")].some((c) => getComputedStyle(c).display !== "none"),
        mascot: (() => { const m = document.getElementById("mascot-dock"); const mr = m && m.getBoundingClientRect(); return mr ? [Math.round(mr.width), Math.round(mr.height), Math.round(mr.left), Math.round(mr.top)] : null; })(),
        lastChip: (() => {
          const scroller = document.querySelector(".banner-scroll");
          const chip = scroller && scroller.querySelector("a:last-of-type");
          if (!scroller || !chip) return null;
          const sr = scroller.getBoundingClientRect();
          const cr = chip.getBoundingClientRect();
          scroller.scrollLeft = scroller.scrollWidth;
          const end = chip.getBoundingClientRect();
          const endRight = Math.round(end.right);
          const scrollerRight = Math.round(scroller.getBoundingClientRect().right);
          scroller.scrollLeft = 0;
          return { clippedAtRest: cr.right > sr.right + 1, endGap: scrollerRight - endRight, label: chip.textContent.trim() };
        })(),
        inner: [innerWidth, innerHeight],
        monkeys,
        quick: qr,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      });
    })()`,
    returnByValue: true,
  });
  return JSON.parse(result.result.value);
}

const views = [
  { name: "desk", width: 1440, height: 900, mobile: false },
  { name: "ipad", width: 768, height: 1024, mobile: true },
  { name: "phone", width: 390, height: 844, mobile: true },
];

const report = [];
const browser = await session();
for (const view of views) {
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: view.width,
    height: view.height,
    deviceScaleFactor: 1,
    mobile: view.mobile,
  });
  await browser.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `if (location.search.includes("review=tour")) localStorage.removeItem("canon-tour-done"); else { localStorage.setItem("canon-tour-done","1"); localStorage.setItem("cg-greet-done","1"); localStorage.setItem("cg-poke-off","1"); }`,
  });
  const pages = [
    ["home", base + "#/"],
    ["room", base + "#/lesson/foundations/what-routes"],
    ["downloads", base + "#/downloads"],
  ];
  for (const [label, url] of pages) {
    await browser.send("Page.navigate", { url });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const file = join(out, `review-${view.name}-${label}.png`);
    await shot(browser.send, file);
    const info = await metrics(browser.send);
    report.push({ view: view.name, label, ...info, file });
    console.log(view.name, label, info.h1, info.h1Clipped, info.scrollW, info.clientW);
  }
  await browser.send("Page.navigate", { url: base + "#/" });
  await new Promise((resolve) => setTimeout(resolve, 900));
  await browser.send("Runtime.evaluate", { expression: `document.getElementById("open-menu").click()` });
  await new Promise((resolve) => setTimeout(resolve, 400));
  await shot(browser.send, join(out, `review-${view.name}-menu.png`));
  await browser.send("Runtime.evaluate", { expression: `document.getElementById("close-menu").click()` });
  if (view.name === "phone") {
    await browser.send("Runtime.evaluate", { expression: `document.getElementById("guide-open").click()` });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await shot(browser.send, join(out, "review-phone-bot.png"));
  }
}
for (const view of [views[0], views[2]]) {
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: view.width,
    height: view.height,
    deviceScaleFactor: 1,
    mobile: view.mobile,
  });
  await browser.send("Page.navigate", { url: base + "?review=tour#/" });
  await new Promise((resolve) => setTimeout(resolve, 1600));
  await shot(browser.send, join(out, `review-${view.name}-tour.png`));
  const info = await metrics(browser.send);
  report.push({ view: view.name, label: "tour", ...info });
  console.log("tour", view.name, info.tour, info.tourRight, info.inner, info.h1Clipped);
}
writeFileSync(join(out, "review-pass.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log("wrote", report.length);
