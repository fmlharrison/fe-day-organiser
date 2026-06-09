create table if not exists public.agenda_assignments (
  slot_id text primary key,
  submission_id uuid not null unique references public.talk_submissions(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid not null references auth.users(id)
);

create index if not exists agenda_assignments_submission_id_idx
  on public.agenda_assignments (submission_id);

alter table public.agenda_assignments enable row level security;

create policy "authenticated read assignments" on public.agenda_assignments
  for select to authenticated
  using (true);

create policy "organisers insert assignments" on public.agenda_assignments
  for insert to authenticated
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers update assignments" on public.agenda_assignments
  for update to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ))
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers delete assignments" on public.agenda_assignments
  for delete to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));
