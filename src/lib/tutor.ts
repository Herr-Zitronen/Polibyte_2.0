// Tutor responsable (H7.2): el miembro con rol Tutor, si existe.
export function findTutor<T extends { role: string }>(members: T[]): T | undefined {
  return members.find((m) => m.role === "Tutor");
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}
