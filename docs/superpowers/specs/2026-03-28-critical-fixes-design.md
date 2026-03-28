# Critical Fixes Design

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this spec task-by-task.

**Goal:** Fix five critical issues: lesson page 503 errors on Vercel, stats bar clipping on mobile, missing mobile navigation, missing password reset flow, and missing Google OAuth login.

**Architecture:** All fixes are independent — no shared state, no cross-task dependencies. Each can be implemented and deployed separately. No new dependencies required.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase Auth (`@supabase/ssr`), CSS media queries (no new libraries)

---

## Fix 1 — 503 errors on lesson pages

### Problem

`components/course/LessonContent.tsx` calls `fs.readFileSync` at request time using `process.cwd()` to locate markdown files. Vercel's serverless bundler does not automatically include the `content/` directory in function bundles unless explicitly configured. This causes intermittent 503 errors on cold starts or when the file is not traced into the bundle.

Affected pages reported: `/course/1/2`, `/course/1/4`, `/course/1/5`, `/course/2/4`, `/course/2/5`, `/course/3/4`.

### Fix

Two changes:

**1. `next.config.ts` — add output file tracing**

Tell Next.js to always include the `content/` directory in the serverless bundle:

```ts
experimental: {
  outputFileTracingIncludes: {
    '/course/[moduleId]/[lessonId]': ['./content/**/*'],
  },
}
```

**2. `app/course/[moduleId]/[lessonId]/page.tsx` — add `generateStaticParams`**

Pre-render all 21 lesson pages at build time. This eliminates runtime filesystem reads entirely:

```ts
export async function generateStaticParams() {
  return MODULES.flatMap(m =>
    m.lessons.map(l => ({ moduleId: String(m.id), lessonId: String(l.id) }))
  )
}
```

Also add `export const dynamic = 'force-static'` is NOT needed — `generateStaticParams` alone is sufficient. The page can remain dynamic for auth (each user sees their own completion state).

**Note:** `generateStaticParams` pre-renders page shells but the auth check inside still runs per-request in Next.js App Router. This is fine — static generation here means the filesystem read happens at build time, not the auth logic.

### Files changed
- `next.config.ts` — add `outputFileTracingIncludes`
- `app/course/[moduleId]/[lessonId]/page.tsx` — add `generateStaticParams`

---

## Fix 2 — Stats bar clipping on mobile

### Problem

`components/landing/Stats.tsx` renders 5 items in a single `display: flex` row. On screens narrower than ~500px the last 1–2 items (`Self-paced`, `Certificate`) are hidden by `overflow: hidden` on the container.

### Fix

Add `flexWrap: 'wrap'` to the `<ul>` and set each `<li>` to `minWidth: 'calc(33.333% - 1px)'` so the 5 items reflow to a 3+2 grid on small screens. Remove `overflow: 'hidden'` (it was only there to clip rounded corners on the flex children — the `borderRadius` on the parent handles this without needing overflow hidden once items wrap).

```tsx
// ul style change:
{ display: 'flex', flexWrap: 'wrap', background: 'var(--bg2)', ... }

// li style change:
{ flex: 1, minWidth: 'calc(33.333% - 1px)', padding: '18px 12px', ... }
```

### Files changed
- `components/landing/Stats.tsx`

---

## Fix 3 — Mobile hamburger drawer

### Problem

The course layout uses a fixed 260px sidebar in a `display: flex` row. On mobile this pushes the main content off-screen or severely compresses it. There is no responsive behaviour at any breakpoint.

### Design

**Below 768px:**
- Sidebar is hidden off-screen (`transform: translateX(-100%)`)
- A sticky top bar appears with: `☰` button (left), current lesson title (center), `← Dashboard` link (right)
- Tapping `☰` slides the sidebar in as a full-height overlay with a semi-transparent backdrop
- Tapping the backdrop or any lesson link closes the drawer
- The sidebar content is identical to desktop — same module/lesson list, same progress bars, same quiz buttons

**Above 768px:**
- Existing desktop layout is completely unchanged
- The sticky top bar is hidden (`display: none`)

### Architecture

Create a new `'use client'` wrapper component `components/course/MobileNav.tsx` that:
- Holds `isOpen: boolean` state
- Renders the sticky top bar + backdrop + open/close logic
- Accepts `completed: ProgressRow[]` as a prop and renders `<Sidebar>` inside the drawer

Update `app/course/layout.tsx` to:
- Render `<MobileNav completed={...} />` (visible only on mobile via CSS)
- Keep existing `<Sidebar>` (hidden on mobile via CSS class or inline media query via a wrapper `div`)

**CSS approach:** Use a `<style>` tag in the layout with `@media (max-width: 768px)` rules, or inline a `suppressHydrationWarning` style block. Since the project uses inline styles throughout, use a `<style jsx>` equivalent via a `<style>` tag in the layout component.

### Files changed
- `components/course/MobileNav.tsx` — new file
- `app/course/layout.tsx` — add MobileNav, hide desktop sidebar on mobile

---

## Fix 4 — Password reset flow

### Problem

There is no "Forgot password?" link or reset flow. Users who forget their password cannot recover their account.

### Design

**Two new pages:**

**`/forgot-password`**
- Simple form: email input + "Send reset link" button
- On submit: calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<origin>/reset-password' })`
- Shows success message: "Check your email for a reset link"
- Error handling: invalid email format shown inline

**`/reset-password`**
- Reachable only via the link in the reset email (Supabase injects the session token as a URL hash)
- Form: new password + confirm password inputs + "Update password" button
- On load: reads the `code` query param injected by Supabase and calls `supabase.auth.exchangeCodeForSession(code)` to establish the session; redirects to `/forgot-password` if code is missing or invalid
- On submit: calls `supabase.auth.updateUser({ password: newPassword })`
- On success: redirects to `/dashboard`

**Login page update:**
- Add `Forgot password?` link below the password field, linking to `/forgot-password`

**Supabase dashboard (manual step — done by developer, not code):**
- Authentication → URL Configuration → add `https://cornerstone-ai-course.vercel.app/reset-password` to Redirect URLs

### Files changed
- `app/forgot-password/page.tsx` — new file
- `app/reset-password/page.tsx` — new file
- `app/login/page.tsx` — add "Forgot password?" link

---

## Fix 5 — Google OAuth

### Problem

Login and signup only support email/password. Users cannot use Google to authenticate.

### Design

**UI changes (login + signup pages):**
Add a "Continue with Google" button above the email form, separated by an "or" divider:

```
[ Continue with Google ]
─────── or ───────
Email: ___________
Password: ________
[ Log in ]
```

The button calls:
```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
})
```

**New OAuth callback route:**

`app/auth/callback/route.ts` — handles the redirect from Google after authentication:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

**Supabase dashboard (manual step — done by developer):**
1. Authentication → Providers → Google → enable
2. Add Google OAuth Client ID + Secret (from Google Cloud Console)
3. Add `https://cornerstone-ai-course.vercel.app/auth/callback` to Redirect URLs

**Profile creation:** Google OAuth users also trigger the `handle_new_user` Supabase trigger — no changes needed to the profiles table or trigger.

### Files changed
- `app/auth/callback/route.ts` — new file
- `app/login/page.tsx` — add Google button + "or" divider
- `app/signup/page.tsx` — add Google button + "or" divider

---

## Out of scope

- Apple / GitHub OAuth (can be added later with same pattern as Google)
- Email verification enforcement (currently off, keep off)
- Admin-managed user accounts
- Any changes to quiz, certificate, or dashboard pages
