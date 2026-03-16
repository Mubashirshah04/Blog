"use client";
import styles from "../../../posts/new/createPost.module.css";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { MediaLibrary } from "@/components/MediaLibrary";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "_$1_")
    .replace(/<i>(.*?)<\/i>/gi, "_$1_")
    .replace(/<del>(.*?)<\/del>/gi, "~~$1~~")
    .replace(/<s>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<blockquote(.*?)>(.*?)<\/blockquote>/gi, "> $2\n\n")
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)\n\n")
    .replace(/<img[^>]+alt=["']([^"']*)["'][^>]+src=["']([^"']+)["'][^>]*>/gi, "![$1]($2)\n\n")
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "![]($1)\n\n")
    .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  return md
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="wp-editor-image" style="max-width:100%; height:auto; border-radius:8px; margin: 20px 0; display:block;" />')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.*?)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"visual" | "text">("visual");
  const [textContent, setTextContent] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id).single();
      if (error || !data) {
        setNotice("❌ Page not found!");
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setStatus(data.status);
      const html = markdownToHtml(data.content);
      setEditorHtml(html);
      setTextContent(html);
      setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = html; }, 100);
      setLoading(false);
    };
    fetchPage();
  }, [id]);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, []);

  const handleMediaSelect = (url: string) => {
    editorRef.current?.focus();
    const idStr = `img-${Date.now()}`;
    document.execCommand("insertHTML", false, `<img id="${idStr}" src="${url}" class="wp-editor-image" style="max-width:100%; height:auto; border-radius:8px; margin: 20px 0; display:block; cursor:pointer;" />`);
    setTimeout(() => setEditorHtml(editorRef.current?.innerHTML || ""), 50);
  };

  const updatePage = async (newStatus: "draft" | "published") => {
    if (!title.trim()) { setNotice("❌ Title is required!"); return; }
    setSaving(true);
    setNotice("");

    const htmlContent = activeTab === "visual" ? (editorRef.current?.innerHTML || "") : textContent;
    const markdownContent = htmlToMarkdown(htmlContent);

    const { error } = await supabase.from("pages").update({
      title: title.trim(),
      content: markdownContent,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) {
      setNotice(`❌ Error: ${error.message}`);
      setSaving(false);
      return;
    }

    setNotice(`✅ Page updated successfully!`);
    setSaving(false);
    setTimeout(() => router.push("/admin/pages"), 1500);
  };

  const switchTab = (tab: "visual" | "text") => {
    if (tab === "text" && activeTab === "visual") setTextContent(editorRef.current?.innerHTML || "");
    if (tab === "visual" && activeTab === "text") if (editorRef.current) editorRef.current.innerHTML = textContent;
    setActiveTab(tab);
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading page...</div>;

  return (
    <div className={styles.wpWrap}>
      <div className={styles.wpHeader}>
        <h1 className={styles.wpTitle}>Edit Page</h1>
        {notice && <div className={styles.wpNotice}>{notice}</div>}
      </div>

      <div className={styles.wpPostBody}>
        <div className={styles.wpPostContent}>
          <div className={styles.wpTitleWrap}>
            <input
              type="text"
              placeholder="Add title"
              className={styles.wpTitleInput}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.wpEditorWrap}>
            <div className={styles.wpEditorTop}>
              <button type="button" className={styles.wpMediaBtn} onClick={() => setShowMediaLibrary(true)}>📷 Add Media</button>
              <div className={styles.wpEditorTabs}>
                <button type="button" className={`${styles.wpEditorTab} ${activeTab === "visual" ? styles.wpActiveTab : ""}`} onClick={() => switchTab("visual")}>Visual</button>
                <button type="button" className={`${styles.wpEditorTab} ${activeTab === "text" ? styles.wpActiveTab : ""}`} onClick={() => switchTab("text")}>Text</button>
              </div>
            </div>

            <div className={styles.wpToolbarWrap}>
              <div className={styles.wpToolbar}>
                <button type="button" className={styles.wpToolBtn} onMouseDown={e => { e.preventDefault(); exec("bold"); }}><strong>B</strong></button>
                <button type="button" className={styles.wpToolBtn} onMouseDown={e => { e.preventDefault(); exec("italic"); }}><em>I</em></button>
                <button type="button" className={styles.wpToolBtn} onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}>•≡</button>
                <button type="button" className={styles.wpToolBtn} onMouseDown={e => { e.preventDefault(); exec("formatBlock", "blockquote"); }}>&ldquo;</button>
              </div>
            </div>

            {activeTab === "visual" ? (
              <div
                ref={editorRef}
                className={styles.wpVisualEditor}
                contentEditable
                suppressContentEditableWarning
                onInput={() => setEditorHtml(editorRef.current?.innerHTML || "")}
                data-placeholder="Start writing your page here..."
              />
            ) : (
              <textarea
                className={styles.wpContentInput}
                rows={20}
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write HTML here..."
              />
            )}
          </div>
        </div>

        <div className={styles.wpSidebar}>
          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Publish</h2>
            <div className={styles.wpMetaBoxInside}>
              <div className={styles.wpPublishActions}>
                <button type="button" className={styles.wpButtonDefault} onClick={() => updatePage("draft")} disabled={saving}>Update Draft</button>
              </div>
              <div className={styles.wpPublishStatus}>
                <div className={styles.wpMiscPubSection}>Status: <strong>{status}</strong></div>
                <div className={styles.wpMiscPubSection}>Visibility: <strong>Public</strong></div>
              </div>
            </div>
            <div className={styles.wpPublishFooter}>
              <button type="button" className={styles.wpButtonPrimary} onClick={() => updatePage("published")} disabled={saving}>
                {saving ? "Updating..." : "Update Page"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMediaLibrary && (
        <MediaLibrary onSelect={handleMediaSelect} onClose={() => setShowMediaLibrary(false)} />
      )}
    </div>
  );
}
