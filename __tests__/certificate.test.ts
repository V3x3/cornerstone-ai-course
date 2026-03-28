import { generateCertNumber } from '@/lib/certificate'

test('certificate number format is CEU-YYYY-XXXXX', () => {
  const num = generateCertNumber()
  expect(num).toMatch(/^CEU-\d{4}-[A-Z0-9]{5}$/)
})

test('two calls produce different numbers', () => {
  const a = generateCertNumber()
  const b = generateCertNumber()
  expect(a).not.toBe(b)
})
