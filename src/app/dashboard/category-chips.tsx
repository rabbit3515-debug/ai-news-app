"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition, type ReactNode } from "react";
import { parseCategory, type CategoryFilter } from "./category-param";

const chipBase =
  "rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipOn = `${chipBase} bg-indigo-600 text-white`;
const chipOff = `${chipBase} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800`;

type Chip = { key: string; label: string; value: CategoryFilter; href: string };

// 선택한 칩을 즉시 반영(낙관적)하고, 목록은 새 데이터가 준비될 때까지 이전 것을 유지한다.
export function CategoryChips({
  categories,
  children,
}: {
  categories: { id: number; name: string }[];
  // 칩 줄 맨 끝에 놓일 요소 (카테고리 추가 버튼)
  children?: ReactNode;
}) {
  const router = useRouter();
  const urlSelected = parseCategory(useSearchParams().get("category"));
  const [selected, setSelected] = useOptimistic(urlSelected);
  const [, startTransition] = useTransition();

  const chips: Chip[] = [
    { key: "all", label: "전체", value: undefined, href: "/dashboard" },
    ...categories.map((c) => ({
      key: String(c.id),
      label: c.name,
      value: c.id as CategoryFilter,
      href: `/dashboard?category=${c.id}`,
    })),
    {
      key: "none",
      label: "미분류",
      value: "none",
      href: "/dashboard?category=none",
    },
  ];

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const active = selected === chip.value;
        return (
          <Link
            key={chip.key}
            href={chip.href}
            aria-current={active ? "page" : undefined}
            className={active ? chipOn : chipOff}
            onClick={(e) => {
              // 새 탭/창 열기 같은 기본 동작은 그대로 둔다.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              startTransition(() => {
                setSelected(chip.value);
                router.push(chip.href);
              });
            }}
          >
            {chip.label}
          </Link>
        );
      })}
      {children}
    </nav>
  );
}
