-- Allow any signed-in user to read submission details once a talk is on the agenda.
-- Without this, the agenda_assignments → talk_submissions join returns null for
-- non-organisers (submitters can only select their own rows otherwise).
create policy "authenticated read assigned submissions" on public.talk_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.agenda_assignments aa
      where aa.submission_id = talk_submissions.id
    )
  );
