import { expect, test } from "@playwright/test";

async function shot(page, name) {
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: false });
}

async function dismissTour(page) {
  const skip = page.locator("[data-tour-skip]");
  try {
    await skip.waitFor({ state: "visible", timeout: 4000 });
    await skip.click();
  } catch {
    /* tour already finished */
  }
}

async function openGuide(page) {
  await dismissTour(page);
  const bar = page.locator("#guide-open");
  if (await bar.isVisible()) {
    await bar.click();
    return;
  }
  await page.locator("#mascot-dock").click();
}

test("home, guide, and a lesson at desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/campus/");
  await expect(page.locator("h1").first()).toBeVisible();
  await dismissTour(page);
  await shot(page, "wave-desk-home");
  await openGuide(page);
  await expect(page.locator("[data-py-chat]")).toBeVisible();
  await page.locator("[data-py-ask]").first().click();
  await expect(page.locator(".py-msg-bot").last()).toContainText(/lesson|Start|track|Contact/i);
  await shot(page, "wave-desk-bot");
  await page.goto("/campus/#/lesson/routing/priority-math");
  await expect(page.locator("h1")).toContainText(/priority/i);
  await shot(page, "wave-desk-lesson");
});

test("home, guide, and a lesson at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/campus/");
  await expect(page.locator("h1").first()).toBeVisible();
  await dismissTour(page);
  await shot(page, "wave-phone-home");
  await openGuide(page);
  await expect(page.locator("#py-chat-input")).toBeVisible();
  await shot(page, "wave-phone-bot");
  await page.goto("/campus/#/lesson/routing/priority-math");
  await expect(page.locator("h1")).toBeVisible();
  await shot(page, "wave-phone-lesson");
});

test("guide input and send are on screen at 390x430", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 430 });
  await page.goto("/campus/");
  await dismissTour(page);
  await openGuide(page);
  const input = page.locator("#py-chat-input");
  const send = page.locator(".py-chat-form button[type=submit]");
  await expect(input).toBeVisible();
  await expect(send).toBeVisible();
  const uncovered = await send.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight || rect.width < 8) return false;
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit === el || el.contains(hit);
  });
  expect(uncovered).toBe(true);
});

test("call-flow sandbox is labeled a simulation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/campus/#/callflow");
  await expect(page.locator(".callflow-banner")).toContainText("Simulation");
  await page.locator("[data-hop='hours']").click();
  await expect(page.locator("[data-callflow-result]")).toContainText(/closed|hours/i);
  await page.locator("[data-hop='hours']").click();
  await expect(page.locator("[data-callflow-result]")).toContainText(/Priority/);
});

test("offline reload still opens a lesson and the guide", async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/campus/");
  await dismissTour(page);
  await page.evaluate(async () => {
    const ready = navigator.serviceWorker && navigator.serviceWorker.ready;
    if (ready) await ready;
  });
  await page.reload();
  await page.goto("/campus/#/lesson/routing/priority-math");
  await expect(page.locator("h1")).toContainText(/priority/i);
  await openGuide(page);
  await expect(page.locator("[data-py-chat]")).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("h1").first()).toBeVisible();
  await page.goto("/campus/#/lesson/routing/priority-math");
  await expect(page.locator("h1")).toContainText(/priority/i);
  await openGuide(page);
  await page.locator("#py-chat-input").fill("what is bullseye routing");
  await page.locator("#py-chat-input").press("Enter");
  await expect(page.locator(".py-msg-bot").last()).toContainText(/bullseye|proficiency|don't have that yet/i);
});
