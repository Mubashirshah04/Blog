import styles from "./admin.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch Counts
  const { count: postsCount } = await supabase.from("posts").select("*", { count: 'exact', head: true });
  const { count: pagesCount } = await supabase.from("pages").select("*", { count: 'exact', head: true });
  const { count: commentsCount } = await supabase.from("comments").select("*", { count: 'exact', head: true });

  // 2. Fetch Recently Published Content
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, title, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.wpContainer}>
      <header className={styles.wpHeader}>
        <h1 className={styles.wpTitle}>Dashboard</h1>
      </header>

      <div className={styles.wpWidgetsGrid}>
        <div className={styles.wpColumn}>
          {/* At a Glance Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>At a Glance</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <ul className={styles.wpGlanceList}>
                <li>
                  <span className={styles.wpIcon}>📌</span>{" "}
                  <Link href="/admin/posts">{postsCount || 0} Posts</Link>
                </li>
                <li>
                  <span className={styles.wpIcon}>📄</span>{" "}
                  <Link href="/admin/pages">{pagesCount || 0} Pages</Link>
                </li>
                <li>
                  <span className={styles.wpIcon}>💬</span>{" "}
                  <Link href="/admin/comments">{commentsCount || 0} Comments</Link>
                </li>
              </ul>
              <p className={styles.wpGlanceFooter}>
                Next.js Version 16.1.6 running Shah Insights Theme.
              </p>
            </div>
          </div>

          {/* Activity Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Activity</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <h3 className={styles.wpSubTitle}>Recently Published</h3>
              <ul className={styles.wpActivityList}>
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <li key={post.id}>
                      <span>{formatDate(post.created_at)}</span>{" "}
                      <Link href={`/admin/posts/edit/${post.id}`}>{post.title}</Link>
                    </li>
                  ))
                ) : (
                  <li style={{ color: "#646970", fontStyle: "italic" }}>No posts found.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.wpColumn}>
          {/* Quick Draft Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Quick Draft</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <form className={styles.wpDraftForm}>
                <input type="text" placeholder="Title" className={styles.wpInput} />
                <textarea rows={4} placeholder="What's on your mind?" className={styles.wpInput}></textarea>
                <div className={styles.wpFormActions}>
                  <button type="button" className={styles.wpButtonPrimary}>Save Draft</button>
                </div>
              </form>
            </div>
          </div>
          
          {/* SEO Overview Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Site Health Status</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <div className={styles.wpHealthGood}>
                <span className={styles.wpHealthCircle}></span> Good
              </div>
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#50575e' }}>
                Your site is running optimally. 0 critical issues found.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
