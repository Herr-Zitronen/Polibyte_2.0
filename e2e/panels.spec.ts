// H1.6 · Cruces, líneas vivas y paneles (DESIGN §3.4–3.5).
import { expect, test } from '@playwright/test';

test('el panel bajo el pliegue dibuja su borde desde las esquinas al entrar', async ({ page }) => {
  await page.goto('/lab/panels/');
  const panel = page.locator('#below');
  await expect(panel).not.toHaveAttribute('data-drawn', /.*/);
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute('data-drawn', '');
  const sides = await panel.locator('.pb-e').evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return { cls: el.className, prop: cs.transitionProperty, origin: cs.transformOrigin, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height };
    }),
  );
  expect(sides).toHaveLength(4);
  for (const s of sides) {
    expect(s.prop).toContain('transform');
    // El origen de cada lado está en uno de sus extremos (una esquina del panel).
    const [ox, oy] = s.origin.split(' ').map(parseFloat) as [number, number];
    const atEnd = s.w > s.h ? ox === 0 || Math.abs(ox - s.w) < 1 : oy === 0 || Math.abs(oy - s.h) < 1;
    expect(atEnd, s.cls).toBe(true);
  }
});

test('el pulso se pausa fuera de pantalla y corre dentro', async ({ page }) => {
  await page.goto('/lab/panels/');
  const states = () =>
    page.locator('#below .pb-e.t').evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.playState));
  await expect.poll(states).toContain('paused');
  await page.locator('#below').scrollIntoViewIfNeeded();
  await expect.poll(states).toContain('running');
});

test.describe('táctil', () => {
  test.use({ hasTouch: true });
  test('sin hover no se registra pointermove', async ({ page }) => {
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q.includes('hover') ? ({ ...real(q), matches: q.includes('none') } as MediaQueryList) : real(q);
      const seen: string[] = [];
      (window as unknown as { __ev: string[] }).__ev = seen;
      for (const t of [document, window] as EventTarget[]) {
        const add = t.addEventListener.bind(t);
        t.addEventListener = (type: string, ...rest: [EventListenerOrEventListenerObject, AddEventListenerOptions?]) => {
          seen.push(type);
          add(type, ...rest);
        };
      }
    });
    await page.goto('/lab/panels/');
    await page.waitForLoadState('load');
    const ev = await page.evaluate(() => (window as unknown as { __ev: string[] }).__ev);
    expect(ev).not.toContain('pointermove');
  });

  test('con hover sí se registra (control)', async ({ page }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __ev: string[] }).__ev = seen;
      const add = document.addEventListener.bind(document);
      document.addEventListener = (type: string, ...rest: [EventListenerOrEventListenerObject, AddEventListenerOptions?]) => {
        seen.push(type);
        add(type, ...rest);
      };
    });
    await page.goto('/lab/panels/');
    await page.waitForLoadState('load');
    const ev = await page.evaluate(() => (window as unknown as { __ev: string[] }).__ev);
    const fine = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    if (fine) expect(ev).toContain('pointermove');
  });
});
