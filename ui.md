# UI 가이드

**AI 뉴스 수집기**의 화면 구성과 스타일 규칙이다. 구현은 Tailwind CSS 4 유틸리티 클래스로 하며, 기능 요구사항은 `PRD.md`를 따른다.

## 1. 디자인 원칙

- **깔끔함**: 장식은 최소화하고 여백과 타이포그래피로 구조를 만든다.
- **읽기 편함**: 본문은 충분한 줄 간격(`leading-relaxed`)과 대비를 확보한다. 한국어 요약이 주인공이다.
- **한 가지 강조색**: 강조색은 인디고 하나만 쓴다. 주요 버튼, 선택된 카테고리, 포커스 링에만 사용한다.
- **일관성**: 모서리 둥글기, 간격, 그림자 단계를 아래 토큰으로 통일한다.
- 라이트/다크 모드를 모두 지원한다(`prefers-color-scheme`, 기존 `globals.css`의 `--background`/`--foreground` 사용).

## 2. 디자인 토큰

| 항목 | 라이트 | 다크 | 클래스 |
| --- | --- | --- | --- |
| 페이지 배경 | `slate-50` | `neutral-950` | `bg-slate-50 dark:bg-neutral-950` |
| 카드/패널 배경 | `white` | `neutral-900` | `bg-white dark:bg-neutral-900` |
| 테두리 | `slate-200` | `neutral-800` | `border-slate-200 dark:border-neutral-800` |
| 본문 텍스트 | `slate-700` | `neutral-300` | `text-slate-700 dark:text-neutral-300` |
| 제목 텍스트 | `slate-900` | `neutral-50` | `text-slate-900 dark:text-neutral-50` |
| 보조 텍스트 | `slate-500` | `neutral-400` | `text-slate-500 dark:text-neutral-400` |
| 강조색 | `indigo-600` | `indigo-400` | `bg-indigo-600 hover:bg-indigo-700` |

- 폰트: `font-sans`(Geist). 한글은 시스템 폰트로 폴백된다.
- 모서리: 카드 `rounded-xl`, 버튼/입력 `rounded-lg`, 칩/배지 `rounded-full`.
- 그림자: 카드 기본 `shadow-sm`, 호버 시 `hover:shadow-md`. 그 외에는 그림자를 쓰지 않는다.
- 전환: 색/그림자 변화는 `transition` (기본 150ms).
- 포커스: 모든 상호작용 요소에 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`.

## 3. 타이포그래피

| 용도 | 클래스 |
| --- | --- |
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug` (최대 2줄, `line-clamp-2`) |
| 카드 요약 | `text-sm leading-relaxed` (최대 4줄, `line-clamp-4`) |
| 메타 정보(출처·날짜) | `text-xs text-slate-500` |
| 카테고리 칩 | `text-sm font-medium` |

## 4. 레이아웃

메인(`/`)은 한 컬럼 구조이며 위에서 아래로 헤더 → 툴바(카테고리) → 카드 그리드 순이다.

```
┌──────────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                    [뉴스 가져오기] [사용자] │  헤더 (sticky)
├──────────────────────────────────────────────────────────┤
│  (전체) (모델/연구) (제품/서비스) (기업/투자) … (+ 추가)   │  카테고리 칩 줄
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │  카드   │  │  카드   │  │  카드   │                   │  카드 그리드
│  └─────────┘  └─────────┘  └─────────┘                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │  카드   │  │  카드   │  │  카드   │                   │
│  └─────────┘  └─────────┘  └─────────┘                   │
└──────────────────────────────────────────────────────────┘
```

- 페이지 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 페이지 배경: `bg-slate-50 dark:bg-neutral-950`, 본문 영역 `py-6 sm:py-8`
- 헤더와 카테고리 줄 사이 간격 `gap-6`, 카테고리 줄과 카드 그리드 사이 `mt-6`.

## 5. 컴포넌트

### 5.1 헤더

```tsx
<header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
  <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-50">
      AI 뉴스 수집기
    </h1>
    <div className="flex items-center gap-3">
      {/* 뉴스 가져오기 버튼, Clerk UserButton */}
    </div>
  </div>
</header>
```

- 앱 이름은 `AI 뉴스 수집기`로 표기한다(`metadata.title`도 이에 맞춘다).
- 우측에 **뉴스 가져오기** 주요 버튼과 Clerk `UserButton`을 둔다.

### 5.2 버튼

| 종류 | 용도 | 클래스 |
| --- | --- | --- |
| 주요 | 뉴스 가져오기 | `inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50` |
| 보조 | Notion 저장, 취소 | `inline-flex h-8 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800` |
| 텍스트 | 원문 보기 | `text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400` |

- 가져오는 동안 주요 버튼은 `disabled` 처리하고 스피너(`animate-spin`)와 `가져오는 중…` 문구를 보여준다.
- 저장 완료 후 Notion 저장 버튼은 `저장됨`으로 바뀌고 비활성화한다.

### 5.3 카테고리 칩 줄

카드 목록 **바로 위**에 가로로 나열한다. 줄 맨 앞은 `전체`, **맨 끝은 `+ 카테고리 추가` 버튼**이다.

```tsx
<nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
  {/* 전체 + 카테고리 칩들 */}
  <button className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white">
    전체
  </button>
  <button className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
    모델/연구
  </button>
  {/* … */}
  <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400">
    <span aria-hidden>+</span> 카테고리 추가
  </button>
</nav>
```

