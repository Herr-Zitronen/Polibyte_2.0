import { describe, expect, it } from 'vitest';
import { STATUS_LABELS } from './status-labels';

describe('STATUS_LABELS', () => {
  it('traduce cada estado calculado a su texto en español', () => {
    expect(STATUS_LABELS).toEqual({ upcoming: 'Próximo', past: 'Realizado', tbd: 'Por confirmar' });
  });
});
