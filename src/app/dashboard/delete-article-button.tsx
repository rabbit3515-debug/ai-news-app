"use client";

import { useState, useTransition } from "react";
import { deleteArticleAction } from "./actions";

export function DeleteArticleButton({ articleId }: { articleId: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      try {
        // 성공하면 revalidatePath 로 목록이 다시 그려져 카드가 사라진다.
        const result = await deleteArticleAction(articleId);
        if (!result.ok) setError(result.error);
      } catch {
        setError("삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label="기사 삭제"
        title={error || "삭제"}
        className={`inline-flex size-7 items-center justify-center rounded-md transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${error ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-neutral-400"}`}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {error}
      </span>
    </>
  );
}
