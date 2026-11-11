"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { insertArticles } from "@/lib/articles";
import { createCategory } from "@/lib/categories";
import { fetchRecentFeedItems, FEEDS } from "@/lib/rss";

export type FetchNewsResult =
  | { ok: true; added: number; failedSources: string[] }
  | { ok: false; error: string };

// '뉴스 가져오기': 두 RSS 피드의 지난 24시간 기사를 저장한다.
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
    const added = await insertArticles(userId, items);
    revalidatePath("/dashboard");
    return { ok: true, added, failedSources };
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
