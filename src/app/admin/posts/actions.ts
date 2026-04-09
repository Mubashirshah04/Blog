"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function trashPost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ status: "trash" })
    .eq("id", postId);

  if (error) {
    console.error("Error trashing post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  return { success: true };
}

export async function deletePostPermanently(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  return { success: true };
}

export async function restorePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", postId);

  if (error) {
    console.error("Error restoring post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  return { success: true };
}

export async function bulkTrashPosts(postIds: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ status: "trash" })
    .in("id", postIds);

  if (error) {
    console.error("Error bulk trashing posts:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  return { success: true };
}
