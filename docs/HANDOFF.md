# Cornerstone AI Course Platform — Handoff Document

## What this project is
A Next.js 16 + Supabase course platform deployed at https://cornerstone-ai-course.vercel.app
GitHub repo: viktorhristov/cornerstone-ai-course (or similar, check `git remote -v`)
Supabase project URL: https://tsqszytokopqkxqodkyb.supabase.co

## Tech stack
- Next.js 16.2.1 (App Router, TypeScript)
- Supabase (auth + PostgreSQL) via `@supabase/ssr`
- Vercel hosting
- No external UI library — custom CSS via design tokens in `app/globals.css`

## Key non-obvious facts

### Next.js 16 breaking change
The middleware file is `proxy.ts` (not `middleware.ts`) and exports `proxy` (not `middleware`).
This is a Next.js 16 rename. Do NOT create a `middleware.ts` — it will conflict.

### Supabase key format
The project uses the new `sb_publishable_*` key format (not the old `eyJ...` JWT format).
Keys are in `.env.local` and also added to Vercel env vars via `vercel env add`.

### Supabase server client
`lib/supabase/server.ts` — async function, uses `cookies()` from `next/headers`.
Always `await createClient()`.

### Layout params limitation
`app/course/layout.tsx` does NOT receive `[moduleId]` or `[lessonId]` params — those are child route segments.
Active lesson highlighting in the Sidebar uses `usePathname()` (client component) instead.

## Current known issue being debugged

**Progress not saving** — when user clicks "Mark complete", the progress bar stays at 0%.

### What we've tried
1. Fixed `router.refresh()` conflicting with `router.push()` → progress redirects now work
2. Added `console.error` logging to `MarkCompleteButton.tsx` so browser console shows the API response
3. Added profile upsert guard in `app/api/progress/route.ts` to fix FK constraint

### How to debug
1. Open the deployed app, open browser DevTools → Console tab
2. Click "Mark complete" on any lesson
3. Look for a `[progress]` log line — it will show the HTTP status and error body
4. Common errors:
   - **401** → session not being read in the API route. See "Debugging 401s" below.
   - **500 + FK violation** → profile row missing. The guard in route.ts should fix this.
   - **500 + RLS** → Row Level Security blocking insert. See "Debugging RLS" below.

### Debugging 401s
The API route `app/api/progress/route.ts` calls `supabase.auth.getUser()`.
If it returns null, the session cookie isn't being read.

Check: go to Supabase Dashboard → Authentication → Providers → Email → is **"Confirm email"** ON?
If ON, the user has a session but the access token might not be present.
**Fix: turn off email confirmation** (Authentication → Providers → Email → toggle Confirm email OFF).

If email confirmation is already off, check that the `proxy.ts` middleware is actually refreshing sessions by looking at Vercel function logs for the `/api/progress` route.

### Debugging RLS
Run this in Supabase SQL Editor to check what policies exist:
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'lesson_progress';
```

The policy should be:
```sql
CREATE POLICY "Users manage own progress"
  ON lesson_progress FOR ALL USING (auth.uid() = user_id);
```

If missing, re-run the migration in `supabase/migrations/001_initial.sql`.

### Debugging FK violations
Run in Supabase SQL Editor:
```sql
SELECT id, email FROM profiles LIMIT 20;
```
If empty, the `handle_new_user` trigger isn't creating profiles on signup.
Fix — run this in SQL Editor:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Also manually create a profile for existing users who signed up before the fix:
```sql
INSERT INTO profiles (id, email)
SELECT id, COALESCE(email, '') FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

## File map (key files)

```
app/
  page.tsx                    # Landing page
  layout.tsx                  # Root layout, fonts, global styles
  globals.css                 # Design tokens (--g1, --g2, --g3, --bg1, --bg2, etc.)
  login/page.tsx              # Login form
  signup/page.tsx             # Signup form
  dashboard/page.tsx          # User dashboard with module progress
  course/
    layout.tsx                # Course shell: auth check, loads progress, renders Sidebar
    [moduleId]/[lessonId]/
      page.tsx                # Individual lesson page: renders markdown, MarkCompleteButton
  quiz/[moduleId]/page.tsx    # Quiz page (5 questions, 70% to pass)
  certificate/page.tsx        # Certificate page
  api/
    progress/route.ts         # POST: saves lesson completion
    quiz/route.ts             # POST: saves quiz attempt
    certificate/route.ts      # POST: generates + saves certificate

components/
  course/
    Sidebar.tsx               # 'use client' — uses usePathname() for active state
    MarkCompleteButton.tsx    # 'use client' — calls /api/progress, then navigates

lib/
  content.ts                  # Course registry: MODULES array, 4 modules, 21 lessons
  progress.ts                 # Progress helpers: calculateModuleProgress, isCourseComplete
  certificate.ts              # generateCertNumber() → CEU-YYYY-XXXXX
  supabase/
    server.ts                 # createClient() for server components + API routes
    client.ts                 # createBrowserClient() for client components

proxy.ts                      # Next.js 16 middleware (named 'proxy', not 'middleware')
```

## Deploying changes
```bash
git add -A
git commit -m "your message"
vercel deploy --prod
```

## DB migrations
Supabase doesn't auto-run migration files. Apply SQL manually via:
Supabase Dashboard → SQL Editor → paste SQL → Run

## Environment variables
Set in `.env.local` for local dev, and in Vercel for production:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
(Get these from Supabase Dashboard → Project Settings → API)
To add/update on Vercel: `vercel env add NEXT_PUBLIC_SUPABASE_URL production`
