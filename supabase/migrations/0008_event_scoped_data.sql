-- Scope pitches, agenda assignments and RSVPs to an event. Everything that
-- exists today belongs to the July 2026 event seeded in 0006.

-- talk_submissions ---------------------------------------------------------

alter table public.talk_submissions
  add column event_id uuid references public.events(id) on delete cascade;

update public.talk_submissions
set event_id = (select id from public.events where slug = 'july-2026');

alter table public.talk_submissions
  alter column event_id set not null,
  -- Target for the (submission_id, event_id) composite FK on agenda_assignments.
  add constraint talk_submissions_id_event_id_key unique (id, event_id);

create index if not exists talk_submissions_event_id_idx
  on public.talk_submissions (event_id);

-- agenda_assignments -------------------------------------------------------

alter table public.agenda_assignments add column event_id uuid;

update public.agenda_assignments aa
set event_id = ai.event_id
from public.agenda_items ai
where ai.id = aa.agenda_item_id;

alter table public.agenda_assignments alter column event_id set not null;

-- Replace the single-column FKs with composite ones, so the database
-- guarantees a talk only ever fills a slot in its own event. Keeping one FK
-- per parent table also keeps PostgREST's talk_submissions embed unambiguous.
alter table public.agenda_assignments
  drop constraint agenda_assignments_agenda_item_id_fkey,
  drop constraint agenda_assignments_submission_id_fkey,
  add constraint agenda_assignments_agenda_item_event_fkey
    foreign key (agenda_item_id, event_id)
    references public.agenda_items(id, event_id) on delete restrict,
  add constraint agenda_assignments_submission_event_fkey
    foreign key (submission_id, event_id)
    references public.talk_submissions(id, event_id) on delete cascade;

create index if not exists agenda_assignments_event_id_idx
  on public.agenda_assignments (event_id);

-- event_attendance ---------------------------------------------------------

alter table public.event_attendance
  add column event_id uuid references public.events(id) on delete cascade;

update public.event_attendance
set event_id = (select id from public.events where slug = 'july-2026');

-- One RSVP per user per event, rather than one per user overall.
alter table public.event_attendance
  alter column event_id set not null,
  drop constraint event_attendance_pkey,
  add constraint event_attendance_pkey primary key (event_id, user_id);

create index if not exists event_attendance_user_id_idx
  on public.event_attendance (user_id);
