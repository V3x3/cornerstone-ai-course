# Critical Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix five critical issues: 503 errors on lesson pages, stats bar clipping on mobile, missing mobile navigation drawer, missing password reset flow, and missing Google OAuth login.

**Architecture:** Five independent tasks with no shared state or cross-task dependencies. Each task touches isolated files and can be committed separately. No new npm dependencies required.

**Tech Stack:** Next.js 16.2.1 App Router, TypeScript, Supabase Auth via `@supabase/ssr`, inline CSS + `<style>` tags for responsive design.

---

## Codebase context (read before starting any task)

- Project root: `/Users/viktorhristov/cornerstone-ai-course`
- Auth pages live under `app/(auth)/` — the `(auth)` is a Next.js route group (doesn't affect URL)
- Login URL: `/login` → file: `app/(auth)/login/page.tsx`
- Signup URL: `/signup` → file: `app/(auth)/signup/page.tsx` (wraps `components/landing/EnrolForm.tsx`)
- All styles are inline — no Tailwind utility classes in use despite Tailwind being installed
- Design tokens: `--g1` (#0a2e1a dark green), `--g2` (#1a5c38), `--g3` (#22c55e bright), `--bg2` (#e6f4ec), `--text2`, `--text3`
- Supabase browser client: `import { createClient } from '@/lib/supabase/client'`
- Supabase server client: `import { createClient } from '@/lib/supabase/server'` (async, must be awaited)
- `MODULES` array from `@/lib/content` — 4 modules, ids 1–4, each with a `lessons` array

---

## File map

| Status | File | Change |
|--------|------|--------|
| Modify | `next.config.ts` | Add outputFileTracingIncludes |
| Modify | `app/course/[moduleId]/[lessonId]/page.tsx` | Add generateStaticParams |
| Modify | `components/landing/Stats.tsx` | Add flexWrap for mobile |
| Create | `components/course/MobileNav.tsx` | Hamburger drawer component |
| Modify | `app/course/layout.tsx` | Add MobileNav, hide sidebar on mobile |
| Create | `app/(auth)/forgot-password/page.tsx` | Email input → send reset link |
| Create | `app/(auth)/reset-password/page.tsx` | New password form |
| Modify | `app/(auth)/login/page.tsx` | Add "Forgot password?" link + Google button |
| Modify | `components/landing/EnrolForm.tsx` | Add Google button |
| Create | `app/auth/callback/route.ts` | OAuth + password reset code exchange |

---

## Task 1: Fix 503 errors on lesson pages

**Files:**
- Modify: `next.config.ts`
- Modify: `app/course/[moduleId]/[lessonId]/page.tsx`

### Why this happens
`components/course/LessonContent.tsx` calls `fs.readFileSync` at request time. Vercel's serverless bundler doesn't reliably include the `content/` directory. Fix: (1) tell Next.js to always bundle those files, (2) pre-render all 21 lesson pages at build time so the filesystem read happens once at build, not at runtime.

- [ ] **Step 1: Update next.config.ts**

Replace the entire file with:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/course/[moduleId]/[lessonId]': ['./content/**/*'],
    },
  },
}

