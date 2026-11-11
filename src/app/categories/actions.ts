"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/categories";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function addCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const name = readText(formData, "name");
  if (!name || name.length > 50) return;
  await createCategory(userId, name, readText(formData, "description"));
  revalidatePath("/categories");
  revalidatePath("/dashboard");
}

export async function updateCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = Number(readText(formData, "id"));
  const name = readText(formData, "name");
  if (!Number.isInteger(id) || !name || name.length > 50) return;
  try {
    await updateCategory(userId, id, name, readText(formData, "description"));
  } catch {
    // 같은 이름의 카테고리가 이미 있으면 변경하지 않는다.
  }
  revalidatePath("/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = Number(readText(formData, "id"));
  if (!Number.isInteger(id)) return;
  await deleteCategory(userId, id);
  revalidatePath("/categories");
}
