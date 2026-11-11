// ?category=<id> | none(미분류) | 없음(전체). 서버/클라이언트가 같은 규칙으로 해석한다.
export type CategoryFilter = number | "none" | undefined;

export function parseCategory(
  value: string | string[] | null | undefined,
): CategoryFilter {
  if (value === "none") return "none";
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  return Number(value);
}
