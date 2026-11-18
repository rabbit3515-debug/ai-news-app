// ?category=<id> | none(미분류) | 없음(전체). 서버/클라이언트가 같은 규칙으로 해석한다.
export type CategoryFilter = number | "none" | undefined;

export function parseCategory(
  value: string | string[] | null | undefined,
): CategoryFilter {
  if (value === "none") return "none";
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  return Number(value);
}

// ?q=<키워드>. 앞뒤 공백을 지우고, 비어 있으면 undefined(검색 안 함). 너무 긴 값은 자른다.
export function parseKeyword(
  value: string | string[] | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim().slice(0, 100);
  return t === "" ? undefined : t;
}

// 카테고리와 키워드를 함께 담은 대시보드 URL.
export function dashboardHref(category: CategoryFilter, keyword?: string) {
  const params = new URLSearchParams();
  if (category !== undefined) params.set("category", String(category));
  if (keyword) params.set("q", keyword);
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}
