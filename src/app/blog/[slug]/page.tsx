import Link from "next/link";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";

import { marked } from "marked";

// Enhanced renderer configuration
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Full markdown renderer using marked library
function renderContent(content: string) {
  if (!content) return null;
  const html = marked.parse(content) as string;
  return <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post || error) notFound();

  // 1. Fetch Trending Posts (Based on views in analytics)
  const { data: trendingViews } = await supabase
    .from("analytics")
    .select("post_id")
    .eq("event_type", "view");
  
  const viewCounts: Record<string, number> = {};
  trendingViews?.forEach(v => {
    if (v.post_id) viewCounts[v.post_id] = (viewCounts[v.post_id] || 0) + 1;
  });

  const { data: allPublished } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, category")
    .eq("status", "published")
    .limit(50);
  
  const trendingPosts = (allPublished || [])
    .map(p => ({ ...p, views: viewCounts[p.id] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // 2. Fetch categories for sidebar
  const { data: sidebarCats } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .limit(10);

  // 3. Related posts (You may also like)
  const relatedPosts = (allPublished || [])
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // 4. Fetch approved comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200";

  return (
    <article className={styles.postWrapper}>
      {/* 1. Header Section */}
      <header className={styles.postHeader}>
        <div className={styles.headerContainer}>
          {post.category && (
            <span className={styles.categoryLabel}>{post.category}</span>
          )}
          <h1 className={styles.mainTitle}>{post.title}</h1>
        </div>
      </header>

      {/* 2. Featured Image */}
      <div className={styles.heroWrapper}>
        <img
          src={post.featured_image || DEFAULT_IMAGE}
          alt={post.title}
          className={styles.heroImg}
        />
      </div>

      {/* 3. Main Content Area */}
      <div className={styles.contentGrid}>
        {/* Left Side: Social Sticky */}
        <aside className={styles.socialSidebar}>
          <div className={styles.socialSticky}>
             <button className={styles.socialIcon} title="Share on X">𝕏</button>
             <button className={styles.socialIcon} title="Share on Facebook">f</button>
             <button className={styles.socialIcon} title="Share on LinkedIn">in</button>
             <button className={styles.socialIcon} title="Copy Link">🔗</button>
          </div>
        </aside>

        {/* Center: Article Body */}
        <main className={styles.mainArticle}>
          <div className={styles.articleProse}>
            {renderContent(post.content || "")}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={styles.postTags}>
              {post.tags.map((tag: string) => (
                <span key={tag} className={styles.tagItem}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <section className={styles.commentSectionWrapper}>
            <div className={styles.commentsList}>
               <h3 className={styles.commentHeading}>
                 {comments && comments.length > 0 ? `${comments.length} Comments` : "Comments"}
               </h3>
               
               {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentAuthorAvatar}>
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.commentAuthorMeta}>
                          <strong>{comment.author_name}</strong>
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                      <div className={styles.commentBody}>
                        {comment.content}
                      </div>
                    </div>
                  ))
               ) : (
                 <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginBottom: "2rem" }}>
                   No approved comments yet. Be the first to share your thoughts!
                 </p>
               )}
            </div>
            
            <CommentForm postId={post.id} />
          </section>
        </main>

        {/* Right Side: Sidebar Widgets */}
        <aside className={styles.sidebarWidgets}>
          <div className={styles.widget}>
            <h3 className={styles.widgetHeader}>Trending Now</h3>
            <div className={styles.trendingPosts}>
              {trendingPosts.length > 0 ? trendingPosts.map((rp, i) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className={styles.trendingCard}>
                  <span className={styles.trendingId}>0{i + 1}</span>
                  <div className={styles.trendingDetails}>
                    <h4>{rp.title}</h4>
                    <span>{formatDate(rp.created_at)}</span>
                  </div>
                </Link>
              )) : <p>No trending posts yet.</p>}
            </div>
          </div>

          <div className={styles.widget}>
             <h3 className={styles.widgetHeader}>Newsletter</h3>
             <div className={styles.newsletterBox}>
                <p>Get the best stories delivered directly to your inbox weekly.</p>
                <input type="email" placeholder="Enter your email" className={styles.newsletterInput} />
                <button className={styles.newsletterBtn}>Subscribe</button>
             </div>
          </div>

          <div className={styles.widget}>
             <h3 className={styles.widgetHeader}>Categories</h3>
             <div className={styles.catGrid}>
                {sidebarCats && sidebarCats.length > 0 ? sidebarCats.map(c => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className={styles.catLink}>{c.name}</Link>
                )) : ["AI Tools", "Finance", "Crypto", "Tech"].map(c => (
                  <Link key={c} href={`/category/${c.toLowerCase()}`} className={styles.catLink}>{c}</Link>
                ))}
             </div>
          </div>
        </aside>
      </div>

      {/* 4. Recent Posts Section (Bottom) */}
      <section className={styles.recentPostsSection}>
        <div className={styles.recentSeparator}>
           <span>You May Also Like</span>
        </div>
        <div className={styles.recentGrid}>
           {relatedPosts.length > 0 ? relatedPosts.map(rp => (
             <Link key={rp.id} href={`/blog/${rp.slug}`} className={styles.recentCard}>
                <div className={styles.recentImgWrap}>
                   <img src={rp.featured_image || DEFAULT_IMAGE} alt={rp.title} />
                </div>
                <div className={styles.recentContent}>
                   <span className={styles.recentCat}>{rp.category || "General"}</span>
                   <h4>{rp.title}</h4>
                   <span className={styles.recentDate}>{formatDate(rp.created_at)}</span>
                </div>
             </Link>
           )) : (allPublished || []).slice(0, 3).map(rp => (
             <Link key={rp.id} href={`/blog/${rp.slug}`} className={styles.recentCard}>
                <div className={styles.recentImgWrap}>
                   <img src={rp.featured_image || DEFAULT_IMAGE} alt={rp.title} />
                </div>
                <div className={styles.recentContent}>
                   <span className={styles.recentCat}>{rp.category || "General"}</span>
                   <h4>{rp.title}</h4>
                   <span className={styles.recentDate}>{formatDate(rp.created_at)}</span>
                </div>
             </Link>
           ))}
        </div>
      </section>
    </article>
  );
}
