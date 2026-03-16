import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import styles from "../admin.module.css";

export default async function AllPostsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, status, created_at, published_at")
    .order("created_at", { ascending: false });

  const allPosts = posts || [];
  const published = allPosts.filter(p => p.status === "published");
  const drafts = allPosts.filter(p => p.status === "draft");
  const trashed = allPosts.filter(p => p.status === "trash");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

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
        <li><a href="#" className={styles.wpCurrent}>All <span className={styles.wpCount}>({allPosts.length})</span></a> |</li>
        <li><a href="#">Published <span className={styles.wpCount}>({published.length})</span></a> |</li>
        <li><a href="#">Drafts <span className={styles.wpCount}>({drafts.length})</span></a> |</li>
        <li><a href="#">Trash <span className={styles.wpCount}>({trashed.length})</span></a></li>
      </ul>

      {/* Tablenav top */}
      <div className={styles.wpTablenav}>
        <div className={styles.wpAlignleft}>
          <select className={styles.wpSelect} defaultValue="">
            <option value="">Bulk Actions</option>
            <option value="trash">Move to Trash</option>
            <option value="publish">Publish</option>
          </select>
          <button className={styles.wpButton} style={{ marginLeft: 6 }}>Apply</button>
        </div>
        <div className={styles.wpTablenavPages}>
          <span className={styles.wpDisplayingNum}>
            {allPosts.length} {allPosts.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Table */}
      <table className={styles.wpListTable}>
        <thead>
          <tr>
            <th className={styles.wpCheckColumn}><input type="checkbox" /></th>
            <th className={styles.wpColumnTitle}>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {allPosts.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#646970" }}>
                No posts found. <Link href="/admin/posts/new" style={{ color: "#2271b1" }}>Create your first post →</Link>
              </td>
            </tr>
          ) : (
            allPosts.map((post, index) => (
              <tr key={post.id} className={index % 2 !== 0 ? styles.wpAlternateRow : ""}>
                <td className={styles.wpCheckColumn}>
                  <input type="checkbox" />
                </td>
                <td className={styles.wpColumnTitle}>
                  <strong>
                    <Link href={`/blog/${post.slug}`} className={styles.wpRowTitle}>
                      {post.title}
                    </Link>
                    {post.status === "draft" && (
                      <span className={styles.wpPostState}> — Draft</span>
                    )}
                  </strong>
                  <div className={styles.wpRowActions}>
                    <span><Link href={`/admin/posts/edit/${post.id}`}>Edit</Link> | </span>
                    <span><a href="#" style={{ color: "#d63638" }}>Trash</a> | </span>
                    <span><Link href={`/blog/${post.slug}`} target="_blank">View</Link></span>
                  </div>
                </td>
                <td>{post.category || "—"}</td>
                <td>
                  <span className={`${styles.wpStatusBadge} ${post.status === "published" ? styles.wpStatusPublished : styles.wpStatusDraft}`}>
                    {post.status}
                  </span>
                </td>
                <td>
                  {post.status === "published"
                    ? `Published\n${formatDate(post.published_at)}`
                    : `Last Modified\n${formatDate(post.created_at)}`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
