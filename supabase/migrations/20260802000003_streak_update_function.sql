-- Atomically updates streak after a successful post
-- Call via supabase.rpc('update_streak_on_post') from client after post insert
create or replace function public.update_streak_on_post()
returns void language plpgsql security definer as $$
declare
  v_today date := now() at time zone 'Asia/Seoul';
  v_last  date;
  v_curr  int;
  v_long  int;
begin
  select last_post_date, current_streak, longest_streak
    into v_last, v_curr, v_long
    from public.streaks
   where user_id = auth.uid();

  if v_last = v_today then
    -- Already posted today, nothing to change
    return;
  elsif v_last = v_today - interval '1 day' then
    v_curr := v_curr + 1;
  else
    v_curr := 1;
  end if;

  update public.streaks
     set current_streak  = v_curr,
         longest_streak  = greatest(v_long, v_curr),
         last_post_date  = v_today
   where user_id = auth.uid();
end;
$$;

grant execute on function public.update_streak_on_post() to authenticated;
