import Link from "next/link";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find the category (or subcategory) by slug
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Get subcategories if this is a parent category
  const { data: subcategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("parent_id", category.id)
    .order("sort_order", { ascending: true });

  // Fetch posts from this category AND any of its subcategories
  const categoryNames = [category.name];
  if (subcategories && subcategories.length > 0) {
    subcategories.forEach(s => categoryNames.push(s.name));
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, featured_image, category, created_at")
    .eq("status", "published")
    .in("category", categoryNames)
    .order("created_at", { ascending: false });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  // Get parent category info if this is a subcategory
  const { data: parentCategory } = category.parent_id
    ? await supabase.from("categories").select("name, slug").eq("id", category.parent_id).single()
    : { data: null };

  return (
    <div className={styles.container}>
      {/* Subcategories pills (if parent category) */}
      {subcategories && subcategories.length > 0 && (
        <div className={styles.subcategoryPills}>
          <Link href={`/category/${category.slug}`} className={`${styles.pill} ${styles.pillActive}`}>
            All {category.name}
          </Link>
          {subcategories.map(sub => (
            <Link key={sub.id} href={`/category/${sub.slug}`} className={styles.pill}>
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className={styles.grid}>
          {posts.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={post.featured_image || DEFAULT_IMAGE} alt={post.title} className={styles.image} />
              </div>
              <div className={styles.content}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
                <div className={styles.postMeta}>
                  <span>{formatDate(post.created_at)}</span>
                  <span className={styles.readMore}>Read Article →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>No posts yet in {category.name}</h2>
          <p>Check back soon — new articles are being added regularly.</p>
          <Link href="/" className={styles.backHome}>← Back to Homepage</Link>
        </div>
      )}
    </div>
  );
}
