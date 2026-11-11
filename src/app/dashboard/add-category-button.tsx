"use client";

import { useState } from "react";
import { addCategoryAction } from "@/app/categories/actions";

const chipBase =
  "rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);

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
      action={async (formData) => {
        await addCategoryAction(formData);
        setOpen(false);
      }}
      className="inline-flex items-center gap-2"
    >
      <input
        name="name"
        required
        maxLength={50}
        autoFocus
        placeholder="카테고리 이름"
        aria-label="새 카테고리 이름"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="h-9 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
      />
      <button
        type="submit"
        className={`${chipBase} bg-indigo-600 text-white transition hover:bg-indigo-700`}
      >
        추가
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={`${chipBase} text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800`}
      >
        취소
      </button>
    </form>
  );
}
