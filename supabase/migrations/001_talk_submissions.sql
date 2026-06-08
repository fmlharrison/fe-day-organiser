-- FE Day 2026 talk submissions

create table if not exists public.talk_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('lightning', 'talk', 'workshop')),
  title text not null check (char_length(title) between 1 and 70),
  description text not null check (char_length(description) between 10 and 400),
  submitter_name text not null,
  team text not null,
  created_at timestamptz not null default now()
);

alter table public.talk_submissions enable row level security;

create policy "Users can insert own submissions"
  on public.talk_submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own submissions"
  on public.talk_submissions
  for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists talk_submissions_user_id_idx
  on public.talk_submissions (user_id);

create index if not exists talk_submissions_created_at_idx
  on public.talk_submissions (created_at desc);
