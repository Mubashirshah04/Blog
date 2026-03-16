import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import styles from "./page.module.css";
import React from "react";

export default async function Home() {
  const supabase = await createClient();

  // Featured post (latest published)
  const { data: featuredPost } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, featured_image, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Latest posts (skip featured)
  const { data: latestPosts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, featured_image, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(1, 6);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className={styles.container}>
      {/* Hero / Featured */}
      {featuredPost ? (
        <section className={styles.heroSection}>
          <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
            <div className={styles.featuredImageWrapper}>
              <img
                src={featuredPost.featured_image || DEFAULT_IMAGE}
                alt={featuredPost.title}
                className={styles.image}
              />
              <div className={styles.featuredOverlay}></div>
            </div>
            <div className={styles.featuredContent}>
              {featuredPost.category && <span className={styles.tag}>{featuredPost.category}</span>}
              <h1 className={styles.featuredTitle}>{featuredPost.title}</h1>
              {featuredPost.excerpt && <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>}
            </div>
          </Link>

          <div className={styles.trendingSidebar}>
            <h2 className={styles.sectionTitle}>Latest Posts</h2>
            <div className={styles.trendingList}>
              {(latestPosts || []).slice(0, 4).map((post, i) => (
                <div key={post.id} className={styles.trendingItem}>
                  <span className={styles.trendingNumber}>0{i + 1}</span>
                  <div className={styles.trendingItemContent}>
                    <Link href={`/blog/${post.slug}`} className={styles.trendingItemTitle}>
                      {post.title}
                    </Link>
                    <span className={styles.trendingItemMeta}>
                      {formatDate(post.created_at)} • {post.category || "General"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.emptyHero}>
          <h1>Welcome to Digital Info</h1>
          <p>No posts yet. <Link href="/admin/posts/new">Create your first post →</Link></p>
        </section>
      )}

      {/* Latest Articles Grid */}
      {latestPosts && latestPosts.length > 0 && (
        <section className={styles.mainContent}>
          <div className={styles.postsSection}>
            <h2 className={styles.sectionTitle}>Latest Stories</h2>
            <div className={styles.postsGrid}>
              {latestPosts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={styles.postCard}>
                  <div className={styles.postImageWrapper}>
                    <img
                      src={post.featured_image || DEFAULT_IMAGE}
                      alt={post.title}
                      className={styles.postImage}
                    />
                  </div>
                  <div className={styles.postCardContent}>
                    <span className={styles.categoryText}>{post.category || "General"}</span>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
                    <span className={styles.postDate}>{formatDate(post.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.categoriesWidget}>
              <h3 className={styles.widgetTitle}>Browse by Category</h3>
              <div className={styles.categoryTags}>
                {["AI Tools", "Finance", "Crypto", "Tech News", "Mobile Apps", "Online Earning", "Cricket News"].map(cat => (
                  <Link
                    href={`/category/${cat.toLowerCase().replace(/ /g, "-")}`}
                    key={cat}
                    className={styles.categoryTag}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
