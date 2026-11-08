# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

`PRD.md` (Korean) is the source of truth for what to build: a single-user AI-news app that collects RSS feeds (TechCrunch AI, The Verge AI) on a button click, has Claude translate/summarize/categorize to Korean, shows cards with category filtering, and saves chosen articles to a Notion database. Read `PRD.md` before implementing a feature; its section 12 gives the build order. Stack: Clerk (auth), Neon + Drizzle ORM (DB), Claude API, Notion MCP server, deployed on Vercel.

Progress against PRD section 12:
- Done: 1 (Next.js + Clerk), 2 (Neon + Drizzle schema, migration applied), 3 (category CRUD with default-category seeding).
- Next: 4 (RSS fetch, URL dedupe, Claude translate/summarize/categorize; needs `ANTHROPIC_API_KEY` in `.env.local`), then 5 (card UI + category filter + "원문 보기" link), 6 (Notion MCP save), 7 (polish).
- The home page (`src/app/page.tsx`) is still a placeholder showing only the login state and a link to `/categories`.

## Commands

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build (also runs TypeScript type check)
npm run start        # serve the production build
npm run lint         # eslint (flat config: eslint.config.mjs)
npm run db:generate  # generate a SQL migration from src/db/schema.ts into drizzle/
npm run db:migrate   # apply migrations to the Neon database in DATABASE_URL
npm run db:studio    # Drizzle Studio
```

No test runner is configured yet. On Windows PowerShell, `npm` may be blocked by the execution policy; use `npm.cmd` or Git Bash.

## Environment

Secrets live in `.env.local` (git-ignored): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `DATABASE_URL` (Neon). Planned: `ANTHROPIC_API_KEY`, plus Notion connection info and the target database ID. Env changes need a dev-server restart. `drizzle.config.ts` loads `.env.local` through `@next/env` because drizzle-kit does not read it by itself.

## Architecture

- **Auth**: `src/proxy.ts` (Next 16's replacement for `middleware.ts`) runs `clerkMiddleware` and calls `auth.protect()` on everything except `/sign-in(.*)`. There is no sign-up page because the app is single-user (sign-ups should be restricted in the Clerk dashboard). `ClerkProvider` is wrapped in `<Suspense>` in `src/app/layout.tsx`; with `cacheComponents`, client hooks like `usePathname` fail the build otherwise.
- **Data layer**: `src/db/schema.ts` defines `categories`, `articles` and `article_sources`; `src/db/index.ts` exports the `db` client (Neon HTTP driver) and throws at import time if `DATABASE_URL` is missing. Every row is scoped by Clerk `userId`.
  - `articles` is unique on `(userId, link)`, where `link` must be the normalized URL; this is the dedupe guarantee.
  - Deleting a category sets `articles.category_id` to null (the "미분류" state); deleting an article cascades to `article_sources`.
  - `article_sources` holds extra sources for the same story so one card can list all of them.
- **Domain logic** goes in `src/lib/` (currently `categories.ts`: list/create/update/delete, seeds the six default categories on first list). Mutations are Server Actions in the route folder (`src/app/categories/actions.ts`), and each action re-checks auth with `auth()` itself because Server Actions are reachable by direct POST.
- **Pages that read the DB or `auth()`** must keep that work inside a `<Suspense>` boundary (see `CategoryList` in `src/app/categories/page.tsx`) so `cacheComponents` prerendering still works.

## Next.js version caveat

This is Next.js 16 / React 19, which differs from older versions. `AGENTS.md` requires reading the relevant guide in `node_modules/next/dist/docs/` (`01-app/` for App Router) before writing Next.js code, and heeding deprecation notices.

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, and wires Tailwind 4 through a Turbopack CSS loader (`@tailwindcss/turbopack`) instead of a PostCSS config. These affect how data fetching, caching and dynamic APIs behave in App Router code, so check the docs for them when adding pages or route handlers.

## Conventions and gotchas

- Source is under `src/` with the import alias `@/*` -> `src/*`; routes use the App Router in `src/app/`.
- After a stale/failed build, a corrupted `.next` cache can reproduce old errors; delete `.next` and rebuild before debugging further.
- On Windows PowerShell 5.1, `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing. Edit JSON files with the Edit tool or write them without a BOM.
