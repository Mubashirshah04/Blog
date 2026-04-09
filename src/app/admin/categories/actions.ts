"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    name: formData.name,
    slug: formData.slug,
    parent_id: formData.parent_id || null,
    description: formData.description || "",
  });

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      name: formData.name,
      slug: formData.slug,
      parent_id: formData.parent_id || null,
      description: formData.description || "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function bulkDeleteCategories(ids: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error bulk deleting categories:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}
