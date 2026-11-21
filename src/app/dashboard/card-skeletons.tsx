// 카드 목록 로딩 표현(ui.md 5.6). 첫 로딩(Suspense fallback)과 가져오는 중 양쪽에서 쓴다.
export function CardSkeletons() {
  return (
    <ul
      aria-hidden
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-neutral-800"
        />
      ))}
    </ul>
  );
}