- **선택됨**: 채워진 인디고(`bg-indigo-600 text-white`), `aria-pressed="true"`.
- **선택 안 됨**: 흰 배경 + 얇은 테두리.
- **카테고리 추가 버튼**: 점선 테두리로 칩과 구분하며, 항상 줄의 마지막에 위치한다. 클릭하면 이름을 입력하는 인라인 입력 칩(또는 작은 모달)이 열리고, Enter로 저장·Esc로 취소한다.
- 모바일에서 칩이 많으면 줄바꿈(`flex-wrap`)한다. 한 줄 스크롤이 필요하면 `overflow-x-auto`로 바꾸되 스크롤바는 숨긴다.
- 칩에 뉴스 개수를 보조로 표시할 수 있다: `<span className="ml-1.5 text-xs opacity-70">12</span>`.
- 이름 수정·삭제는 `/categories` 페이지에서 한다(칩 줄에는 넣지 않아 깔끔하게 유지).

### 5.4 뉴스 카드

```tsx
<article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
  <div className="flex items-center justify-between gap-2">
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
      모델/연구
    </span>
    <time className="text-xs text-slate-500 dark:text-neutral-400">2026.11.10</time>
  </div>

  <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-neutral-50">
    한국어 제목
  </h2>
  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
    한국어 요약
  </p>

  <div className="mt-auto flex items-center justify-between pt-4">
    <span className="text-xs text-slate-500 dark:text-neutral-400">TechCrunch · The Verge</span>
    <div className="flex items-center gap-2">
      <a className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">원문 보기</a>
      <button>Notion 저장</button>
    </div>
  </div>
</article>
```

- 구성 순서: 카테고리 배지 + 발행일 → 제목 → 요약 → 하단(출처 / 원문 보기 / Notion 저장).
- 하단 영역은 `mt-auto`로 카드 바닥에 고정해, 요약 길이가 달라도 카드 높이가 정렬되게 한다.
- 같은 사건을 다룬 여러 출처는 하단 출처 영역에 모두 표기한다(예: `TechCrunch · The Verge`), 각 출처는 원문으로 연결되는 링크다.
- 미분류 기사는 배지를 회색(`bg-slate-100 text-slate-600`)으로 `미분류`라고 표시한다.
- 원문 링크는 `target="_blank" rel="noopener noreferrer"`.

### 5.5 카드 그리드

```tsx
<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

- 모바일 1열 → 태블릿(`sm`) 2열 → 데스크톱(`lg`) 3열.
- 카드 간격은 `gap-4`(모바일)~`gap-6`(`lg`)로 한다.

### 5.6 상태 화면

| 상태 | 표현 |
| --- | --- |
| 로딩(가져오기 중) | 카드 모양 스켈레톤(`animate-pulse`, `bg-slate-200 dark:bg-neutral-800`) 6장 |
| 빈 목록 | 중앙 정렬 안내문 `아직 수집된 뉴스가 없어요. 위의 '뉴스 가져오기'를 눌러 보세요.` (`text-sm text-slate-500`, `py-20`) |
| 필터 결과 없음 | `이 카테고리에는 뉴스가 없어요.` |
| 오류 | 카드 목록 위에 `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` 배너(다크: `dark:border-red-900 dark:bg-red-950 dark:text-red-300`) |
| 완료 알림 | `N건의 새 뉴스를 가져왔어요.` 같은 짧은 토스트 또는 배너 |

## 6. 반응형

| 구간 | 브레이크포인트 | 그리드 | 비고 |
| --- | --- | --- | --- |
| 모바일 | 기본 | 1열 | 헤더에서 버튼 텍스트 유지, 칩은 줄바꿈 |
| 태블릿 | `sm` (640px) | 2열 | 컨테이너 좌우 패딩 `px-6` |
| 데스크톱 | `lg` (1024px) | 3열 | 컨테이너 `max-w-6xl` |

## 7. 접근성

- 텍스트 대비는 WCAG AA(4.5:1) 이상을 유지한다. 보조 텍스트도 `slate-500` 이상으로 어둡게 쓴다.
- 칩 선택 상태는 색만으로 구분하지 않고 `aria-pressed`로도 전달한다.
- 아이콘만 있는 버튼에는 `aria-label`을 단다.
- 키보드 탐색 순서가 시각 순서와 같아야 하며, 포커스 링을 제거하지 않는다.
- 로딩/완료 알림 영역은 `aria-live="polite"`로 스크린리더에 알린다.

## 8. 구현 메모

- 이 앱은 Next.js 16 `cacheComponents`를 쓰므로, DB나 `auth()`를 읽는 목록은 `<Suspense>` 안에 두고 `fallback`에 위 스켈레톤을 넣는다.
- 상호작용(칩 선택, 카테고리 추가 입력)이 있는 부분만 클라이언트 컴포넌트(`"use client"`)로 분리하고, 카드 렌더링은 서버 컴포넌트로 유지한다.
- 카테고리 필터는 URL 쿼리(`/?category=<id>`)로 표현해 새로고침·공유 시에도 유지되게 한다.
- 컬러·간격은 이 문서의 토큰을 그대로 쓰고, 새 값이 필요하면 먼저 이 문서를 갱신한다.
