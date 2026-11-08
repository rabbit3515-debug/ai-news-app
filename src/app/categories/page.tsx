import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/lib/categories";
import {
  addCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";

const inputClass =
  "rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const buttonClass =
  "rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

async function CategoryList() {
  const { userId } = await auth.protect();
  const items = await listCategories(userId);

  return (
    <>
      <form action={addCategoryAction} className="flex flex-wrap gap-2">
        <input
          name="name"
          required
          maxLength={50}
          placeholder="새 카테고리 이름"
          className={inputClass}
        />
        <input
          name="description"
          placeholder="분류 힌트 (선택)"
          className={`${inputClass} flex-1`}
        />
        <button type="submit" className={buttonClass}>
          추가
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2">
            <form action={updateCategoryAction} className="flex flex-1 gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input
                name="name"
                required
                maxLength={50}
                defaultValue={c.name}
                className={inputClass}
              />
              <input
                name="description"
                defaultValue={c.description ?? ""}
                placeholder="분류 힌트 (선택)"
                className={`${inputClass} flex-1`}
              />
              <button type="submit" className={buttonClass}>
                저장
              </button>
            </form>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className={buttonClass}>
                삭제
              </button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-zinc-500">
        카테고리를 삭제하면 해당 뉴스는 &apos;미분류&apos;로 이동합니다.
      </p>
    </>
  );
}

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">카테고리 관리</h1>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← 뉴스로 돌아가기
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl p-6">
        <Suspense fallback={<p className="text-zinc-500">불러오는 중...</p>}>
          <CategoryList />
        </Suspense>
      </main>
    </div>
  );
}
