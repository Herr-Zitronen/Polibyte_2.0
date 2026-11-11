// Enlaces del pie (DESIGN §3.10) a partir de site.json: los vacíos no se muestran.
export interface SiteLinks {
  email: string;
  instagram: string;
  github: string;
}

export interface FooterLink {
  label: string;
  href: string;
  /** Abre en otra pestaña (redes); el correo no. */
  external: boolean;
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

/** Acepta la URL completa o solo el usuario (con o sin @). Orden fijo: Correo, Instagram, GitHub. */
export function footerLinks(links: SiteLinks): FooterLink[] {
  const out: FooterLink[] = [];
  const email = links.email.trim();
  const instagram = links.instagram.trim();
  const github = links.github.trim();
  if (email) out.push({ label: 'Correo', href: email.startsWith('mailto:') ? email : `mailto:${email}`, external: false });
  if (instagram)
    out.push({ label: 'Instagram', href: isUrl(instagram) ? instagram : `https://www.instagram.com/${instagram.replace(/^@/, '')}/`, external: true });
  if (github) out.push({ label: 'GitHub', href: isUrl(github) ? github : `https://github.com/${github.replace(/^@/, '')}`, external: true });
  return out;
}
