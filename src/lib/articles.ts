import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  articles,
  articleSources,
  categories,
  type Article,
  type ArticleSource,
} from "@/db/schema";
import type { Enriched } from "@/lib/claude";
import type { FeedItem } from "@/lib/rss";

// 같은 실행 안에서 URL이 겹치는 항목은 하나만 남긴다.
export function dedupeItems(items: FeedItem[]): FeedItem[] {
  return [...new Map(items.map((i) => [i.link, i])).values()];
}

// 이미 저장된 기사를 Claude 에 다시 보내지 않도록, 새 기사만 남긴다.
export async function filterNewItems(
  userId: string,
  items: FeedItem[],
): Promise<FeedItem[]> {
  const unique = dedupeItems(items);
  if (unique.length === 0) return [];
  const existing = await db
    .select({ link: articles.link })
    .from(articles)
    .where(
      and(
        eq(articles.userId, userId),
        inArray(
          articles.link,
          unique.map((i) => i.link),
        ),
      ),
    );
  const seen = new Set(existing.map((r) => r.link));
  return unique.filter((i) => !seen.has(i.link));
}

// items 와 같은 순서의 enriched 를 받아 저장한다. enriched[i] 가 null 이면
// (번역 실패) 원문을 임시로 채우고 미분류로 둔다. 새로 저장된 건수를 돌려준다.
export async function insertArticles(
  userId: string,
  items: FeedItem[],
  enriched: (Enriched | null)[] = [],
): Promise<number> {
  if (items.length === 0) return 0;

  const inserted = await db
    .insert(articles)
    .values(
      items.map((i, idx) => ({
        userId,
        sourceName: i.sourceName,
        link: i.link,
        originalTitle: i.originalTitle,
        titleKo: enriched[idx]?.titleKo ?? i.originalTitle,
        summaryKo: enriched[idx]?.summaryKo ?? (i.summary || i.originalTitle),
        categoryId: enriched[idx]?.categoryId ?? null,
        publishedAt: i.publishedAt,
        imageUrl: i.imageUrl,
      })),
    )
    .onConflictDoNothing({ target: [articles.userId, articles.link] })
    .returning({ id: articles.id });
  return inserted.length;
}

export type ArticleWithMeta =Article & {
  categoryName: string | null;
  // 같은 사건을 다룬 추가 출처
  sources: Pick<ArticleSource, "sourceName" | "link">[];
};

// categoryId: undefined = 전체, "none" = 미분류, number = 해당 카테고리
export async function listArticles(
  userId: string,
  categoryId?: number | "none",
): Promise<ArticleWithMeta[]> {
  const filters = [eq(articles.userId, userId)];
  if (categoryId === "none") filters.push(isNull(articles.categoryId));
  else if (categoryId !== undefined)
    filters.push(eq(articles.categoryId, categoryId));

  const rows = await db
    .select({ article: articles, categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(...filters))
    // 최신순: 발행일이 없으면 수집 시각을 대신 사용한다.
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    );
  if (rows.length === 0) return [];

  const sourceRows = await db
    .select()
    .from(articleSources)
    .where(
      inArray(
        articleSources.articleId,
        rows.map((r) => r.article.id),
      ),
    );
  const byArticle = new Map<number, ArticleWithMeta["sources"]>();
  for (const s of sourceRows) {
    const list = byArticle.get(s.articleId) ?? [];
    list.push({ sourceName: s.sourceName, link: s.link });
    byArticle.set(s.articleId, list);
  }

  return rows.map((r) => ({
    ...r.article,
    categoryName: r.categoryName,
    sources: byArticle.get(r.article.id) ?? [],
  }));
}
