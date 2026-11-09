import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { eventSchema, projectSchema } from '../../../../src/content/schemas';

const events = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/events' }), schema: eventSchema });
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => projectSchema(image, () => reference('events')),
});

export const collections = { events, projects };
