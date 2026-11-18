"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { dashboardHref, parseCategory, parseKeyword } from "./category-param";

// 입력 후 '검색' 버튼 또는 Enter 로 제출한다. 선택된 카테고리는 유지하고,
// 빈 값으로 제출하면 검색을 해제한다.
export function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const keyword = parseKeyword(params.get("q")) ?? "";
  const category = parseCategory(params.get("category"));
  const [pending, startTransition] = useTransition();

  return (
    <form
      role="search"
      // URL 의 검색어가 바뀌면(칩 이동, 뒤로 가기) 입력칸도 새로 그린다.
      key={keyword}
      className="flex w-full gap-2 sm:w-72"
      onSubmit={(e) => {
        e.preventDefault();
        const value = parseKeyword(
          new FormData(e.currentTarget).get("q")?.toString(),
        );
        startTransition(() => {
          router.push(dashboardHref(category, value));
        });
      }}
    >
      <input
        type="search"
        name="q"
        defaultValue={keyword}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="뉴스 키워드 검색"
        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
      >
        검색
      </button>
    </form>
  );
}
