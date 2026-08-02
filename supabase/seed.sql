-- Badges
insert into public.badges (code, name) values
  ('first_post', '첫 인증'),
  ('streak_7', '7일 연속'),
  ('streak_30', '30일 연속'),
  ('distance_30', '30km 달성'),
  ('distance_100', '100km 달성'),
  ('gym_30', '헬스 30회'),
  ('challenge_complete', '챌린지 완료')
on conflict (code) do nothing;

-- Challenge templates
insert into public.challenge_templates (title, description, sport, unit, goal, group_goal, rules, period_days) values
(
  '이번 주 30km 채우기',
  '월요일부터 일요일까지, 그룹원 모두 합쳐 30km를 채워보세요.',
  'running', 'km', 30, true,
  '["매일 인증한 거리가 자동으로 합산돼요", "그룹 전체 합산 30km를 넘기면 전원 배지 획득", "인증하지 않은 날은 0km로 집계"]',
  7
),
(
  '이번 주 스쿼트 500개',
  '7일 안에 그룹원 합산 스쿼트 500개 달성해요.',
  'gym', '개', 500, true,
  '["세트 수와 무게 상관없이 총 개수로 합산", "인증 시 스쿼트 개수 입력 필수", "7일 내 달성 시 전원 배지"]',
  7
),
(
  '미라클모닝 5일 연속',
  '오전 8시 이전 인증을 5일 연속으로 달성하세요.',
  'etc', '일', 5, false,
  '["오전 8시 이전 업로드한 인증만 카운트", "연속으로 5일을 채워야 배지 획득", "하루라도 빠지면 초기화"]',
  14
),
(
  '100km 완주',
  '한 달 동안 개인 누적 100km를 채워보세요.',
  'running', 'km', 100, false,
  '["매일 인증한 거리 자동 합산", "한 달 내 100km 달성 시 배지", "걷기·러닝 모두 포함"]',
  30
);
