"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { filterNewItems, insertArticles } from "@/lib/articles";
import { createCategory, listCategories } from "@/lib/categories";
import { enrichItems } from "@/lib/claude";
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
