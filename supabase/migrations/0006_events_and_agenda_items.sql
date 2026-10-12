create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 40),
  tagline text not null check (char_length(tagline) <= 120),
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text not null check (char_length(location) between 1 and 60),
  check (end_time > start_time)
);

create index if not exists events_event_date_idx on public.events (event_date);

create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  start_time time not null,
  end_time time not null,
  kind text not null check (kind in ('lightning', 'talk', 'workshop', 'break', 'fixed')),
  title text not null check (char_length(title) between 1 and 70),
  description text not null check (char_length(description) <= 400),
  check (end_time > start_time),
  -- Target for the (agenda_item_id, event_id) composite FK on agenda_assignments,
  -- so the database can guarantee a talk only fills a slot in its own event.
  unique (id, event_id)
);

create index if not exists agenda_items_event_id_start_time_idx
  on public.agenda_items (event_id, start_time);

alter table public.events enable row level security;
alter table public.agenda_items enable row level security;

create policy "authenticated read events" on public.events
  for select to authenticated
  using (true);

create policy "organisers insert events" on public.events
  for insert to authenticated
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers update events" on public.events
  for update to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ))
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers delete events" on public.events
  for delete to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "authenticated read agenda items" on public.agenda_items
  for select to authenticated
  using (true);

create policy "organisers insert agenda items" on public.agenda_items
  for insert to authenticated
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers update agenda items" on public.agenda_items
  for update to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ))
  with check (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

create policy "organisers delete agenda items" on public.agenda_items
  for delete to authenticated
  using (exists (
    select 1 from public.organisers o
    where lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

-- Seed the July 2026 event with the agenda that was hardcoded in src/lib/feday-data.ts.
-- On re-run the event insert is a no-op, so the agenda isn't duplicated.
with july as (
  insert into public.events (slug, title, tagline, event_date, start_time, end_time, location)
  values (
    'july-2026',
    'FE DAY',
    'INSERT COIN — SHARE WHAT YOU KNOW',
    '2026-07-01',
    '10:00',
    '16:00',
    'LION''S SHARE + REMOTE'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.agenda_items (event_id, start_time, end_time, kind, title, description)
select july.id, item.start_time::time, item.end_time::time, item.kind, item.title, item.description
from july
cross join (values
  ('10:00', '10:30', 'fixed', 'Doors Open + Ice Breaker', 'Grab a coffee (or a tea, we don''t judge) and a quick warm-up game to get the chapter talking.'),
  ('10:30', '11:00', 'fixed', 'The State of the FE at Cleo', 'Joe Angus opens the day with a 30-minute look at where front-end at Cleo is right now — and where it''s heading.'),
  ('11:00', '11:20', 'break', 'Morning Break', 'A 20-minute stretch — legs, mug, repeat.'),
  ('11:20', '11:50', 'talk', 'Talk Slot #1', '30 minutes to go deep on something you love.'),
  ('11:50', '12:20', 'talk', 'Talk Slot #2', '30 minutes — your stage.'),
  ('12:30', '14:00', 'break', 'Lunch', 'Fuel up. 90 minutes to eat, chat and recharge.'),
  ('14:00', '14:30', 'talk', 'Talk Slot #3', '30 minutes to teach us something new.'),
  ('14:30', '14:40', 'lightning', 'Lightning Slot #1', 'A post-lunch energy spark.'),
  ('14:40', '14:50', 'lightning', 'Lightning Slot #2', 'Another quick hit to keep the pace up.'),
  ('14:50', '15:05', 'break', 'Afternoon Break', 'A 15-minute refuel before the lightning run.'),
  ('15:05', '15:15', 'lightning', 'Lightning Slot #3', 'Back-to-back sparks.'),
  ('15:15', '15:25', 'lightning', 'Lightning Slot #4', 'Still going.'),
  ('15:25', '15:35', 'lightning', 'Lightning Slot #5', 'Last spark of the day.'),
  ('15:35', '15:45', 'fixed', 'Closing', 'Wrap-up and thank-yous.'),
  ('18:00', '20:00', 'fixed', 'Social — Bowling @ All Star Lanes', 'Brick Lane, 6–8pm. A game of bowling, 2 drinks each and some nibbles — head over after closing wraps up.')
) as item (start_time, end_time, kind, title, description);
