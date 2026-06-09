export const ALLOWED_EMAIL_DOMAIN = "meetcleo.com";

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const suffix = "@" + ALLOWED_EMAIL_DOMAIN;
  return normalized.length > suffix.length && normalized.endsWith(suffix);
}
