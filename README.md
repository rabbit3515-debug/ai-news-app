# AI 뉴스 수집 앱

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류해 카드로 보여주는 개인용 웹앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **뉴스 가져오기**: 버튼을 누르면 TechCrunch AI, The Verge AI 피드에서 최근 24시간 기사를 수집합니다. 한 피드가 실패해도 다른 피드는 처리됩니다.
- **번역·요약·분류**: Claude(`claude-haiku-5-5`)가 제목 번역, 내용 요약, 카테고리 분류를 수행합니다.
- **중복 방지**: URL을 정규화해 같은 기사는 한 번만 저장합니다.
- **카테고리 관리·필터**: 카테고리 추가/수정/삭제, 칩 선택으로 필터링(`?category=`).
- **Notion 저장**: 카드의 "Notion 저장" 버튼으로 기사를 Notion 데이터베이스에 저장합니다.
- **로그인**: Clerk 인증. 모든 페이지는 로그인한 사용자만 접근할 수 있는 1인용 앱입니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일 | Tailwind CSS 4 |
| 인증 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Anthropic Claude API |
| 외부 연동 | Notion API, rss-parser |
| 배포 | Vercel |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다. (git에 올라가지 않습니다.)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
DATABASE_URL=            # Neon 연결 문자열
ANTHROPIC_API_KEY=
NOTION_API_TOKEN=        # Notion 통합 토큰
NOTION_DATABASE_ID=      # 저장 대상 Notion 데이터베이스 ID
```

환경 변수를 바꾸면 개발 서버를 재시작해야 합니다. 앱은 1인용이므로 Clerk 대시보드에서 회원가입(sign-up)을 제한하세요.

### 3. 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에 접속하면 로그인 후 `/dashboard`로 이동합니다.

> Windows PowerShell에서 `npm`이 실행 정책으로 막히면 `npm.cmd`를 쓰거나 Git Bash를 사용하세요.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 체크 포함) |
| `npm run start` | 프로덕션 빌드 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` | `src/db/schema.ts`에서 SQL 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션을 Neon DB에 적용 |
| `npm run db:studio` | Drizzle Studio |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ dashboard/    메인 화면, 뉴스 가져오기·Notion 저장 Server Actions
│  ├─ categories/   카테고리 관리 페이지와 Server Actions
│  └─ sign-in/      로그인 페이지
├─ db/              Drizzle 스키마와 DB 클라이언트
├─ lib/             도메인 로직 (articles, categories, rss, url, claude, notion)
└─ proxy.ts         Clerk 인증 미들웨어 (Next 16)
drizzle/            생성된 SQL 마이그레이션
```

## 문서

- [`PRD.md`](./PRD.md): 제품 요구사항 (무엇을 만들지의 기준)
- [`ui.md`](./ui.md): UI 가이드 (디자인 토큰, 레이아웃, 접근성)
- [`CLAUDE.md`](./CLAUDE.md): 코드 작업 시 참고하는 아키텍처와 주의사항

## 사용한 플러그인

- Frontend Design: UI 디자인 품질 향상
- commit-commands: 깃 워크플로 자동화

## 알려진 제한

- 번역에 실패한 기사는 영어 원문 그대로, 카테고리 없이 저장되며 재번역 경로가 아직 없습니다.
- 자동 스케줄 수집은 지원하지 않습니다 (수동 버튼만).
