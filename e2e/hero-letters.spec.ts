// F4 · Titular de Inicio sin letras perdidas: pase lo que pase, a los ~3 s el h1 está completo.
import { expect, test, type Page } from "@playwright/test";

const TITLE = "Construimos software. Y a quienes lo construyen.";

const letters = (page: Page) =>
  page.evaluate(() => {
    const h1 = document.querySelector("[data-decode]")!;
    const spans = [...h1.querySelectorAll<HTMLElement>(".pb-ch")];
    return {
      text: spans.map((s) => s.textContent).join(""),
      hidden: spans.filter((s) => getComputedStyle(s).transform !== "none").length,
    };
  });

test("si el decodificado y la animación CSS no terminan, igual se fija el titular", async ({ page }) => {
  // Simula lo peor: rAF detenido (pestaña ocupada/oculta) y animaciones de letra en pausa.
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
    document.addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = ".pb-ch{animation-play-state:paused !important}";
      document.head.append(st);
    });
  });
  await page.goto("/");
  await expect
    .poll(async () => (await letters(page)).hidden, { timeout: 5000 })
    .toBe(0);
  const { text } = await letters(page);
  expect(text.replace(/\s+/g, " ").trim()).toBe(TITLE);
  await expect(page.locator("[data-decode]")).toHaveAttribute("data-decoded", "");
});

test("scroll rápido durante la entrada y regreso: titular completo", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 6; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i % 2 ? 0 : 1400);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await letters(page)).hidden, { timeout: 8000 }).toBe(0);
  expect((await letters(page)).text.replace(/\s+/g, " ").trim()).toBe(TITLE);
});
