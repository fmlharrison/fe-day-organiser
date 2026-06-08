# FE Day Organiser

A retro 8-bit web app for Cleo's Front-End chapter to explore the **FE Day 2026** agenda and submit talk ideas.

## Features

- **Landing page** — arcade-style title screen with Google sign-in
- **Agenda** — full running order with open slot CTAs
- **Pitch a talk** — submit lightning talks, long talks, or workshops
- **Google OAuth** — restricted to `@meetcleo.com` accounts
- **Supabase persistence** — talk submissions stored in PostgreSQL

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Supabase](https://supabase.com/) (Auth + PostgreSQL)
- Design reference: [`feday_design_specs/`](feday_design_specs/)

## Local development

### 1. Clone and install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Run the migration in [`supabase/migrations/001_talk_submissions.sql`](supabase/migrations/001_talk_submissions.sql) via the SQL Editor.
3. Copy your project URL and anon key into `.env.local`.

### 3. Enable Google OAuth

**Supabase dashboard**

1. Go to **Authentication → Providers → Google** and enable it.
2. Add your Google Client ID and Client Secret (from Google Cloud Console).
3. Under **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000` (or your production URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`

**Google Cloud Console**

1. Create an OAuth 2.0 Client ID (Web application).
2. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
3. For Cleo Workspace, configure the OAuth consent screen for your organisation domain.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

## Deployment (Vercel)

1. Import the repo into [Vercel](https://vercel.com/).
2. Add the environment variables above.
3. Update Supabase redirect URLs to include your production domain (`https://<your-app>/auth/callback`).
4. Deploy.

## Viewing submissions

Organisers can view all talk pitches in the Supabase **Table Editor** → `talk_submissions`, or export via SQL.

## Project structure

```
src/
├── app/           # Routes: /, /agenda, /pitch, /auth/callback, /api/submissions
├── components/    # UI, landing, agenda, pitch components
├── lib/           # Auth helpers, Supabase clients, static data
└── styles/        # Retro 8-bit theme (ported from design spec)
```
