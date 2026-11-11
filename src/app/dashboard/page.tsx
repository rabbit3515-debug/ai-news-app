import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { listArticles } from "@/lib/articles";
import { listCategories } from "@/lib/categories";
import { AddCategoryButton } from "./add-category-button";
import { ArticleCard } from "./article-card";

export const metadata = { title: "AI 뉴스 수집기" };

const chipBase =
  "rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipOn = `${chipBase} bg-indigo-600 text-white`;
const chipOff = `${chipBase} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800`;

// ?category=<id> | none(미분류) | 없음(전체)
function parseCategory(value: string | string[] | undefined) {
  if (value === "none") return "none" as const;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  return Number(value);
}

function CardSkeletons() {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-neutral-800"
        />
      ))}
    </ul>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth.protect();
  const selected = parseCategory((await searchParams).category);
  const [categories, items] = await Promise.all([
    listCategories(userId),
    listArticles(userId, selected),
  ]);

  return (
    <>
      <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard"
          aria-current={selected === undefined ? "page" : undefined}
          className={selected === undefined ? chipOn : chipOff}
        >
          전체
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard?category=${c.id}`}
            aria-current={selected === c.id ? "page" : undefined}
            className={selected === c.id ? chipOn : chipOff}
          >
            {c.name}
          </Link>
        ))}
        <Link
          href="/dashboard?category=none"
          aria-current={selected === "none" ? "page" : undefined}
          className={selected === "none" ? chipOn : chipOff}
        >
          미분류
        </Link>
        <AddCategoryButton />
      </nav>

      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-slate-500 dark:text-neutral-400">
          {selected === undefined
            ? "아직 수집된 뉴스가 없어요."
            : "이 카테고리에는 뉴스가 없어요."}
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((a) => (
            <li key={a.id}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-50">
            AI 뉴스 수집기
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="text-sm text-slate-500 hover:underline dark:text-neutral-400"
            >
              카테고리 관리
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense
          fallback={
            <>
              <div className="h-9" />
              <CardSkeletons />
            </>
          }
        >
          <Dashboard searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
