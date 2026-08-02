# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Owanwan — 운동 인증 소셜 앱

친구와 함께 매일 한 번, 꾸민 것 없이 운동을 인증하는 소셜 앱.
"가공 없는 진정성"이 핵심 컨셉 — 필터 대신 정직한 인증 스탬프.

무료로 핵심 소셜 루프 전부 제공, 파워유저 기능만 구독(월 1,500원 / 연 15,000원)으로 유료화.

## 현재 상태

핵심 소셜 루프 전체 구현 완료. 현재:
- 온보딩 6단계 → Supabase Auth signUp → users/groups/group_members 실제 저장
- 이메일 형식 유효성 검사 (정규식), 비밀번호 6자 이상 검사
- 로그인 화면 (`/(onboarding)/signin`) 구현
- 피드 화면: Supabase `posts` DB 실시간 조회 (오늘 인증 목록, pull-to-refresh)
- 이미지 업로드: expo-image-picker + expo-image-manipulator (720p 리사이즈) + Supabase Storage `posts` 버킷
- 운동 통계 입력 (러닝/헬스/기타) → `posts.stats` jsonb 저장
- 마이페이지: Supabase DB 연결 (실제 닉네임/아바타/스트릭/배지), 설정 저장, 로그아웃
- 스트릭: post 업로드 후 `update_streak_on_post()` RPC 자동 호출 (연속/최고 기록)
- 챌린지: Supabase DB 연결 (challenge_templates 조회, challenges/participants INSERT/DELETE), 참여/취소 실제 동작
- 랭킹: 이번 주(월~일) 그룹 내 인증 횟수 집계 · 내 항목 하이라이트, 전체 랭킹은 구독 잠금
- 하루 1회 인증 중복 방지: DB 유니크 인덱스 + 클라이언트 사전 체크 + 23505 에러 처리 + UI 배너
- 배지 자동 지급: `check_and_award_badges()` RPC (post 성공 후 자동 호출)
- 초대코드 클립보드 복사: expo-clipboard, 복사 후 2초간 "복사됨!" 피드백
- 그룹 나가기/삭제: Alert 확인 다이얼로그 + DB DELETE + 피드 자동 갱신
- 초대코드로 그룹 참여 RLS 버그 수정: `group_id_by_invite` SECURITY DEFINER 함수

---

## 개발 명령어

```bash
npx expo start --web --port 19006   # 웹 개발 서버
npx expo run:ios                     # iOS 빌드 (Xcode 필요)
npx expo run:android                 # Android 빌드
npm install <pkg> --legacy-peer-deps # 패키지 설치 (peer deps 충돌 때문에 --legacy-peer-deps 필수)
npx expo prebuild --clean            # 네이티브 폴더 재생성 (app.json name 변경 등 이후 필요)
```

Supabase 로컬:
```bash
supabase start          # 로컬 Supabase 인스턴스 (Docker 필요)
supabase stop           # 중지
supabase db reset       # 마이그레이션 + 시드 재적용
supabase gen types typescript --local | tail -n +2 > types/database.ts  # 타입 재생성 (첫 줄 제거 포함)
# multi-statement SQL 실행 방법 (supabase db query는 단일 쿼리만 지원):
docker cp file.sql supabase_db_owanwan:/tmp/file.sql && docker exec supabase_db_owanwan psql -U postgres -d postgres -f /tmp/file.sql
```

로컬 Supabase 접속 정보 (`.env.local`):
- API URL: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- ANON_KEY: `.env.local` 참조

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 앱 | React Native (Expo SDK 57) + Expo Router (파일 기반 라우팅) |
| 스타일 | 순수 StyleSheet/inline style (NativeWind 제거 — Expo 57 Metro 비호환) |
| 아이콘 | lucide-react-native |
| 폰트 | @expo-google-fonts (BebasNeue, Manrope, JetBrainsMono) |
| 애니메이션 | react-native-reanimated v4 + react-native-worklets@0.10.x (버전 고정) |
| SVG | react-native-svg |
| 백엔드/DB | Supabase (PostgreSQL) |
| 이미지 저장 | Supabase Storage (DB에는 경로만) |
| 인증 | Supabase Auth (이메일/비밀번호, 추후 카카오 추가) |
| 세션 저장 | expo-secure-store (native) / localStorage (web) |
| 클립보드 | expo-clipboard |
| 구독 결제 | RevenueCat + 앱스토어/구글플레이 IAP |
| 푸시 알림 | Firebase Cloud Messaging |

