# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Only the `create-next-app` scaffold exists so far (default `src/app/page.tsx`). `PRD.md` (Korean) is the source of truth for what to build: a personal AI-news app that collects RSS feeds (TechCrunch AI, The Verge AI) on a button click, has Claude translate/summarize/categorize to Korean, shows cards with category filtering, and saves chosen articles to a Notion database. Read `PRD.md` before implementing a feature; its section 12 gives the intended build order. Planned stack: Clerk (auth), Neon + Drizzle ORM (DB), Claude API, Notion MCP server, deployed on Vercel.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also runs TypeScript type check)
npm run start   # serve the production build
npm run lint    # eslint (flat config: eslint.config.mjs)
```

No test runner is configured yet.

## Next.js version caveat

This is Next.js 16 / React 19, which differs from older versions. `AGENTS.md` requires reading the relevant guide in `node_modules/next/dist/docs/` (`01-app/` for App Router) before writing Next.js code, and heeding deprecation notices.

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, and wires Tailwind 4 through a Turbopack CSS loader (`@tailwindcss/turbopack`) instead of a PostCSS config. These affect how data fetching, caching and dynamic APIs behave in App Router code, so check the docs for them when adding pages or route handlers.

## Conventions and gotchas

- Source is under `src/` with the import alias `@/*` -> `src/*`; routes use the App Router in `src/app/`.
- After a stale/failed build, a corrupted `.next` cache can reproduce old errors; delete `.next` and rebuild before debugging further.
- On Windows PowerShell 5.1, `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing. Edit JSON files with the Edit tool or write them without a BOM.
