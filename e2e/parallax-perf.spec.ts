// H1.5 · El paralaje solo anima transform/opacity (compositor, sin repintar el fondo).
import { expect, test } from '@playwright/test';

test('las animaciones de paralaje solo tocan transform u opacity', async ({ page }) => {
  await page.goto('/lab/glass/');
  // Scroll por script: page.mouse.wheel no existe en los perfiles táctiles (mobile-390, PR B).
  await page.evaluate(() => window.scrollTo(0, 600));
  const props = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect instanceof KeyframeEffect && (a.effect.target as Element | null)?.closest('.pb-bg'))
      .flatMap((a) =>
        (a.effect as KeyframeEffect)
          .getKeyframes()
          .flatMap((k) => Object.keys(k).filter((p) => !['offset', 'easing', 'composite', 'computedOffset'].includes(p))),
      ),
  );
  expect(props.length, 'hay animaciones de paralaje').toBeGreaterThan(0);
  for (const p of props) expect(['transform', 'opacity']).toContain(p);
});
