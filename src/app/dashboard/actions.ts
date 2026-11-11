"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCategory } from "@/lib/categories";

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
