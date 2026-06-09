# FE Day 2026 — Talk Pitch App

A small internal web app for Cleo's Front-End chapter. It shows the **FE Day 2026**
agenda and lets chapter members **pitch a talk**. Themed as a retro 8-bit arcade game.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** — Postgres + Auth (Google sign-in, restricted to `@meetcleo.com`)
- Plain global CSS (the retro theme, ported from the design prototype)
- **Vitest** + Testing Library for unit/component tests

## Screens

| Route | Access | What |
|---|---|---|
| `/` | public | Landing + "Sign in with Google" |
| `/agenda` | signed-in | The FE Day running order |
| `/pitch` | signed-in | Pitch a talk (open agenda slots deep-link here via `?type=`) |
| `/my-pitches` | signed-in | Your own submissions |
| `/admin` | organisers only | All submissions, assign talks to agenda slots |

## Prerequisites

- Node ≥ 20 and [pnpm](https://pnpm.io)
- A [Supabase](https://supabase.com) project
- A Google OAuth client (wired into Supabase Auth)

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Create a Supabase project** at supabase.com.
3. **Apply the schema.** Run the SQL migrations in order in the Supabase SQL editor (or via the Supabase CLI):
   - [`supabase/migrations/0001_talk_submissions.sql`](supabase/migrations/0001_talk_submissions.sql) — submissions + organisers
   - [`supabase/migrations/0002_agenda_assignments.sql`](supabase/migrations/0002_agenda_assignments.sql) — slot assignments for the agenda
4. **Enable Google auth.** In Supabase: *Authentication → Providers → Google*. Create a Google
   OAuth client in the Google Cloud Console, set its authorized redirect URI to
   `https://<your-project-ref>.supabase.co/auth/v1/callback`, and paste the client ID/secret
   into Supabase. *(Optional, strongest lock: set the Google OAuth consent screen to "Internal"
   for the Cleo Workspace so only `@meetcleo.com` Google accounts can authenticate at all.)*
5. **Configure env.** Copy the example and fill in your values (Supabase *Settings → API*):
   ```bash
   cp .env.example .env.local
   ```
6. **Run it.**
   ```bash
   pnpm dev    # http://localhost:3000
   ```

## Adding organisers

Organisers see every submission at `/admin` and can confirm pitches into open agenda slots. Grant access by inserting into `organisers`:

```sql
insert into public.organisers (email) values ('someone@meetcleo.com');
```

## How the Cleo-domain lock works

Sign-in is Google OAuth via Supabase (with `hd=meetcleo.com` hinting the Cleo domain). The
`@meetcleo.com` restriction is enforced in depth, in three places:

1. **OAuth callback** — a non-Cleo account is signed out immediately after the code exchange.
2. **Middleware** — every protected route re-checks the session email.
3. **Row Level Security** — the database policies gate every insert/select.

The app uses the Supabase **anon key only** — there is no service-role key anywhere; RLS does
the access control.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm test` | Run the Vitest suite |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`src/`) |

## Project structure

```
src/app/             routes (App Router) + auth & pitch server actions
src/components/       UI primitives, screen components
src/lib/             FE Day data, validation, Supabase clients, auth + query helpers
supabase/migrations/ SQL schema + RLS policies
feday_design_specs/  the original design prototype (reference only — not shipped)
```

## Notes & current limitations

- The agenda is hard-coded in [`src/lib/feday-data.ts`](src/lib/feday-data.ts).
- Talk-type durations (lightning 10 / talk 30 / workshop 60 min) follow the agenda's slot lengths.
- Read screens show an empty state when there's no data; a transient read error currently also
  surfaces as "empty" (no dedicated error UI yet).
- Deployment isn't configured yet — it's a local-first build. On a host (e.g. Vercel), set the
  two env vars and add the host's `/auth/callback` origin to Supabase's redirect allow-list.
