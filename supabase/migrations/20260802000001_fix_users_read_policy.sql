-- Allow group members to read each other's profile info
-- Required for feed to show nicknames/avatar colors of group members
drop policy if exists "users: self read" on public.users;

create policy "users: self or group member read" on public.users
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
        and gm2.user_id = users.id
    )
  );
