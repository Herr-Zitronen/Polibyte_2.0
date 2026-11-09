// Registra las colecciones; los esquemas viven en src/content/schemas.ts.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { eventSchema, memberSchema, projectSchema } from './content/schemas';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: eventSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  // reference('events'): el build falla si el evento no existe.
  schema: ({ image }) => projectSchema(image, () => reference('events')),
});

const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: ({ image }) => memberSchema(image),
});

export const collections = { events, projects, members };
