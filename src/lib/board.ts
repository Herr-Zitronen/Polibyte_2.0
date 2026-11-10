// Directiva (H7.1): orden por cargo y enlaces sociales.
import type { ImageMetadata } from "astro";
type Socials = {
  instagram?: string | undefined;
  linkedin?: string | undefined;
  github?: string | undefined;
};

export type BoardMember = Socials & {
  role: string;
  name: string;
  photo?: ImageMetadata | undefined;
};

export const BOARD_ORDER = [
  "Presidencia",
  "Vicepresidencia",
  "Secretaría",
  "Tesorería",
  "Webmaster",
] as const;

export function boardMembers<T extends { role: string }>(members: T[]): T[] {
  const rank = (r: string) =>
    BOARD_ORDER.indexOf(r as (typeof BOARD_ORDER)[number]);
  return members
    .filter((m) => rank(m.role) >= 0)
    .sort((a, b) => rank(a.role) - rank(b.role));
}

export type SocialLink = {
  label: "Instagram" | "LinkedIn" | "GitHub";
  href: string;
};

export function socialLinks(m: Socials): SocialLink[] {
  const links: SocialLink[] = [];
  if (m.instagram)
    links.push({
      label: "Instagram",
      href: `https://www.instagram.com/${m.instagram.replace(/^@/, "")}/`,
    });
  if (m.linkedin) links.push({ label: "LinkedIn", href: m.linkedin });
  if (m.github) links.push({ label: "GitHub", href: m.github });
  return links;
}
