"use client";

import { useState, useTransition } from "react";
import { addCategoryInlineAction } from "./actions";

const chipBase =
  "rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${chipBase} inline-flex items-center gap-1 border border-dashed border-slate-300 text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400`}
      >
        <span aria-hidden>+</span> 카테고리 추가
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        const name = new FormData(e.currentTarget).get("name");
        setError(null);
        startTransition(async () => {
          const result = await addCategoryInlineAction(String(name ?? ""));
          if (result.ok) close();
          else setError(result.error);
        });
      }}
      className="inline-flex flex-wrap items-center gap-2"
    >
      <input
        name="name"
        required
        maxLength={50}
        autoFocus
        disabled={pending}
        placeholder="카테고리 이름"
        aria-label="새 카테고리 이름"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "add-category-error" : undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        className="h-9 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
      />
      <button
        type="submit"
        disabled={pending}
        className={`${chipBase} bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-60`}
      >
        {pending ? "추가 중…" : "추가"}
      </button>
      <button
        type="button"
        onClick={close}
        disabled={pending}
        className={`${chipBase} text-slate-500 hover:bg-slate-100 disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800`}
      >
        취소
      </button>
      <span
        id="add-category-error"
        role="alert"
        className="text-sm text-red-700 dark:text-red-300"
      >
        {error}
      </span>
    </form>
  );
}
