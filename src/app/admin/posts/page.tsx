import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import styles from "../admin.module.css";
import PostList from "./PostList";

export default async function AllPostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, status, created_at, published_at")
    .order("created_at", { ascending: false });

  const allPosts = posts || [];
  const publishedCount = allPosts.filter(p => p.status === "published").length;
  const draftsCount = allPosts.filter(p => p.status === "draft").length;
  const trashedCount = allPosts.filter(p => p.status === "trash").length;

  const filteredPosts = statusFilter 
    ? allPosts.filter(p => p.status === statusFilter) 
    : allPosts;

  return (
    <div className={styles.wpWrap}>
      <div className={styles.wpPageHeader}>
        <h1 className={styles.wpPageTitle}>Posts</h1>
        <Link href="/admin/posts/new" className={styles.wpAddNew}>Add New Post</Link>
      </div>

      {error && (
        <div className={styles.wpError}>Error loading posts: {error.message}</div>
      )}

      {/* Sub-navigation */}
      <ul className={styles.wpSubsubsub}>
        <li><Link href="/admin/posts" className={!statusFilter ? styles.wpCurrent : ""}>All <span className={styles.wpCount}>({allPosts.length})</span></Link> |</li>
        <li><Link href="/admin/posts?status=published" className={statusFilter === "published" ? styles.wpCurrent : ""}>Published <span className={styles.wpCount}>({publishedCount})</span></Link> |</li>
        <li><Link href="/admin/posts?status=draft" className={statusFilter === "draft" ? styles.wpCurrent : ""}>Drafts <span className={styles.wpCount}>({draftsCount})</span></Link> |</li>
        <li><Link href="/admin/posts?status=trash" className={statusFilter === "trash" ? styles.wpCurrent : ""}>Trash <span className={styles.wpCount}>({trashedCount})</span></Link></li>
      </ul>

      <PostList initialPosts={filteredPosts} />
    </div>
  );
}
