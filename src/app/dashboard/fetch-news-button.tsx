"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchNewsAction } from "./actions";
import { useFetching } from "./fetching-state";

export function FetchNewsButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const { setFetching } = useFetching();

  // 카드 목록이 스켈레톤을 보여줄 수 있도록 가져오는 중 상태를 공유한다.
  useEffect(() => {
    setFetching(pending);
  }, [pending, setFetching]);

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      let text: string;
      try {
        const result = await fetchNewsAction();
        if (!result.ok) {
          text = result.error;
        } else {
          text =
            result.added > 0
              ? `${result.added}건의 새 뉴스를 가져왔어요.`
              : "새 뉴스가 없어요.";
          if (result.enrichFailed > 0)
            text += ` (${result.enrichFailed}건은 번역하지 못해 원문으로 저장했어요.)`;
          if (result.failedSources.length > 0)
            text += ` (${result.failedSources.join(", ")}은(는) 가져오지 못했어요.)`;
        }
      } catch {
        text = "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.";
      }
      setMessage(text);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span
        aria-live="polite"
        className="hidden text-sm text-slate-500 sm:inline dark:text-neutral-400"
      >
        {pending ? "" : message}
      </span>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        {pending && (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
