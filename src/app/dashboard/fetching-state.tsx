"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { CardSkeletons } from "./card-skeletons";

// 헤더의 "뉴스 가져오기" 버튼과 카드 목록이 가져오는 중 상태를 공유한다.
const FetchingContext = createContext<{
  fetching: boolean;
  setFetching: (value: boolean) => void;
} | null>(null);

export function FetchingProvider({ children }: { children: ReactNode }) {
  const [fetching, setFetching] = useState(false);
  return (
    <FetchingContext value={{ fetching, setFetching }}>
      {children}
    </FetchingContext>
  );
}

export function useFetching() {
  const ctx = useContext(FetchingContext);
  if (!ctx) throw new Error("FetchingProvider 안에서만 사용할 수 있어요.");
  return ctx;
}

// 가져오는 동안에는 카드 목록 대신 스켈레톤을 보여준다.
export function FetchingSwitch({ children }: { children: ReactNode }) {
  const { fetching } = useFetching();
  if (!fetching) return children;
  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        뉴스를 가져오는 중입니다.
      </p>
      <CardSkeletons />
    </>
  );
}