export default nextConfig
```

- [ ] **Step 2: Add generateStaticParams to the lesson page**

Open `app/course/[moduleId]/[lessonId]/page.tsx`. Add this import at the top:

```ts
import { MODULES } from '@/lib/content'
```

Then add this export directly above the `export default async function LessonPage` line:

```ts
export async function generateStaticParams() {
  return MODULES.flatMap(m =>
    m.lessons.map(l => ({
      moduleId: String(m.id),
      lessonId: String(l.id),
    }))
  )
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
cd /Users/viktorhristov/cornerstone-ai-course && npm run build 2>&1 | tail -20
```

Expected: build completes with no errors. You should see 21 lesson routes listed as `●` (static) in the build output under `/course/[moduleId]/[lessonId]`.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts app/course/\[moduleId\]/\[lessonId\]/page.tsx
git commit -m "fix: pre-render lesson pages at build time to eliminate 503 errors"
```

---

## Task 2: Fix stats bar clipping on mobile

**Files:**
- Modify: `components/landing/Stats.tsx`

### Why this happens
The stats bar uses `display: flex` with 5 items and `overflow: hidden`. On screens narrower than ~500px the last items clip. Fix: wrap to a 3+2 grid.

- [ ] **Step 1: Verify the bug exists**

Open the deployed site on a phone or use browser DevTools device simulation (F12 → device icon) at 375px width. The stats bar should clip "Self-paced" and "Certificate" off the right.

- [ ] **Step 2: Update Stats.tsx**

Replace the entire file content:

```tsx
const STATS = [
  { value: 'Free', label: 'Always' },
  { value: '4', label: 'Modules' },
  { value: '~45 min', label: 'Per module' },
  { value: 'Self-paced', label: 'No deadlines' },
  { value: 'Certificate', label: 'On completion' },
]

export default function Stats() {
  return (
    <>
      <style>{`
        .stats-bar { display: flex; flex-wrap: wrap; }
        .stats-item { flex: 1; min-width: calc(33.333% - 1px); }
        @media (min-width: 480px) { .stats-item { min-width: 0; } }
      `}</style>
      <ul className="stats-bar" style={{
        background: 'var(--bg2)',
        border: '1px solid var(--g2)', borderRadius: '8px',
        marginBottom: '2.5rem', listStyle: 'none', padding: 0,
      }}>
        {STATS.map((s, i) => (
          <li key={s.label} className="stats-item" style={{
            padding: '18px 12px', textAlign: 'center',
            borderRight: i < STATS.length - 1 ? '1px solid #c8e0d0' : 'none',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g2)' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500 }}>{s.label}</div>
          </li>
        ))}
      </ul>
    </>
  )
}
```

- [ ] **Step 3: Verify at 375px width**

Using browser DevTools at 375px: all 5 stats should now be visible — first row has 3 items (Free, 4, ~45 min), second row has 2 (Self-paced, Certificate).

- [ ] **Step 4: Commit**

```bash
git add components/landing/Stats.tsx
git commit -m "fix: stats bar wraps to 3+2 grid on mobile instead of clipping"
```

---

## Task 3: Mobile hamburger drawer

**Files:**
- Create: `components/course/MobileNav.tsx`
- Modify: `app/course/layout.tsx`

### Behaviour
- **≤768px**: desktop sidebar is hidden. A sticky top bar appears with `☰` button. Tapping opens a full-height overlay drawer showing the same sidebar. Tapping the backdrop or any lesson link closes it.
- **>768px**: existing desktop layout unchanged. Mobile top bar is hidden.

- [ ] **Step 1: Create MobileNav.tsx**

Create `/Users/viktorhristov/cornerstone-ai-course/components/course/MobileNav.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import type { ProgressRow } from '@/lib/progress'
import { MODULES, getLesson } from '@/lib/content'

interface Props {
  completed: ProgressRow[]
}

export default function MobileNav({ completed }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Derive current lesson title for the top bar
  const parts = pathname.split('/')
  const moduleId = parseInt(parts[2] ?? '1')
  const lessonId = parseInt(parts[3] ?? '1')
  const lesson = getLesson(moduleId, lessonId)
  const module = MODULES.find(m => m.id === moduleId)

  return (
    <>
      <style>{`
        .mobile-nav-bar { display: none; }
        .mobile-nav-overlay { display: none; }
        @media (max-width: 768px) {
          .mobile-nav-bar {
            display: flex;
            position: sticky;
            top: 0;
            z-index: 100;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg2);
            border-bottom: 1px solid #c8e0d0;
          }
          .mobile-nav-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 200;
          }
        }
      `}</style>

      {/* Sticky top bar — mobile only */}
      <div className="mobile-nav-bar">
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--g1)', padding: '0 4px' }}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--g1)' }}>
          {module ? `Module 0${moduleId}` : ''}{lesson ? ` · ${lesson.title}` : ''}
        </span>
        <a href="/dashboard" style={{ fontSize: '12px', color: 'var(--g2)', textDecoration: 'none' }}>← Dashboard</a>
      </div>

      {/* Overlay drawer */}
      {open && (
        <div className="mobile-nav-overlay">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
          />
          {/* Drawer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px',
            background: 'var(--bg2)', overflowY: 'auto', zIndex: 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: '1px solid #c8e0d0' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--g1)' }}
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <Sidebar completed={completed} />
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Update app/course/layout.tsx**

Replace the entire file:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/course/Sidebar'
import MobileNav from '@/components/course/MobileNav'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('module_id, lesson_id')
    .eq('user_id', user.id)

  return (
    <>
      <style>{`
        .course-sidebar { display: flex; }
        .course-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .course-sidebar { display: none; }
          .course-mobile-nav { display: block; }
        }
      `}</style>

      {/* Mobile nav — visible on small screens only */}
      <div className="course-mobile-nav">
        <MobileNav completed={progress ?? []} />
      </div>

      {/* Desktop layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="course-sidebar">
          <Sidebar completed={progress ?? []} />
        </div>
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '720px' }}>
          {children}
        </main>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify mobile layout**

Run `npm run build && npm run start` locally (or deploy). In browser DevTools at 375px width:
- Course layout: sidebar should be hidden, top bar visible with ☰
- Tapping ☰: drawer slides in showing all modules and lessons
- Tapping a lesson link: drawer closes, navigates to lesson
- At 900px width: top bar hidden, sidebar visible as normal

- [ ] **Step 4: Commit**

```bash
git add components/course/MobileNav.tsx app/course/layout.tsx
git commit -m "feat: add mobile hamburger drawer for course navigation"
```

---

## Task 4: Password reset flow

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`
- Create: `app/(auth)/reset-password/page.tsx`
- Modify: `app/(auth)/login/page.tsx`
- Create: `app/auth/callback/route.ts` (shared with Task 5 — create here, Task 5 will extend it)

