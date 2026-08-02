# 기술 스택

## 결정 사항

| 영역 | 선택 | 비고 |
|---|---|---|
| 앱 프레임워크 | React Native | 디자인 목업(React/JSX)을 최대한 재사용하기 위함 |
| 지도 | react-native-maps | iOS: Apple MapKit / Android: Google Maps |
| 백엔드/DB | Supabase (PostgreSQL) | 무료 티어 내 운영이 목표. 아래 전략 참고 |
| 이미지 저장 | Supabase Storage | DB에는 경로만 저장, 이미지 자체는 절대 DB에 넣지 않음 |
| 이미지 자동삭제 | Supabase Edge Function (cron) | 30일 경과 이미지 자동 삭제 |
| 인증 | Supabase Auth (소셜 로그인) | 카카오 로그인은 별도 커스텀 연동 필요 (Supabase 기본 미지원) |
| 구독 결제 | RevenueCat + 앱스토어/구글플레이 IAP | 웹 결제 우회 금지(정책 위반 리스크) |
| 푸시 알림 | Firebase Cloud Messaging | Supabase와 별도 서비스, 연동 설정 필요 |

## Supabase 선택 이유
- PostgreSQL(관계형) 기반이라 유저-그룹-인증기록-챌린지-구독 간 복잡한 관계/조인 설계에 유리
- 오픈소스(Apache 2.0), 셀프호스팅 가능 — 벤더 종속 없음
- 프로젝트당 정액 요금제로 비용 예측 가능 (Firebase의 사용량 기반 과금 리스크 회피)

## 무료 티어 한계 및 대응 전략

| 항목 | 무료 한도 | 대응 |
|---|---|---|
| DB 용량 | 500MB (WAL/오버헤드 포함) | 이미지 절대 미저장, 텍스트 메타데이터만 → 사실상 여유 큼 |
| 스토리지 | 1GB | 압축(720p)+30일 삭제 정책으로 동시 활성 유저 약 100~110명까지 커버 추정 |
| 인증 MAU | 50,000명 (초과 시 옵션 없이 Pro 강제 전환) | MVP 단계에선 문제 없음 |
| 프로젝트 개수 | 계정당 2개 | 운영 1개 + 개발 1개로 운용 |
| 자동 백업 | 없음 | GitHub Actions로 주기적 pg_dump → 무료 저장소(private repo/R2)에 백업 |
| 비활성 정지 | 7일간 활동 없으면 자동 휴면 | 실사용자 트래픽이 있으면 문제 없음. 개발/테스트 단계엔 GitHub Actions로 주기적 핑 발송 |

**Pro 플랜($25/월) 전환 시점**: 스토리지가 1GB에 근접하거나(대략 활성 무료 유저 100명 초과), 대역폭 5GB를 초과하거나, 프로젝트가 2개 이상 필요해질 때.

## 데이터 모델 설계 시 참고 (다음 단계)
- users, groups, group_members, posts(인증기록 — sport별 필드 분기 필요), streaks, challenges, challenge_participants, subscriptions 등의 테이블 관계 설계 필요
- posts 테이블은 sport(enum: running/gym/etc) + JSON 또는 별도 컬럼으로 종목별 stats 저장 방식 검토
