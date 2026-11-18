"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { filterNewItems, insertArticles } from "@/lib/articles";
import { createCategory, listCategories } from "@/lib/categories";
import { enrichItems } from "@/lib/claude";
import { createNotionPage } from "@/lib/notion";
import { fetchRecentFeedItems, FEEDS } from "@/lib/rss";

export type FetchNewsResult =
  | {
      ok: true;
      added: number;
      failedSources: string[];
      // Claude 번역·분류에 실패해 원문으로 저장된 건수
      enrichFailed: number;
    }
  | { ok: false; error: string };

// '뉴스 가져오기': 두 RSS 피드의 지난 24시간 기사를 번역·요약·분류해 저장한다.
export async function fetchNewsAction(): Promise<FetchNewsResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };

  const { items, failedSources } = await fetchRecentFeedItems();
  if (failedSources.length === FEEDS.length)
    return {
      ok: false,
      error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };

  try {
    // 이미 저장된 기사는 Claude 에 보내지 않는다.
    const newItems = await filterNewItems(userId, items);
    const enriched =
      newItems.length > 0
        ? await enrichItems(newItems, await listCategories(userId))
        : [];
    const enrichFailed = enriched.filter((e) => e === null).length;
    const added = await insertArticles(userId, newItems, enriched);
    revalidatePath("/dashboard");
    return { ok: true, added, failedSources, enrichFailed };
  } catch {
    return {
      ok: false,
      error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export type SaveToNotionResult =
  | { ok: true; notionPageUrl: string }
  | { ok: false; error: string };

// 카드의 'Notion 저장': 기사 한 건을 Notion 데이터베이스에 추가하고 페이지 URL 을 기록한다.
export async function saveToNotionAction(
  articleId: number,
): Promise<SaveToNotionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };
  if (!Number.isInteger(articleId))
    return { ok: false, error: "잘못된 요청이에요." };

  try {
    const [row] = await db
      .select({ article: articles, categoryName: categories.name })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
    if (!row) return { ok: false, error: "기사를 찾을 수 없어요." };
    // 이미 저장된 기사는 중복 행을 만들지 않는다.
    if (row.article.notionPageUrl)
      return { ok: true, notionPageUrl: row.article.notionPageUrl };

    const url = await createNotionPage(row.article, row.categoryName);
    await db
      .update(articles)
      .set({ notionPageUrl: url })
      .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
    revalidatePath("/dashboard");
    return { ok: true, notionPageUrl: url };
  } catch {
    return {
      ok: false,
      error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export type AddCategoryResult = { ok: true } | { ok: false; error: string };

// 대시보드의 인라인 '카테고리 추가'용. 실패 이유를 화면에 보여줄 수 있게 결과를 돌려준다.
export async function addCategoryInlineAction(
  name: string,
): Promise<AddCategoryResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };

  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return { ok: false, error: "이름을 입력해 주세요." };
  if (trimmed.length > 50)
    return { ok: false, error: "이름은 50자 이하로 입력해 주세요." };

  try {
    const created = await createCategory(userId, trimmed);
    if (!created) return { ok: false, error: "이미 있는 카테고리예요." };
  } catch {
    return {
      ok: false,
      error: "추가하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
  revalidatePath("/dashboard");
  revalidatePath("/categories");
  return { ok: true };
}

export type DeleteArticleResult = { ok: true } | { ok: false; error: string };

// 카드의 'X' 버튼: 기사 한 건을 DB 에서 삭제한다(article_sources 는 cascade).
export async function deleteArticleAction(
  articleId: number,
): Promise<DeleteArticleResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };
  if (!Number.isInteger(articleId))
    return { ok: false, error: "잘못된 요청이에요." };

  try {
    await db
      .delete(articles)
      .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
  } catch {
    return {
      ok: false,
      error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}