---

## 파일 구조

```
app/
  _layout.tsx          # Root layout: AuthProvider, 세션→탭 보호 (useEffect)
  index.tsx            # 세션 기반 초기 라우팅 가드 (Redirect)
  (onboarding)/
    _layout.tsx
    index.tsx          # 6단계 온보딩 (프로필→스포츠→그룹→이메일/PW→완료)
    signin.tsx         # 로그인 화면
  (tabs)/
    _layout.tsx        # Tabs + CustomTabBar + UploadModal 상태
    feed.tsx           # 그룹 피드 (Supabase DB 연결, pull-to-refresh)
    challenge.tsx      # 챌린지 목록 (DB 연결)
    ranking.tsx        # 랭킹 (그룹 내 무료, 전체 유료 잠금)
    mypage.tsx         # 스트릭, 배지, 설정 (DB 연결)

components/
  ui/
    BibCard.tsx        # 좌우 원형 노치 배번호표 카드
    PostageStamp.tsx   # 이중 붉은 테두리 우표 (선택적 spring 애니메이션)
    RouteMap.tsx       # react-native-svg 경로 지도
  modals/
    UploadModal.tsx          # 인증 업로드 (full-screen Modal)
    GroupsOverlay.tsx        # 그룹 목록/상세/초대코드/나가기·삭제
    SettingsOverlay.tsx      # 프로필 편집, 알림, 계정
    SubscribeOverlay.tsx     # 구독 플랜 선택/결제
    ChallengeDetailOverlay.tsx
    TemplatePickerOverlay.tsx

constants/
  theme.ts   # COLOR, AVATAR_COLORS, SPORT_LABEL, Sport 타입
  stamp.ts   # stampText() 유틸리티

lib/
  supabase.ts  # Supabase 클라이언트 싱글턴 (platform별 storage 분기)
  auth.tsx     # AuthProvider, useAuth hook

types/
  index.ts      # 앱 전용 인터페이스 (FeedEntry, Group, Challenge 등)
  database.ts   # supabase gen types로 자동 생성 (직접 수정 금지)

supabase/
  config.toml
  migrations/
    20260801150012_initial_schema.sql       # 전체 스키마 + RLS + GRANT
    20260802000001_fix_users_read_policy.sql # users: self or group member read
    20260802000003_streak_update_function.sql # update_streak_on_post() SECURITY DEFINER
    20260802000004_invite_badge_daily.sql   # group_id_by_invite() + posts_one_per_day 인덱스 + check_and_award_badges()
  seed.sql      # 챌린지 템플릿 4개, 배지 7개
```

---

## 아키텍처 핵심

### 라우팅 흐름
```
app/index.tsx
  └─ 세션 없음 → /(onboarding)
  └─ 세션 있음 → /(tabs)/feed

app/_layout.tsx useEffect
  └─ 세션 없음 + inTabs → / (index로 되돌림)
  ※ onboarding→tabs 자동 redirect 없음 (signup 플로우가 직접 navigate)
```

### 온보딩 → Supabase 연동 흐름
1. Step 0–3: 닉네임/아바타/스포츠/그룹정보 수집 (로컬 state)
2. Step 4: `supabase.auth.signUp()` → `setSession()` 명시 호출 → `users` UPDATE → `groups` INSERT (client-side UUID) → `group_members` INSERT
3. Step 5: 완료 화면 → "시작하기" → `router.replace("/(tabs)/feed")`

**주의**: `groups` INSERT 후 `.select("id")`를 쓰면 RLS SELECT 거부 (아직 group_members 없음). 반드시 `generateUUID()`로 client-side ID 생성 후 SELECT 없이 사용.

**주의**: `crypto.randomUUID()`는 iOS Hermes에서 동작 안 함. 반드시 파일 내 `generateUUID()` (Math.random 기반 UUID v4) 사용. UploadModal, 온보딩 모두 적용됨.

