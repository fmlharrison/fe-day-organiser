create table if not exists public.talk_feedback (
  submission_id uuid not null references public.talk_submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rating smallint not null check (rating between 1 and 5),
  comments text check (
    comments is null
    or (
      comments <> ''
      and comments = regexp_replace(
        comments,
        '^[[:space:]]+|[[:space:]]+$',
        '',
        'g'
      )
      and char_length(comments) <= 1000
    )
  ),
  primary key (submission_id, reviewer_id)
);

create or replace function public.enforce_talk_feedback_write_constraints()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and (
    new.submission_id is distinct from old.submission_id
    or new.reviewer_id is distinct from old.reviewer_id
  ) then
    raise exception 'talk feedback identity cannot be changed'
      using errcode = 'check_violation';
  end if;

  new.comments := nullif(
    regexp_replace(
      new.comments,
      '^[[:space:]]+|[[:space:]]+$',
      '',
      'g'
    ),
    ''
  );

  return new;
end;
$$;

create trigger enforce_talk_feedback_write_constraints
  before insert or update on public.talk_feedback
  for each row
  execute function public.enforce_talk_feedback_write_constraints();

create index if not exists talk_feedback_reviewer_id_idx
  on public.talk_feedback (reviewer_id);

alter table public.talk_feedback enable row level security;

create policy "reviewers select own feedback" on public.talk_feedback
  for select to authenticated
  using (
    auth.uid() = reviewer_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
  );

create policy "reviewers insert own feedback" on public.talk_feedback
  for insert to authenticated
  with check (
    auth.uid() = reviewer_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
    and exists (
      select 1 from public.agenda_assignments aa
      where aa.submission_id = talk_feedback.submission_id
    )
  );

create policy "reviewers update own feedback" on public.talk_feedback
  for update to authenticated
  using (
    auth.uid() = reviewer_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
    and exists (
      select 1 from public.agenda_assignments aa
      where aa.submission_id = talk_feedback.submission_id
    )
  )
  with check (
    auth.uid() = reviewer_id
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@meetcleo.com'
    and exists (
      select 1 from public.agenda_assignments aa
      where aa.submission_id = talk_feedback.submission_id
    )
  );
