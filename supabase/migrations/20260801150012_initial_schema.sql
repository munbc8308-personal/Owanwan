-- Enums
create type sport_type as enum ('running', 'gym', 'etc');
create type member_role as enum ('owner', 'member');
create type subscription_status as enum ('active', 'canceled', 'expired');
create type subscription_plan as enum ('monthly', 'yearly');

-- users: 1:1 with auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_color text not null default '#D7FF3F',
  default_sport sport_type not null default 'running',
  created_at timestamptz not null default now()
);

-- groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- group_members
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- posts (인증 기록)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  sport sport_type not null,
  photo_url text,
  video_url text,
  stats jsonb,
  route jsonb,
  created_at timestamptz not null default now()
);

create index posts_group_created on public.posts(group_id, created_at desc);
create index posts_user_created on public.posts(user_id, created_at desc);

-- streaks
create table public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_post_date date
);

-- badges
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table public.user_badges (
  user_id uuid not null references public.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- challenge_templates
create table public.challenge_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sport sport_type not null,
  unit text not null,
  goal numeric not null,
  group_goal boolean not null default false,
  rules jsonb not null default '[]',
  period_days int
);

-- challenges (그룹에 적용된 인스턴스)
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  template_id uuid references public.challenge_templates(id),
  is_custom boolean not null default false,
  title text not null,
  description text,
  sport sport_type not null,
  unit text not null,
  goal numeric not null,
  group_goal boolean not null default false,
  rules jsonb not null default '[]',
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_by uuid not null references public.users(id)
);

-- challenge_participants
create table public.challenge_participants (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  progress numeric not null default 0,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- subscriptions (RevenueCat webhook만 쓸 수 있음)
create table public.subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  status subscription_status not null default 'expired',
  plan subscription_plan,
  revenuecat_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ================================================================
-- RLS
-- ================================================================
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.posts enable row level security;
alter table public.streaks enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.challenge_templates enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.subscriptions enable row level security;

-- Helper: 현재 유저가 해당 그룹 멤버인지
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- users
create policy "users: self read" on public.users for select using (id = auth.uid());
create policy "users: self insert" on public.users for insert with check (id = auth.uid());
create policy "users: self update" on public.users for update using (id = auth.uid());

-- groups
create policy "groups: member read" on public.groups for select using (is_group_member(id));
create policy "groups: auth insert" on public.groups for insert with check (auth.uid() is not null);
create policy "groups: owner update" on public.groups for update using (owner_id = auth.uid());
create policy "groups: owner delete" on public.groups for delete using (owner_id = auth.uid());

-- group_members
create policy "group_members: member read" on public.group_members for select using (is_group_member(group_id));
create policy "group_members: self insert" on public.group_members for insert with check (user_id = auth.uid());
create policy "group_members: self or owner delete" on public.group_members for delete using (
  auth.uid() = user_id or
  exists (select 1 from public.groups where id = group_id and owner_id = auth.uid())
);

-- posts
create policy "posts: group member read" on public.posts for select using (is_group_member(group_id));
create policy "posts: self insert" on public.posts for insert with check (user_id = auth.uid());
create policy "posts: self delete" on public.posts for delete using (user_id = auth.uid());

-- streaks
create policy "streaks: group member read" on public.streaks for select using (
  user_id = auth.uid() or
  exists (
    select 1 from public.group_members gm1
    join public.group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid() and gm2.user_id = streaks.user_id
  )
);
create policy "streaks: self insert" on public.streaks for insert with check (user_id = auth.uid());
create policy "streaks: self update" on public.streaks for update using (user_id = auth.uid());

-- badges (공개 읽기)
create policy "badges: public read" on public.badges for select using (true);

-- user_badges
create policy "user_badges: self read" on public.user_badges for select using (user_id = auth.uid());
create policy "user_badges: self insert" on public.user_badges for insert with check (user_id = auth.uid());

-- challenge_templates (공개 읽기)
create policy "templates: public read" on public.challenge_templates for select using (true);

-- challenges
create policy "challenges: group member read" on public.challenges for select using (is_group_member(group_id));
create policy "challenges: group member insert" on public.challenges for insert with check (is_group_member(group_id));
create policy "challenges: creator update" on public.challenges for update using (created_by = auth.uid());
create policy "challenges: creator delete" on public.challenges for delete using (created_by = auth.uid());

-- challenge_participants
create policy "challenge_participants: group member read" on public.challenge_participants for select using (
  exists (select 1 from public.challenges c where c.id = challenge_id and is_group_member(c.group_id))
);
create policy "challenge_participants: self insert" on public.challenge_participants for insert with check (user_id = auth.uid());
create policy "challenge_participants: self delete" on public.challenge_participants for delete using (user_id = auth.uid());

-- subscriptions: 본인 읽기만, 쓰기는 service role만
create policy "subscriptions: self read" on public.subscriptions for select using (user_id = auth.uid());

-- ================================================================
-- auth.users insert 시 users + streaks 자동 생성
-- ================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, nickname, avatar_color)
  values (new.id, '', '#D7FF3F')
  on conflict do nothing;

  insert into public.streaks (user_id)
  values (new.id)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- Grants for authenticated role (required since auto_expose_new_tables is off)
-- ================================================================
grant usage on schema public to authenticated;

grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;
grant select, insert, delete on public.posts to authenticated;
grant select, insert, update on public.streaks to authenticated;
grant select on public.badges to authenticated;
grant select, insert on public.user_badges to authenticated;
grant select on public.challenge_templates to authenticated;
grant select, insert, update, delete on public.challenges to authenticated;
grant select, insert, delete on public.challenge_participants to authenticated;
grant select on public.subscriptions to authenticated;

-- anon role: only challenge_templates and badges are public
grant usage on schema public to anon;
grant select on public.challenge_templates to anon;
grant select on public.badges to anon;
