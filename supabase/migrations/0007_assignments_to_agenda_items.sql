-- Point agenda assignments at agenda_items rows instead of the hardcoded text
-- slot ids ('talk-1', 'lightning-3', ...) that lived in src/lib/feday-data.ts.
--
-- Pre-flight: `select slot_id, count(*) from agenda_assignments group by 1;`
-- Every slot_id must be one of the open July slots below. Assignments on the
-- retired 'talk-4' / 'workshop-1' slots have no agenda item, so this migration
-- aborts rather than silently dropping them.

alter table public.agenda_assignments add column agenda_item_id uuid;

with legacy_slots (slot_id, kind, start_time) as (
  values
    ('talk-1', 'talk', '11:20'),
    ('talk-2', 'talk', '11:50'),
    ('talk-3', 'talk', '14:00'),
    ('lightning-1', 'lightning', '14:30'),
    ('lightning-2', 'lightning', '14:40'),
    ('lightning-3', 'lightning', '15:05'),
    ('lightning-4', 'lightning', '15:15'),
    ('lightning-5', 'lightning', '15:25')
)
update public.agenda_assignments aa
set agenda_item_id = ai.id
from legacy_slots ls
join public.agenda_items ai
  on ai.kind = ls.kind and ai.start_time = ls.start_time::time
join public.events e
  on e.id = ai.event_id and e.slug = 'july-2026'
where aa.slot_id = ls.slot_id;

do $$
declare
  unmapped text;
begin
  select string_agg(distinct slot_id, ', ') into unmapped
  from public.agenda_assignments
  where agenda_item_id is null;

  if unmapped is not null then
    raise exception 'agenda_assignments has slot ids with no July agenda item: %', unmapped;
  end if;
end $$;

-- Dropping slot_id also drops the primary key that was defined on it.
alter table public.agenda_assignments drop column slot_id;

alter table public.agenda_assignments
  alter column agenda_item_id set not null,
  add constraint agenda_assignments_pkey primary key (agenda_item_id),
  -- Restrict: an agenda item with a talk in it can't be deleted, so
  -- assignments can never point at a slot that's gone.
  add constraint agenda_assignments_agenda_item_id_fkey
    foreign key (agenda_item_id) references public.agenda_items(id) on delete restrict;

-- The landing page shows the current event before sign-in.
create policy "anon read events" on public.events
  for select to anon
  using (true);
