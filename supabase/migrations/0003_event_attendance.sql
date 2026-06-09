create table if not exists public.event_attendance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  attendee_name text not null,
  attendee_email text not null,
  mode text not null check (mode in ('in_person', 'remote'))
);

create index if not exists event_attendance_mode_idx on public.event_attendance (mode);

alter table public.event_attendance enable row level security;

create policy "attendees upsert own" on public.event_attendance
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
    and lower(attendee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "attendees update own" on public.event_attendance
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
    and lower(attendee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "authenticated read attendance" on public.event_attendance
  for select to authenticated
  using (true);
