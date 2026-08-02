# 데이터 모델 (Supabase / PostgreSQL)

## 핵심 원칙
- 이미지/영상 파일은 Storage에만 저장, DB에는 경로(URL)만 저장
- `posts`는 group_id를 직접 보유 — 그룹별 조회·집계(완주율 기반 마케팅 등)를 join 없이 인덱스로 처리하기 위함
- 종목별(러닝/헬스/기타) 필드 차이는 `stats` jsonb 컬럼으로 유연하게 처리
- 30일 삭제 정책은 만료일 저장 대신 cron이 "작성 후 30일 경과 + 현재 무료 구독 상태"를 매번 체크해서 처리 (구독 상태 변화에도 정합성 유지)

## 테이블

### users
Supabase `auth.users`와 1:1. 추가 프로필 정보만 저장.
- id (uuid, PK, = auth.users.id)
- nickname (text)
- avatar_color (text, hex)
- default_sport (enum: running | gym | etc)
- created_at (timestamptz)

### groups
- id (uuid, PK)
- name (text)
- owner_id (uuid, FK users)
- invite_code (text, unique, 6자리)
- created_at (timestamptz)

### group_members
- group_id (uuid, FK groups)
- user_id (uuid, FK users)
- role (enum: owner | member)
- joined_at (timestamptz)
- PK (group_id, user_id)
- 무료 플랜 인원 제한(5명)은 insert 시 트리거 또는 앱 레이어에서 체크

### posts (인증 기록)
- id (uuid, PK)
- user_id (uuid, FK users)
- group_id (uuid, FK groups, **NOT NULL**) — 인증은 특정 그룹을 대상으로 함
- sport (enum: running | gym | etc)
- photo_url (text)
- video_url (text, nullable — 유료 전용)
- stats (jsonb) — 예: `{"distance":"5.2km","pace":"5'42\""}` / `{"part":"가슴","weight":"60kg","sets":"5set"}` / `{"activity":"요가","duration":"45분"}`
- route (jsonb, nullable) — 러닝 전용, GPS 좌표 배열
- created_at (timestamptz)

> **설계 변경 이력**: 처음엔 "인증 하나가 유저의 모든 그룹에 동시 노출"을 가정해 group_id를 뺐었으나, 실제로는 유저가 여러 그룹(예: 러닝 크루 + 헬스 동호회)에 각각 다른 성격으로 속하는 경우가 자연스럽고, 이미 `sport` 필드로 종목이 구분되므로 "이 인증을 어느 그룹에 올릴지"가 유저 행동과 더 맞아떨어짐. 무료 플랜은 그룹이 1개뿐이라 자동으로 정해짐. group_id를 직접 저장하면 그룹별 조회·집계(완주율 기반 타겟 마케팅 등)가 인덱스 하나로 해결되어 join 비용을 피할 수 있음.
- 인덱스: `posts(group_id, created_at)`, `posts(user_id, created_at)`

### streaks
- user_id (uuid, PK, FK users)
- current_streak (int)
- longest_streak (int)
- last_post_date (date)

### badges / user_badges
- badges: id, code(unique), name
- user_badges: user_id (FK), badge_id (FK), earned_at

### challenge_templates
앱에서 시딩하는 고정 템플릿 (관리자만 수정)
- id (uuid, PK)
- title, desc (text)
- sport (enum)
- unit (text) — km/개/일/회 등
- goal (numeric)
- group_goal (boolean) — 그룹 합산형 여부
- rules (jsonb, text 배열)
- period_days (int, nullable)

### challenges
실제로 그룹에 적용된 챌린지 인스턴스
- id (uuid, PK)
- group_id (uuid, FK groups)
- template_id (uuid, FK challenge_templates, nullable — null이면 커스텀)
- is_custom (boolean)
- title, desc, sport, unit, goal, group_goal (템플릿에서 복사 또는 커스텀 입력값)
- period_start, period_end (timestamptz)
- created_by (uuid, FK users)

### challenge_participants
- challenge_id (uuid, FK challenges)
- user_id (uuid, FK users)
- progress (numeric)
- joined_at (timestamptz)
- PK (challenge_id, user_id)

### subscriptions
- user_id (uuid, PK, FK users)
- status (enum: active | canceled | expired)
- plan (enum: monthly | yearly)
- revenuecat_id (text)
- current_period_end (timestamptz)
- RevenueCat webhook으로 동기화, 클라이언트에서 직접 쓰기 금지 (RLS로 차단)

## RLS(Row Level Security) 핵심 정책
- `posts`, `streaks`: 본인 데이터 또는 같은 그룹 멤버의 데이터만 SELECT 가능
- `group_members`: 그룹 멤버만 SELECT, owner만 DELETE/UPDATE(추방·역할변경)
- `challenges`, `challenge_participants`: 그룹 멤버만 접근 가능
- `subscriptions`: 본인만 SELECT, INSERT/UPDATE는 서버(RevenueCat webhook → Edge Function)만 가능하도록 service role 키로 제한

## 다음에 정할 것
- Edge Function 목록: (1) 30일 이미지 정리 cron, (2) RevenueCat webhook 핸들러, (3) 챌린지 진행률 집계 배치(그룹 합산형)
- 인덱스 설계: `posts(user_id, created_at)`, `group_members(user_id)` 등 조회 패턴 기준으로 추가 필요