**Note:** The `app/auth/callback/route.ts` file is created in this task and extended in Task 5. If Task 5 runs first, adjust accordingly.

### How Supabase password reset works (PKCE flow)
1. User submits email → `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://cornerstone-ai-course.vercel.app/reset-password' })`
2. Supabase emails the user a link: `https://cornerstone-ai-course.vercel.app/reset-password?code=xxx`
3. Reset page reads the `code` param → calls `supabase.auth.exchangeCodeForSession(code)` → establishes session
4. User enters new password → `supabase.auth.updateUser({ password })` → redirected to `/dashboard`

- [ ] **Step 1: Create forgot-password page**

Create `/Users/viktorhristov/cornerstone-ai-course/app/(auth)/forgot-password/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const inputStyle = {
    background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px',
    color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <a href="/login" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back to login</a>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Reset your password</h2>
        {sent ? (
          <p style={{ fontSize: '14px', color: '#7aad8a', lineHeight: 1.6 }}>
            Check your email — we sent a reset link to <strong style={{ color: '#fff' }}>{email}</strong>.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#7aad8a', marginBottom: '22px' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required style={inputStyle}
              />
              {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
              <button
                type="submit" disabled={loading}
                style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create reset-password page**

Create `/Users/viktorhristov/cornerstone-ai-course/app/(auth)/reset-password/page.tsx`:

```tsx
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) { router.replace('/forgot-password'); return }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) router.replace('/forgot-password')
      else setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputStyle = {
    background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px',
    color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%',
  }

  if (!ready) return <p style={{ color: '#7aad8a', fontSize: '13px' }}>Verifying reset link…</p>

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 8 chars)" required style={inputStyle} />
      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" required style={inputStyle} />
      {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {loading ? 'Updating…' : 'Update password →'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '22px' }}>Set new password</h2>
        <Suspense fallback={<p style={{ color: '#7aad8a', fontSize: '13px' }}>Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Add "Forgot password?" link to login page**

Open `app/(auth)/login/page.tsx`. Find this line (after the password input, before the error display):

```tsx
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
```

Replace with:

```tsx
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          <a href="/forgot-password" style={{ fontSize: '11px', color: '#4a7a5a', textAlign: 'right', textDecoration: 'none' }}>Forgot password?</a>
          {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
```

- [ ] **Step 4: Create auth/callback route (needed for code exchange)**

Create `/Users/viktorhristov/cornerstone-ai-course/app/auth/callback/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 6: Manual setup in Supabase dashboard (do this once)**

In Supabase dashboard:
1. Go to **Authentication → URL Configuration**
2. Under **Redirect URLs**, add: `https://cornerstone-ai-course.vercel.app/reset-password`
3. Also add: `https://cornerstone-ai-course.vercel.app/auth/callback`
4. Save

- [ ] **Step 7: Commit**

```bash
git add app/\(auth\)/forgot-password/page.tsx app/\(auth\)/reset-password/page.tsx app/\(auth\)/login/page.tsx app/auth/callback/route.ts
git commit -m "feat: add password reset flow (forgot-password + reset-password pages)"
```

---

## Task 5: Google OAuth

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `components/landing/EnrolForm.tsx`
- Modify: `app/auth/callback/route.ts` (already created in Task 4 — no changes needed, it handles OAuth too)

### How it works
- User clicks "Continue with Google" → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })`
- Google authenticates → redirects to `/auth/callback?code=xxx`
- The callback route (created in Task 4) exchanges the code → redirects to `/dashboard`
- The `handle_new_user` Supabase trigger automatically creates a profile row for new Google users

- [ ] **Step 1: Add Google button to login page**

Open `app/(auth)/login/page.tsx`. Add a `handleGoogleLogin` function inside the component (after `const router = useRouter()`):

```tsx
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }
```

Then inside the JSX, add the Google button and divider **above** the `<form>` tag:

```tsx
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '11px', borderRadius: '6px',
            background: '#fff', color: '#1a1a1a', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
          <span style={{ fontSize: '11px', color: '#4a7a5a' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
        </div>
```

The final `app/(auth)/login/page.tsx` should look like this in full:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputStyle = { background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px', color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%' }

  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <a href="/" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back</a>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '22px' }}>Welcome back</h2>
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '11px', borderRadius: '6px',
            background: '#fff', color: '#1a1a1a', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
          <span style={{ fontSize: '11px', color: '#4a7a5a' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          <a href="/forgot-password" style={{ fontSize: '11px', color: '#4a7a5a', textAlign: 'right', textDecoration: 'none' }}>Forgot password?</a>
          {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <p style={{ fontSize: '12px', color: '#4a7a5a', marginTop: '16px' }}>
          No account? <a href="/signup" style={{ color: 'var(--g3)' }}>Enrol free →</a>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Add Google button to EnrolForm**

Open `components/landing/EnrolForm.tsx`. Add `handleGoogleLogin` inside the component after `const supabase = createClient()`:

```tsx
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }
```

Then in the JSX, add the Google button and divider **above** the `<form>` tag (after the `<p>` description text):

```tsx
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '11px', borderRadius: '6px',
            background: '#fff', color: '#1a1a1a', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
          <span style={{ fontSize: '11px', color: '#4a7a5a' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#1a5c38' }} />
        </div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors.

- [ ] **Step 4: Manual setup in Supabase dashboard (one-time)**

1. Go to **Authentication → Providers → Google**
2. Toggle **Enable** on
3. Paste in your Google OAuth **Client ID** and **Client Secret** (from Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID)
4. In Google Cloud Console, add `https://tsqszytokopqkxqodkyb.supabase.co/auth/v1/callback` to Authorized Redirect URIs
5. Save in both places

- [ ] **Step 5: Commit and deploy**

```bash
git add app/\(auth\)/login/page.tsx components/landing/EnrolForm.tsx
git commit -m "feat: add Google OAuth login to login and signup pages"
vercel deploy --prod
```

---

## Final deploy

After all 5 tasks are committed:

```bash
vercel deploy --prod 2>&1 | grep -E "(Aliased:|READY)"
```

Expected: `Aliased: https://cornerstone-ai-course.vercel.app`
