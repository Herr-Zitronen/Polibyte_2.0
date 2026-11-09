const LABELS = { presencial: 'Presencial', remoto: 'Remoto', 'híbrido': 'Híbrido' } as const;

export function modeLabel(mode: keyof typeof LABELS): string {
  return LABELS[mode];
}