### Supabase RLS + GRANT
- `auto_expose_new_tables`가 비활성화 상태 → migration에 명시적 `GRANT` 필요
- `authenticated` role: users/groups/group_members/posts 등 읽기/쓰기
- `anon` role: challenge_templates/badges만 SELECT
- `subscriptions` 쓰기: service role 전용 (클라이언트 직접 불가)
- RLS helper: `is_group_member(group_id uuid)` — 그룹 멤버 여부 체크
- `group_id_by_invite(code text)` — SECURITY DEFINER로 RLS 우회해 초대코드로 group_id 조회
- `update_streak_on_post()` — SECURITY DEFINER, post INSERT 후 호출
- `check_and_award_badges()` — SECURITY DEFINER, post INSERT 후 호출

### SafeAreaView 규칙
- 모든 full-screen Modal 내 `SafeAreaView`는 반드시 `flex: 1` 포함
- 헤더 `<View>`는 반드시 `flexDirection: "row"`, `alignItems: "center"`, `paddingHorizontal: 20`, `paddingVertical: 16` 포함
- X/ChevronLeft 버튼에 `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` 추가 (Dynamic Island 터치 영역 확보)

### 스타일 규칙
- NativeWind 없음. 모든 스타일은 `StyleSheet.create()` 또는 인라인 객체
- 색상은 반드시 `COLOR.*` (constants/theme.ts) 사용
- 폰트 변수명: `FONT_DISPLAY = "BebasNeue_400Regular"`, `FONT_BODY = "Manrope_400Regular"` 등 파일마다 선언

---

## posts 설계 핵심

- `group_id` 직접 보유 (join 없는 인덱스 조회)
- `sport` enum: `running | gym | etc`
- `stats` jsonb 종목별:
  - 러닝: `{"distance":"5.2km","pace":"5'42\""}`
  - 헬스: `{"part":"가슴","weight":"60kg","sets":"5set"}`
  - 기타: `{"activity":"요가","duration":"45분"}`
- `route` jsonb (러닝 전용, GPS 좌표 배열)
- 인덱스: `posts(group_id, created_at)`, `posts(user_id, created_at)`
- 유니크 인덱스 `posts_one_per_day`: `(user_id, group_id, (created_at at time zone 'Asia/Seoul')::date)` — 하루 1회 강제

---

## 알려진 의존성 이슈

| 패키지 | 버전 | 이유 |
|---|---|---|
| react-native-worklets | 0.10.x | reanimated v4.5.1과 호환 (0.11.x 비호환) |
| react-dom | react와 동일 버전 고정 | web 렌더링 오류 방지 |
| NativeWind | **미사용** | Expo 57 Metro API 비호환 (`transformFile` undefined) |
| tailwindcss | **미사용** | NativeWind 제거와 함께 삭제 |
| crypto.randomUUID() | **미사용** | iOS Hermes 미지원 — `generateUUID()` 사용 (각 파일 내 정의) |

---

## 핵심 원칙 (변경 시 반드시 확인)

1. **핵심 소셜 루프는 무조건 무료**: 인증 업로드, 친구 그룹(5명), 그룹 내 랭킹, 스트릭, 템플릿 챌린지 참여.
2. **광고 없음** — 어떤 경우에도 광고 SDK 도입 금지.
3. **서버비 절감 최우선** — 이미지 정책(하루 1회, 720p 압축, 30일 자동삭제, 영상은 유료 전용) 임의 완화 금지. Supabase 무료 티어 스토리지 1GB 한도.
4. **`posts.group_id` 직접 보유** — join 없는 인덱스 조회를 위한 결정. 임의로 되돌리지 말 것.
5. **지도는 react-native-maps** — 현재 RouteMap.tsx는 SVG 임시 구현. 실제 GPS 경로는 react-native-maps로 교체.
6. **RevenueCat으로만 결제** — 웹 결제 우회 금지 (앱스토어 정책 위반).

---

## 문서 구조

- `docs/product-spec.md` — 타겟, 핵심 컨셉, 무료/유료 기능 경계, MVP 범위
- `docs/design-system.md` — 컬러/타이포/톤앤매너, 시그니처 UI 모티프
- `docs/screens.md` — 화면별 목적과 상태 (목업과 1:1 대응)
- `docs/tech-stack.md` — 기술 스택 결정 및 Supabase 무료 티어 전략
- `docs/data-model.md` — 테이블 구조, RLS 정책, Edge Function 목록
- `design-reference/app-mockup.jsx` — 인터랙션 가능한 React 목업 (구현 1차 참고)
