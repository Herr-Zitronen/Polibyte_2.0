// Fixtures de laboratorio para H5.1 (reloj fijo: 9 nov 2026). Las usan las páginas /lab/recap*.
const d = (s: string) => new Date(`${s}T00:00:00-05:00`);
export const RECAP_NOW = d('2026-11-09');

type Showcase = 'hidden' | 'published';
type Stats = { teams?: number; projects?: number; people?: number };

const base = { type: 'club' as 'club' | 'competition', organizer: 'PoliByte', showcase: 'hidden' as Showcase };

export const recapEvents: (typeof base & {
  id: string;
  title: string;
  ally?: string;
  date: Date;
  endDate?: Date;
  summary: string;
  stats?: Stats;
})[] = [
  { ...base, id: 'icpc', title: 'ICPC Regional', type: 'competition', organizer: 'ICPC', date: d('2025-10-18'), summary: 'Programación competitiva.' },
  { ...base, id: 'git', title: 'Taller de Git', ally: 'GDG Riobamba', date: d('2026-03-14'), summary: 'De cero a pull request.' },
  {
    ...base,
    id: 'hack',
    title: 'Hackathon ESPOCH',
    ally: 'IEEE CS',
    date: d('2026-05-16'),
    endDate: d('2026-05-17'),
    summary: '24 horas para resolver un problema real de Riobamba.',
    stats: { teams: 12, projects: 11, people: 44 },
    showcase: 'published',
  },
  { ...base, id: 'codefest', title: 'Codefest', date: d('2027-02-20'), summary: 'Próximo.' },
];

export const recapProjects = [{ event: 'hack', featured: true }];
