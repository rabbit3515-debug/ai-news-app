"use client";

import { useState, useTransition } from "react";
import { saveToNotionAction } from "./actions";

const base =
  "inline-flex h-8 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition dark:border-neutral-700 dark:text-neutral-200";

export function SaveNotionButton({
  articleId,
  savedUrl,
}: {
  articleId: number;
  savedUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(savedUrl !== null);
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      try {
        const result = await saveToNotionAction(articleId);
        if (result.ok) setSaved(true);
        else setError(result.error);
      } catch {
        setError("Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  if (saved)
    return (
      <button
        type="button"
        disabled
        className={`${base} gap-1.5 text-slate-500 dark:text-neutral-400`}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
        저장됨
      </button>
    );

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        title={error || undefined}
        className={`${base} hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
      >
        {pending ? "저장 중…" : error ? "다시 시도" : "Notion 저장"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {error}
      </span>
    </>
  );
}
