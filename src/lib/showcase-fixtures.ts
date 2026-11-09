// Fixtures de laboratorio para H5.2: proyectos del evento 'hack' de recap-fixtures.
import type { ImageMetadata } from 'astro';
import mobile from '../assets/backgrounds/fog.webp';
import desktop from '../content/projects/hackathon-espoch-2026/shot.webp';

const base = {
  event: 'hack',
  members: ['Ana', 'Luis'],
  problem: 'Qué resuelve, en una frase.',
  stack: ['Astro', 'TypeScript'],
  demoUrl: 'https://example.com/',
  repoUrl: 'https://github.com/example/demo',
  shotDesktop: desktop as ImageMetadata,
};

type Fixture = typeof base & { title: string; team: string; featured: boolean; order: number; shotMobile?: ImageMetadata };

export const showcaseProjects: Fixture[] = [
  { ...base, title: 'Proyecto 1', team: 'Equipo 1', featured: true, order: 1, shotMobile: mobile as ImageMetadata },
  { ...base, title: 'Proyecto 2', team: 'Equipo 2', featured: true, order: 2 },
  { ...base, title: 'Proyecto 3', team: 'Equipo 3', featured: true, order: 3 },
  { ...base, title: 'Proyecto 4', team: 'Equipo 4', featured: false, order: 4 },
  { ...base, title: 'Proyecto 5', team: 'Equipo 5', featured: false, order: 5 },
];
