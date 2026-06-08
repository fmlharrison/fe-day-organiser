create table if not exists public.talk_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submitter_name text not null,
  submitter_email text not null,
  team text not null,
  type text not null check (type in ('lightning','talk','workshop')),
  title text not null check (char_length(title) between 1 and 70),
  description text not null check (char_length(description) between 10 and 400)
);
create index if not exists talk_submissions_user_id_idx on public.talk_submissions (user_id);
create index if not exists talk_submissions_created_at_idx on public.talk_submissions (created_at desc);

create table if not exists public.organisers ( email text primary key );

alter table public.talk_submissions enable row level security;
alter table public.organisers enable row level security;

create policy "submitters insert own" on public.talk_submissions
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and lower(coalesce(auth.jwt() ->> 'email','')) like '%@meetcleo.com'
    and lower(submitter_email) = lower(coalesce(auth.jwt() ->> 'email',''))
  );
create policy "submitters select own" on public.talk_submissions
  for select to authenticated using (auth.uid() = user_id);
create policy "organisers select all" on public.talk_submissions
  for select to authenticated
  using (exists (select 1 from public.organisers o
                 where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email',''))));
create policy "read own organiser row" on public.organisers
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));

insert into public.organisers (email) values ('felix@meetcleo.com') on conflict (email) do nothing;
