"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY, applyTheme, readTheme } from "./theme";

// 클릭할 때마다 다크/라이트를 전환한다. 서버는 현재 테마를 모르므로 상태를 두지 않고,
// 아이콘과 접근성 이름을 `dark:` 클래스로 바꿔 hydration 불일치를 피한다.
export function ThemeToggle() {
  // 개발 모드 Strict Mode 재마운트가 <html> 의 클래스를 지우므로 페인트 전에 다시 적용한다.
  // 프로덕션에서는 <head> 스크립트가 이미 적용해 두어 아무 변화가 없다.
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);

  function toggle() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 저장할 수 없어도 현재 화면의 전환은 유지한다.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      {/* display:none 인 쪽은 접근성 트리에서도 빠지므로, 보이는 쪽 문구가 버튼 이름이 된다. */}
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <span className="hidden dark:inline dark:sr-only">라이트 모드로 전환</span>
      {/* 라이트 모드: 달 아이콘 */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 dark:hidden"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* 다크 모드: 해 아이콘 */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden size-4 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}
