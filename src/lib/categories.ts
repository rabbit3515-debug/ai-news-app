import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, type Category } from "@/db/schema";

export const DEFAULT_CATEGORIES = [
  "모델/연구",
  "제품/서비스",
  "기업/투자",
  "규제/윤리",
  "오픈소스",
  "기타",
];

export async function listCategories(userId: string): Promise<Category[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.id));
  if (rows.length > 0) return rows;

  // 카테고리가 하나도 없으면 기본 카테고리를 넣는다(첫 사용 시 1회).
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing();
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.id));
}

export async function createCategory(
  userId: string,
  name: string,
  description?: string,
): Promise<boolean> {
  // 같은 이름이 이미 있으면 만들지 않고 false 를 돌려준다.
  const rows = await db
    .insert(categories)
    .values({ userId, name, description: description || null })
    .onConflictDoNothing()
    .returning({ id: categories.id });
  return rows.length > 0;
}

export async function updateCategory(
  userId: string,
  id: number,
  name: string,
  description?: string,
) {
  await db
    .update(categories)
    .set({ name, description: description || null })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// 삭제하면 articles.category_id 가 null 이 되어 '미분류'가 된다(FK on delete set null).
export async function deleteCategory(userId: string, id: number) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
