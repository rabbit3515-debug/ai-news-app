// 중복 방지 키(articles.link)로 쓰는 URL 정규화.
// 쿼리스트링(트래킹 파라미터 포함)·해시·말미 슬래시를 제거하고 호스트를 소문자로 맞춘다.
export function normalizeUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const path = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${path}`;
}
