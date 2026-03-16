import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

// Reusing parser from blog posts
function parseInline(text: string) {
  if (!text) return "";
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="prose-inline-img" style="max-width:100%; border-radius:8px; margin: 20px 0; display:block;" />')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderContent(content: string) {
  if (!content) return null;
  return content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ")) return <h3 key={i} className={styles.proseH3} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^### /, "")) }} />;
    if (trimmed.startsWith("## ")) return <h2 key={i} className={styles.proseH2} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^## /, "")) }} />;
    if (trimmed.startsWith("# ")) return <h1 key={i} className={styles.proseH1} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^# /, "")) }} />;
    if (trimmed.startsWith("> ")) return <blockquote key={i} className={styles.proseQuote} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^>/gm, "").trim()) }} />;
    
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

    return <p key={i} className={styles.proseP} dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />;
  });
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!page || error) notFound();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{page.title}</h1>
      </header>
      <main className={styles.content}>
        {renderContent(page.content || "")}
      </main>
    </div>
  );
}
