export function generateCertNumber(): string {
  const year = new Date().getFullYear()
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `CEU-${year}-${suffix}`
}
