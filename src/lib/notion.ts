import type { Article } from "@/db/schema";

const NOTION_VERSION = "2022-06-28";

// rich_text 한 덩어리는 2000자까지만 허용된다.
function richText(content: string) {
  return [{ type: "text", text: { content: content.slice(0, 2000) } }];
}

// 기사 한 건을 Notion 데이터베이스(제목/카테고리/출처/원문 링크/발행일 + 본문 요약)에 행으로 추가하고
// 만들어진 페이지 URL 을 돌려준다. 실패하면 예외를 던진다.
export async function createNotionPage(
  article: Article,
  categoryName: string | null,
): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) throw new Error("Notion 환경변수가 없어요.");

  const properties: Record<string, unknown> = {
    제목: { title: richText(article.titleKo) },
    출처: { rich_text: richText(article.sourceName) },
    "원문 링크": { url: article.link },
    요약: { rich_text: richText(article.summaryKo) },
  };
  if (categoryName) properties["카테고리"] = { select: { name: categoryName } };
  if (article.publishedAt)
    properties["발행일"] = {
      date: { start: article.publishedAt.toISOString() },
    };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: richText(article.summaryKo) },
        },
      ],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion ${res.status}`);
  const page = (await res.json()) as { url?: string };
  if (!page.url) throw new Error("Notion 응답에 URL이 없어요.");
  return page.url;
}
