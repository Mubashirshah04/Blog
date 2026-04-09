import { createClient } from "@/utils/supabase/server";
import styles from "../admin.module.css";
import CategoryManager from "./CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: allCats } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, description, sort_order")
    .order("sort_order", { ascending: true });

  const categories = allCats || [];

  return (
    <div className={styles.wpWrap}>
      <div className={styles.wpPageHeader}>
        <h1 className={styles.wpPageTitle}>Categories</h1>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
