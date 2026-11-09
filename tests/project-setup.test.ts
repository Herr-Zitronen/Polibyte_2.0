// H0.1 · Proyecto y CI — pruebas de los criterios de aceptación.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const pkg = () => JSON.parse(read('package.json'));

describe('H0.1 · criterio 1: `npm run check` cubre tipos estrictos, lint y pruebas', () => {
  it('define los scripts dev, build, test, e2e y check', () => {
    const { scripts } = pkg();
    for (const s of ['dev', 'build', 'test', 'e2e', 'check']) expect(scripts, s).toHaveProperty(s);
    expect(scripts.dev).toMatch(/astro dev/);
    expect(scripts.build).toMatch(/astro build/);
    expect(scripts.test).toMatch(/vitest/);
    expect(scripts.e2e).toMatch(/playwright test/);
  });

  it('check encadena tipos (astro check), lint (eslint) y pruebas', () => {
    const { check } = pkg().scripts;
    expect(check).toMatch(/astro check/);
    expect(check).toMatch(/lint|eslint/);
    expect(check).toMatch(/npm run test|vitest/);
  });

  it('TypeScript es estricto (astro/tsconfigs/strictest)', () => {
    const ts = JSON.parse(read('tsconfig.json'));
    expect(ts.extends).toMatch(/astro\/tsconfigs\/strict(est)?/);
  });

  it('existe configuración de ESLint', () => {
    expect(existsSync(resolve(root, 'eslint.config.js'))).toBe(true);
  });

  it('existe la estructura base de Astro', () => {
    for (const p of ['astro.config.mjs', 'src/pages/index.astro', 'src/layouts/Base.astro', 'src/lib', 'src/components'])
      expect(existsSync(resolve(root, p)), p).toBe(true);
  });
});

describe('H0.1 · criterio 2: CI en cada PR', () => {
  const ciPath = '.github/workflows/ci.yml';
  const ci = () => parse(read(ciPath));
  const allRuns = () =>
    Object.values(ci().jobs as Record<string, { steps: { run?: string; uses?: string }[] }>)
      .flatMap((j) => j.steps)
      .map((s) => `${s.run ?? ''} ${s.uses ?? ''}`)
      .join('\n');

  type Job = { needs?: string | string[]; if?: string; steps: { run?: string; uses?: string; with?: Record<string, unknown> }[] };
  const jobs = () => ci().jobs as Record<string, Job>;
  const deployJobs = () => Object.entries(jobs()).filter(([, j]) => j.steps.some((s) => /wrangler/.test(`${s.run ?? ''} ${s.uses ?? ''}`)));

  it('se dispara en push a feat/**, staging y main, y en PR hacia staging/main', () => {
    expect(existsSync(resolve(root, ciPath))).toBe(true);
    const on = ci().on;
    expect(on.push.branches).toEqual(expect.arrayContaining(['feat/**', 'staging', 'main']));
    expect(on.pull_request.branches).toEqual(expect.arrayContaining(['staging', 'main']));
  });

  it('solo despliega desde staging (preview-alias) y main (deploy), tras pasar las pruebas', () => {
    const deploys = deployJobs();
    expect(deploys.length).toBeGreaterThanOrEqual(2);
    for (const [, j] of deploys) {
      expect(j.needs, 'needs').toBeTruthy();
      expect(j.if ?? '').toMatch(/github\.event_name\s*==\s*'push'/);
      expect(j.if ?? '').toMatch(/refs\/heads\/(staging|main)/);
    }
    const byRef = (ref: string) => deploys.find(([, j]) => (j.if ?? '').includes(`refs/heads/${ref}`))?.[1];
    const runsOf = (j?: Job) => (j?.steps ?? []).map((s) => `${s.run ?? ''} ${JSON.stringify(s.with ?? {})}`).join('\n');
    expect(runsOf(byRef('staging'))).toMatch(/versions upload.*--preview-alias staging/);
    expect(runsOf(byRef('main'))).toMatch(/wrangler deploy|"command":"deploy"/);
  });

  it('sube el reporte de Playwright como artefacto', () => {
    expect(allRuns()).toMatch(/actions\/upload-artifact/);
  });

  it('ejecuta check, Vitest, Playwright y Lighthouse CI', () => {
    const runs = allRuns();
    expect(runs).toMatch(/npm run check/);
    expect(runs).toMatch(/npm run test|vitest/);
    expect(runs).toMatch(/npm run e2e|playwright test/);
    expect(runs).toMatch(/lhci/);
  });

  it('publica un preview en Cloudflare', () => {
    expect(allRuns()).toMatch(/wrangler(-action)?.*|versions upload/);
    expect(existsSync(resolve(root, 'wrangler.jsonc'))).toBe(true);
  });

  it('Playwright corre a 1440, 1000 y 390 px', () => {
    const cfg = read('playwright.config.ts');
    for (const w of [1440, 1000, 390]) expect(cfg).toMatch(new RegExp(`width:\\s*${w}\\b`));
  });

  it('hay prueba E2E con axe', () => {
    expect(existsSync(resolve(root, 'e2e/a11y.spec.ts'))).toBe(true);
    expect(read('e2e/a11y.spec.ts')).toMatch(/@axe-core\/playwright/);
  });

  it('Lighthouse CI tiene configuración', () => {
    expect(existsSync(resolve(root, 'lighthouserc.cjs'))).toBe(true);
  });
});
