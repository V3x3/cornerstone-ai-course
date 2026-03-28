/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: () => ({ upsert: async () => ({ error: null }) }),
  })
}))

import { NextRequest } from 'next/server'

test('progress route rejects invalid moduleId', async () => {
  const { POST } = await import('@/app/api/progress/route')
  const req = new NextRequest('http://localhost/api/progress', {
    method: 'POST',
    body: JSON.stringify({ moduleId: 0, lessonId: 1 }),
    headers: { 'Content-Type': 'application/json' },
  })
  const res = await POST(req)
  expect(res.status).toBe(400)
})

test('progress route rejects invalid lessonId', async () => {
  const { POST } = await import('@/app/api/progress/route')
  const req = new NextRequest('http://localhost/api/progress', {
    method: 'POST',
    body: JSON.stringify({ moduleId: 1, lessonId: 99 }),
    headers: { 'Content-Type': 'application/json' },
  })
  const res = await POST(req)
  expect(res.status).toBe(400)
})
