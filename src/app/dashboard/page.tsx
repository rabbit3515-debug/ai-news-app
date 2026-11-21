import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { countArticles, listArticles } from "@/lib/articles";
import { listCategories } from "@/lib/categories";
import { AddCategoryButton } from "./add-category-button";
import { ArticleCard } from "./article-card";
import { CardSkeletons } from "./card-skeletons";
import { CategoryChips } from "./category-chips";
import { FetchNewsButton } from "./fetch-news-button";
import { FetchingProvider, FetchingSwitch } from "./fetching-state";
import { parseCategory, parseKeyword } from "./category-param";
import { Footer } from "./footer";
import { SearchForm } from "./search-form";

function ChipsSkeleton() {
  return <div aria-hidden className="h-9" />;
}

async function TotalCount() {
  const { userId } = await auth.protect();
  const total = await countArticles(userId);
  return (
    <p
      aria-live="polite"
      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
    >
      총{" "}
      <span className="mx-1 font-semibold text-indigo-600 dark:text-indigo-400">
        {total}
      </span>
      개의 뉴스
    </p>
  );
}

// 칩 줄은 선택 값(searchParams)을 서버에서 읽지 않으므로, 필터를 바꿔도 다시 그려지지 않는다.
async function CategoryNav() {
  const { userId } = await auth.protect();
  const categories = await listCategories(userId);
  return (
    // 클라이언트에서 useSearchParams 를 쓰므로 자체 Suspense 가 필요하다.
    <Suspense fallback={<ChipsSkeleton />}>
      <CategoryChips
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      >
        <AddCategoryButton />
      </CategoryChips>
    </Suspense>
  );
}

async function ArticleList({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth.protect();
  const sp = await searchParams;
  const selected = parseCategory(sp.category);
  const keyword = parseKeyword(sp.q);
  const items = await listArticles(userId, selected, keyword);

  if (items.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-slate-500 dark:text-neutral-400">
        {keyword !== undefined
          ? `'${keyword}'에 해당하는 뉴스가 없어요.`
          : selected === undefined
            ? "아직 수집된 뉴스가 없어요. 위의 '뉴스 가져오기'를 눌러 보세요."
            : "이 카테고리에는 뉴스가 없어요."}
      </p>
    );
  }

  return (
    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {items.map((a) => (
        <li key={a.id}>
          <ArticleCard article={a} />
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <FetchingProvider>
      <div className="flex flex-1 flex-col bg-slate-50 dark:bg-neutral-950">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-50">
              AI 뉴스 수집기
            </h1>
            <div className="flex items-center gap-3">
              <FetchNewsButton />
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
          <div className="mb-4 h-7">
            <Suspense fallback={null}>
              <TotalCount />
            </Suspense>
          </div>
          {/* 카테고리 칩 줄: 칩은 왼쪽, 검색창은 오른쪽 끝(좁은 화면에서는 아래 줄) */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Suspense fallback={<ChipsSkeleton />}>
                <CategoryNav />
              </Suspense>
            </div>
            {/* useSearchParams 를 쓰므로 자체 Suspense 가 필요하다. */}
            <Suspense fallback={<div aria-hidden className="h-9" />}>
              <SearchForm />
            </Suspense>
          </div>
          <FetchingSwitch>
            <Suspense fallback={<CardSkeletons />}>
              <ArticleList searchParams={props.searchParams} />
            </Suspense>
          </FetchingSwitch>
        </main>
        <Footer />
      </div>
    </FetchingProvider>
  );
}
