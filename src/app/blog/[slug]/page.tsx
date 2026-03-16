import Link from "next/link";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";

// Enhanced parseInline for professional look
function parseInline(text: string) {
  if (!text) return "";
  return text
    // Handle Images first: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="prose-inline-img" style="max-width:100%; border-radius:8px; margin: 20px 0; display:block;" />')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

// Full markdown renderer with better formatting
function renderContent(content: string) {
  if (!content) return null;
  
  return content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Headings
    if (trimmed.startsWith("### "))
      return <h3 key={i} className={styles.proseH3} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^### /, "")) }} />;
    if (trimmed.startsWith("## "))
      return <h2 key={i} className={styles.proseH2} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^## /, "")) }} />;
    if (trimmed.startsWith("# "))
      return <h1 key={i} className={styles.proseH1} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^# /, "")) }} />;

    // Horizontal rule
    if (trimmed === "---") return <hr key={i} className={styles.proseHr} />;

    // Blockquote
    if (trimmed.startsWith("> "))
      return <blockquote key={i} className={styles.proseQuote} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^>/gm, "").trim()) }} />;

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch && (trimmed.startsWith("![") || (trimmed.includes("![") && trimmed.length < 500)))
      return (
        <div key={i} className={styles.proseImageContainer}>
          <img src={imgMatch[2]} alt={imgMatch[1]} className={styles.proseImage} />
          {imgMatch[1] && <span className={styles.imageCaption}>{imgMatch[1]}</span>}
        </div>
      );

    // Lists
    if (trimmed.match(/^- /m)) {
      const lines = trimmed.split("\n").filter(l => l.startsWith("- "));
      return (
        <ul key={i} className={styles.proseUl}>
          {lines.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: parseInline(item.replace(/^- /, "")) }} />
          ))}
        </ul>
      );
    }

    // Default Paragraph
    return <p key={i} className={styles.proseP} dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />;
  });
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

  // Related posts for sidebar
  const { data: related } = await supabase
    .from("posts")
    .select("id, title, slug, featured_image, category, created_at")
    .eq("status", "published")
    .neq("id", post.id)
    .limit(5);

  // Fetch approved comments
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
              {comments && comments.length > 0 && (
                <>
                  <h3 className={styles.commentHeading}>{comments.length} Comments</h3>
                  {comments.map((comment) => (
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
                  ))}
                </>
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
              {(related || []).map((rp, i) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className={styles.trendingCard}>
                  <span className={styles.trendingId}>0{i + 1}</span>
                  <div className={styles.trendingDetails}>
                    <h4>{rp.title}</h4>
                    <span>{formatDate(rp.created_at)}</span>
                  </div>
                </Link>
              ))}
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
                {["AI Tools", "Finance", "Crypto", "Tech"].map(c => (
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
           {(related || []).slice(0, 3).map(rp => (
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
