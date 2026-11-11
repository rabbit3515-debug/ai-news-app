import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  articles,
  articleSources,
  categories,
  type Article,
  type ArticleSource,
} from "@/db/schema";

export type ArticleWithMeta = Article & {
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
