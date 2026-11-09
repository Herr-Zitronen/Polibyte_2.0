// Esquemas de CONTENT_MODEL.md. Viven aparte de content.config.ts para que Vitest
// los importe sin arrancar Astro. `image` y `reference` llegan como parámetros
// porque solo existen dentro de Astro.
import { z } from 'astro/zod';


const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Una fecha sin hora ("2026-12-05", o el Date a medianoche UTC que produce YAML)
 *  significa ese día en Riobamba (UTC−5), no en UTC. */
export function toLocalDate(v: unknown): unknown {
  if (typeof v === 'string' && DATE_ONLY.test(v)) return new Date(`${v}T00:00:00-05:00`);
  if (v instanceof Date && v.getUTCHours() === 0 && v.getUTCMinutes() === 0 && v.getUTCSeconds() === 0) {
    return new Date(v.getTime() + 5 * 3600_000);
  }
  return v;
}

const localDate = z.preprocess(toLocalDate, z.coerce.date());

export const eventSchema = z.object({
  title: z.string(),
  type: z.enum(['club', 'competition']),
  organizer: z.string(),
  ally: z.string().optional(),
  date: localDate.optional(),
  endDate: localDate.optional(),
  time: z.string().optional(),
  place: z.string().optional(),
  mode: z.enum(['presencial', 'remoto', 'híbrido']).optional(),
  teamSize: z.string().optional(),
  requirements: z.string().optional(),
  summary: z.string(),
  pitch: z.string().optional(),
  registrationUrl: z.url().optional(),
  registrationDeadline: localDate.optional(),
  schedule: z.array(z.object({ date: z.string(), title: z.string(), detail: z.string() })).default([]),
  stats: z.object({ teams: z.number(), projects: z.number(), people: z.number() }).partial().optional(),
  showcase: z.enum(['hidden', 'published']).default('hidden'),
});

export type EventData = z.infer<typeof eventSchema>;

export const projectSchema = <I extends z.ZodType, R extends z.ZodType>(image: () => I, eventRef: () => R) =>
  z.object({
    event: eventRef(),
    title: z.string(),
    team: z.string(),
    members: z.array(z.string()),
    problem: z.string(),
    stack: z.array(z.string()),
    demoUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    shotDesktop: image(),
    shotMobile: image().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  });

export const memberSchema = <I extends z.ZodType>(image: () => I) =>
  z.object({
    role: z.enum(['Presidencia', 'Vicepresidencia', 'Secretaría', 'Tesorería', 'Webmaster', 'Tutor']),
    name: z.string(),
    photo: image().optional(),
    instagram: z.string().optional(),
    linkedin: z.url().optional(),
    github: z.url().optional(),
    title: z.string().optional(),
    faculty: z.string().optional(),
    about: z.string().optional(),
    email: z.email().optional(),
    period: z.string(),
  });

export const siteSchema = z.object({
  name: z.string(),
  descriptor: z.string(),
  institution: z.string(),
  joinFormUrl: z.url(),
  links: z.object({ email: z.string(), instagram: z.string(), github: z.string() }),
  period: z.string(),
});
