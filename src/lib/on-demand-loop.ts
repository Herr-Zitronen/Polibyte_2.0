// Bucle de rAF bajo demanda (perf/fluidez-real): solo pide cuadros mientras hay algo que mover.
// Lo usa Lenis: en reposo no corre ningún rAF, así no se fuerza un cuadro del hilo principal por refresco.

export interface OnDemandLoopOptions {
  /** Trabajo de cada cuadro. */
  step: (time: number) => void;
  /** ¿Sigue habiendo movimiento? Mientras sea cierto, el bucle continúa. */
  isActive: () => boolean;
  /** Tras el último aviso, el bucle sigue este tiempo aunque `isActive` aún no lo confirme. */
  graceMs?: number;
  raf?: (cb: (time: number) => void) => number;
  caf?: (id: number) => void;
}

export interface OnDemandLoop {
  /** Avisa de que puede haber movimiento (rueda, tecla, clic…): arranca el bucle si estaba parado. */
  wake: (now?: number) => void;
  /** Corta el bucle e ignora los avisos hasta `resume()`. */
  pause: () => void;
  resume: () => void;
  readonly running: boolean;
}

export function createOnDemandLoop({
  step,
  isActive,
  graceMs = 200,
  raf = (cb) => requestAnimationFrame(cb),
  caf = (id) => cancelAnimationFrame(id),
}: OnDemandLoopOptions): OnDemandLoop {
  let id = 0;
  let paused = false;
  let lastWake = 0;

  const frame = (time: number) => {
    id = 0;
    step(time);
    if (!paused && (isActive() || time - lastWake < graceMs)) id = raf(frame);
  };

  return {
    wake(now = performance.now()) {
      lastWake = now;
      if (!id && !paused) id = raf(frame);
    },
    pause() {
      paused = true;
      if (id) caf(id);
      id = 0;
    },
    resume() {
      paused = false;
    },
    get running() {
      return id !== 0;
    },
  };
}
