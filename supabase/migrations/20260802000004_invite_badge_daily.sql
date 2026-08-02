-- 1. Fix invite code lookup: new users can't read groups before joining (RLS blocks them)
create or replace function public.group_id_by_invite(code text)
returns uuid language sql security definer stable as $$
  select id from public.groups where invite_code = upper(trim(code)) limit 1;
$$;
grant execute on function public.group_id_by_invite(text) to authenticated;
grant execute on function public.group_id_by_invite(text) to anon;

-- 2. One post per user per group per day (KST)
create unique index if not exists posts_one_per_day
  on public.posts (user_id, group_id, ((created_at at time zone 'Asia/Seoul')::date));

-- 3. Auto-award badges after each post
create or replace function public.check_and_award_badges()
returns void language plpgsql security definer as $$
declare
  v_uid       uuid    := auth.uid();
  v_total     int;
  v_streak    int;
  v_run_km    numeric;
  v_gym_count int;
begin
  select count(*)         into v_total     from public.posts   where user_id = v_uid;
  select current_streak   into v_streak    from public.streaks where user_id = v_uid;
  select count(*)         into v_gym_count from public.posts   where user_id = v_uid and sport = 'gym';

  select coalesce(sum(
    case
      when stats->>'distance' ~ '^[0-9]+(\.[0-9]+)?km$'
      then (regexp_replace(stats->>'distance', 'km', ''))::numeric
      else 0
    end
  ), 0)
    into v_run_km
    from public.posts
   where user_id = v_uid and sport = 'running' and stats is not null;

  -- first_post
  if v_total >= 1 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'first_post'
    on conflict do nothing;
  end if;

  -- streak_7 / streak_30
  if v_streak >= 7 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'streak_7'
    on conflict do nothing;
  end if;

  if v_streak >= 30 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'streak_30'
    on conflict do nothing;
  end if;

  -- distance_30 / distance_100
  if v_run_km >= 30 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'distance_30'
    on conflict do nothing;
  end if;

  if v_run_km >= 100 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'distance_100'
    on conflict do nothing;
  end if;

  -- gym_30
  if v_gym_count >= 30 then
    insert into public.user_badges (user_id, badge_id)
    select v_uid, id from public.badges where code = 'gym_30'
    on conflict do nothing;
  end if;
end;
$$;
grant execute on function public.check_and_award_badges() to authenticated;
