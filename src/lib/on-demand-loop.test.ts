import { describe, expect, it } from 'vitest';
import { createOnDemandLoop } from './on-demand-loop';

/** rAF de mentira: guarda los cuadros pedidos y los corre a mano. */
function fakeRaf() {
  let next = 1;
  const queue = new Map<number, (t: number) => void>();
  return {
    raf: (cb: (t: number) => void) => (queue.set(next, cb), next++),
    caf: (id: number) => void queue.delete(id),
    pending: () => queue.size,
    flush(t: number) {
      const cbs = [...queue.values()];
      queue.clear();
      cbs.forEach((cb) => cb(t));
    },
  };
}

describe('createOnDemandLoop', () => {
  it('en reposo no pide ningún cuadro', () => {
    const f = fakeRaf();
    createOnDemandLoop({ step: () => {}, isActive: () => false, raf: f.raf, caf: f.caf });
    expect(f.pending()).toBe(0);
  });

  it('wake() arranca; sigue mientras hay movimiento y se detiene al acabar la gracia', () => {
    const f = fakeRaf();
    let active = true;
    const steps: number[] = [];
    const loop = createOnDemandLoop({ step: (t) => steps.push(t), isActive: () => active, graceMs: 100, raf: f.raf, caf: f.caf });
    loop.wake(0);
    expect(f.pending()).toBe(1);
    f.flush(16);
    f.flush(32);
    expect(steps).toEqual([16, 32]);
    expect(f.pending()).toBe(1);
    active = false;
    f.flush(48); // dentro de la gracia desde el último aviso: sigue
    expect(f.pending()).toBe(1);
    f.flush(120); // pasada la gracia y sin movimiento: se detiene
    expect(f.pending()).toBe(0);
    expect(loop.running).toBe(false);
  });

  it('varios wake() seguidos no duplican el bucle', () => {
    const f = fakeRaf();
    const loop = createOnDemandLoop({ step: () => {}, isActive: () => true, raf: f.raf, caf: f.caf });
    loop.wake(0);
    loop.wake(1);
    loop.wake(2);
    expect(f.pending()).toBe(1);
  });

  it('pause() corta el bucle e ignora wake() hasta resume()', () => {
    const f = fakeRaf();
    const loop = createOnDemandLoop({ step: () => {}, isActive: () => true, raf: f.raf, caf: f.caf });
    loop.wake(0);
    loop.pause();
    expect(f.pending()).toBe(0);
    loop.wake(10);
    expect(f.pending()).toBe(0);
    loop.resume();
    loop.wake(20);
    expect(f.pending()).toBe(1);
  });
});
