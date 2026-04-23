const ALLOWED_EMAIL_DOMAIN = 'clearobject.com'

export function isAllowedCorporateEmail(email?: string | null): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
}

export function getAllowedEmailDomain(): string {
  return ALLOWED_EMAIL_DOMAIN
}
