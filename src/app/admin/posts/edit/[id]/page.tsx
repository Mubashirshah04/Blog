"use client";
import styles from "../../new/createPost.module.css";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { SeoAnalyzer } from "@/components/SeoAnalyzer";
import { AiDetector } from "@/components/AiDetector";
import { MediaLibrary } from "@/components/MediaLibrary";
import { marked } from "marked";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
});

// Preserve image alignment classes
turndownService.addRule('img-align', {
  filter: ['img'],
  replacement: (content, node) => {
    const img = node as HTMLImageElement;
    const classes = img.getAttribute('class');
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || "";
    const style = img.getAttribute('style');
    const width = img.getAttribute('width');

    if (classes || style || width) {
      return `<img src="${src}" alt="${alt}" ${classes ? `class="${classes}"` : ""} ${style ? `style="${style}"` : ""} ${width ? `width="${width}"` : ""} />`;
    }
    return `![${alt}](${src})`;
  }
});

// Preserve line breaks and gaps
turndownService.addRule('keep-br', {
  filter: ['br'],
  replacement: () => '<br/>'
});

turndownService.addRule('keep-p-gap', {
  filter: (node) => node.nodeName === 'P' && (node.innerHTML === '<br>' || node.innerHTML === '&nbsp;' || node.innerHTML === ''),
  replacement: () => '\n\n<br/>\n\n'
});

type Category = { id: string; name: string; slug: string; parent_id: string | null };

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

// Convert HTML to markdown using Turndown for robustness
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndownService.turndown(html);
}

// Convert Markdown to HTML using marked for editor
function markdownToHtml(md: string): string {
  if (!md) return "";
  return marked.parse(md) as string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const editorRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryMode, setMediaLibraryMode] = useState<"featured" | "editor">("featured");
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [imageToolbarPos, setImageToolbarPos] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"visual" | "text">("visual");
  const [textContent, setTextContent] = useState("");
  const [postStatus, setPostStatus] = useState<"draft" | "published">("draft");
  const [slug, setSlug] = useState("");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const savedSelection = useRef<Range | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("sort_order", { ascending: true });
      if (cats) setCategories(cats);

      // Fetch post
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !post) {
        setNotice("❌ Post not found!");
        setLoading(false);
        return;
      }

      setTitle(post.title);
      setCategory(post.category || "");
      setTags(post.tags ? post.tags.join(", ") : "");
      setFeaturedImage(post.featured_image || "");
      setExcerpt(post.excerpt || "");
      setFocusKeyword(post.focus_keyword || "");
      setSeoTitle(post.seo_title || "");
      setMetaDesc(post.meta_description || "");
      setPostStatus(post.status);
      setSlug(post.slug);
      
      const html = markdownToHtml(post.content);
      setEditorHtml(html);
      setTextContent(html);
      
      // Delay setting editor content to ensure ref is ready
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          updateWordCount();
        }
      }, 100);

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
      const text = sel.toString();
      setLinkText(text);
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelection.current);
    }
  };

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateWordCount();
  }, []);

  const updateWordCount = () => {
    const text = editorRef.current?.innerText || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const applyHeading = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    updateWordCount();
  };

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();
    const url = linkUrl.trim();
    const text = linkText.trim() || url;
    
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
    }
    
    if (editorRef.current) {
      editorRef.current.querySelectorAll("a").forEach(a => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    }

    setShowLinkPopup(false);
    setLinkUrl("");
    setLinkText("");
    updateWordCount();
  };

  const removeLink = () => {
    editorRef.current?.focus();
    document.execCommand("unlink", false);
  };

  const insertImage = () => {
    setMediaLibraryMode("editor");
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaLibraryMode === "featured") {
      setFeaturedImage(url);
    } else {
      editorRef.current?.focus();
      const idStr = `img-${Date.now()}`;
      document.execCommand("insertHTML", false, `<img id="${idStr}" src="${url}" class="wp-editor-image aligncenter" style="max-width:100%; height:auto;" />`);
      
      setTimeout(() => {
        setEditorHtml(editorRef.current?.innerHTML || "");
      }, 50);
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const rect = target.getBoundingClientRect();
      const editorRect = editorRef.current?.getBoundingClientRect();
      
      if (editorRect) {
        setSelectedImage(target as HTMLImageElement);
        setImageToolbarPos({
          top: rect.top - editorRect.top + editorRef.current!.scrollTop - 45,
          left: rect.left - editorRect.left + (rect.width / 2) - 100
        });
        setShowImageToolbar(true);
      }
    } else {
      setShowImageToolbar(false);
      setSelectedImage(null);
    }
  };

  const updateImageAlignment = (align: 'alignleft' | 'alignright' | 'aligncenter') => {
    if (!selectedImage) return;
    selectedImage.classList.remove('alignleft', 'alignright', 'aligncenter');
    selectedImage.classList.add(align);
    
    // Clear margins that might have been set by the old system
    selectedImage.style.marginLeft = '';
    selectedImage.style.marginRight = '';
    selectedImage.style.display = align === 'aligncenter' ? 'block' : '';
    
    setEditorHtml(editorRef.current?.innerHTML || "");
  };

  const updateImageWidth = (width: string) => {
    if (!selectedImage) return;
    selectedImage.style.width = width;
    setEditorHtml(editorRef.current?.innerHTML || "");
  };

  const removeImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setShowImageToolbar(false);
    setSelectedImage(null);
    setEditorHtml(editorRef.current?.innerHTML || "");
  };

  const switchTab = (tab: "visual" | "text") => {
    if (tab === "text" && activeTab === "visual") {
      setTextContent(editorRef.current?.innerHTML || "");
    }
    if (tab === "visual" && activeTab === "text") {
      if (editorRef.current) editorRef.current.innerHTML = textContent;
    }
    setActiveTab(tab);
  };

  const updatePost = async (saveStatus: "draft" | "published") => {
    if (!title.trim()) { setNotice("❌ Title zaroori hai!"); return; }
    setSaving(true);
    setNotice("");

    const htmlContent = activeTab === "visual"
      ? (editorRef.current?.innerHTML || "")
      : textContent;
    const markdownContent = htmlToMarkdown(htmlContent);

    const postData = {
      title: title.trim(),
      content: markdownContent,
      excerpt: excerpt || (editorRef.current?.innerText || "").substring(0, 160),
      featured_image: featuredImage || null,
      category: category || null,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      status: saveStatus,
      focus_keyword: focusKeyword,
      seo_title: seoTitle,
      meta_description: metaDesc,
      slug: slug.trim() || slugify(title),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("posts")
      .update(postData)
      .eq("id", id);

    if (error) {
      setNotice(`❌ Error: ${error.message}`);
      setSaving(false);
      return;
    }

    setNotice(`✅ Post updated successfully!`);
    setSaving(false);
    setTimeout(() => router.push("/admin/posts"), 1500);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const existing = tags ? tags.split(",").map(t => t.trim()) : [];
    if (!existing.includes(tagInput.trim())) {
      setTags([...existing, tagInput.trim()].filter(Boolean).join(", "));
    }
    setTagInput("");
  };

  const moveToTrash = async () => {
    if (!confirm("Are you sure you want to move this post to trash?")) return;
    setSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({ status: "trash" })
      .eq("id", id);

    if (error) {
      setNotice(`❌ Error: ${error.message}`);
      setSaving(false);
      return;
    }
    router.push("/admin/posts");
  };

  if (loading) return <div className={styles.wpWrap} style={{ padding: "2rem" }}>Loading post...</div>;

  const parentCats = categories.filter(c => !c.parent_id);
  const getSubcats = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <div className={styles.wpWrap}>
      <div className={styles.wpHeader}>
        <h1 className={styles.wpTitle}>Edit Post</h1>
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

          <div className={styles.wpPermalinkWrap}>
            <strong>Permalink:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/blog/
            {isEditingSlug ? (
              <span className={styles.wpSlugEditBox}>
                <input
                  type="text"
                  className={styles.wpSlugInput}
                  value={slug}
                  onChange={e => setSlug(slugify(e.target.value))}
                  onBlur={() => setIsEditingSlug(false)}
                  onKeyDown={e => e.key === "Enter" && setIsEditingSlug(false)}
                  autoFocus
                />
                <button className={styles.wpButton} onClick={() => setIsEditingSlug(false)}>OK</button>
              </span>
            ) : (
              <span className={styles.wpSlugValue}>
                {slug}
                <button className={styles.wpButton} onClick={() => setIsEditingSlug(true)}>Edit</button>
              </span>
            )}
          </div>

          <div className={styles.wpEditorWrap}>
            <div className={styles.wpEditorTop}>
              <button type="button" className={styles.wpMediaBtn} onClick={insertImage}>
                <span className={styles.wpMediaIcon}>📷</span> Add Media
              </button>
              <div className={styles.wpEditorTabs}>
                <button
                  type="button"
                  className={`${styles.wpEditorTab} ${activeTab === "visual" ? styles.wpActiveTab : ""}`}
                  onClick={() => switchTab("visual")}
                >Visual</button>
                <button
                  type="button"
                  className={`${styles.wpEditorTab} ${activeTab === "text" ? styles.wpActiveTab : ""}`}
                  onClick={() => switchTab("text")}
                >Text</button>
              </div>
            </div>

            <div className={styles.wpToolbarWrap}>
              <div className={styles.wpToolbar}>
                <div className={styles.wpToolbarGroup}>
                  <select className={styles.wpFormatSelect} onChange={e => { applyHeading(e.target.value); e.target.value = ""; }}>
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="pre">Preformatted</option>
                  </select>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button type="button" className={styles.wpToolBtn} title="Bold" onMouseDown={e => { e.preventDefault(); exec("bold"); }}><strong>B</strong></button>
                  <button type="button" className={styles.wpToolBtn} title="Italic" onMouseDown={e => { e.preventDefault(); exec("italic"); }}><em>I</em></button>
                  <button type="button" className={styles.wpToolBtn} title="Underline" onMouseDown={e => { e.preventDefault(); exec("underline"); }}><u>U</u></button>
                  <button type="button" className={styles.wpToolBtn} title="Strikethrough" onMouseDown={e => { e.preventDefault(); exec("strikeThrough"); }}><del>S</del></button>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button type="button" className={styles.wpToolBtn} title="Bulleted list" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}>•≡</button>
                  <button type="button" className={styles.wpToolBtn} title="Numbered list" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }}>1≡</button>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button type="button" className={styles.wpToolBtn} title="Align left" onMouseDown={e => { e.preventDefault(); exec("justifyLeft"); }}>⬅</button>
                  <button type="button" className={styles.wpToolBtn} title="Align center" onMouseDown={e => { e.preventDefault(); exec("justifyCenter"); }}>≡</button>
                  <button type="button" className={styles.wpToolBtn} title="Align right" onMouseDown={e => { e.preventDefault(); exec("justifyRight"); }}>➡</button>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button type="button" className={styles.wpToolBtn} title="Blockquote" onMouseDown={e => { e.preventDefault(); exec("formatBlock", "blockquote"); }}>&ldquo;</button>
                  <button type="button" className={styles.wpToolBtn} title="Horizontal Rule" onMouseDown={e => { e.preventDefault(); exec("insertHorizontalRule"); }}>—</button>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button
                    type="button"
                    className={`${styles.wpToolBtn} ${showLinkPopup ? styles.wpToolBtnActive : ""}`}
                    title="Insert/edit link"
                    onMouseDown={e => {
                      e.preventDefault();
                      saveSelection();
                      setShowLinkPopup(!showLinkPopup);
                    }}
                  >🔗</button>
                  <button type="button" className={styles.wpToolBtn} title="Remove link" onMouseDown={e => { e.preventDefault(); removeLink(); }}>🚫</button>
                </div>

                <div className={styles.wpToolbarGroup}>
                  <button type="button" className={styles.wpToolBtn} title="Undo" onMouseDown={e => { e.preventDefault(); exec("undo"); }}>↩</button>
                  <button type="button" className={styles.wpToolBtn} title="Redo" onMouseDown={e => { e.preventDefault(); exec("redo"); }}>↪</button>
                </div>
              </div>

              {showLinkPopup && (
                <div className={styles.wpLinkPopupBox}>
                  <div className={styles.wpLinkPopupTitle}>Insert / Edit Link</div>
                  <div className={styles.wpLinkRow}>
                    <label className={styles.wpLinkLabel}>Link Text</label>
                    <input
                      type="text"
                      className={styles.wpLinkField}
                      value={linkText}
                      onChange={e => setLinkText(e.target.value)}
                      placeholder="Click here"
                    />
                  </div>
                  <div className={styles.wpLinkRow}>
                    <label className={styles.wpLinkLabel}>URL</label>
                    <input
                      type="text"
                      className={styles.wpLinkField}
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && applyLink()}
                    />
                  </div>
                  <div className={styles.wpLinkActions}>
                    <button type="button" className={styles.wpButtonPrimary} onClick={applyLink}>Apply</button>
                    <button type="button" className={styles.wpButtonDefault} onClick={() => { setShowLinkPopup(false); setLinkUrl(""); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              {showImageToolbar && (
                <div 
                  className={styles.wpImageToolbar}
                  style={{ top: imageToolbarPos.top, left: imageToolbarPos.left }}
                >
                  <button type="button" onClick={() => updateImageWidth('25%')}>25%</button>
                  <button type="button" onClick={() => updateImageWidth('33%')}>33%</button>
                  <button type="button" onClick={() => updateImageWidth('50%')}>50%</button>
                  <button type="button" onClick={() => updateImageWidth('100%')}>100%</button>
                  <div className={styles.wpToolbarDivider} />
                  <button type="button" onClick={() => updateImageAlignment('alignleft')}>⬅</button>
                  <button type="button" onClick={() => updateImageAlignment('aligncenter')}>≡</button>
                  <button type="button" onClick={() => updateImageAlignment('alignright')}>➡</button>
                  <div className={styles.wpToolbarDivider} />
                  <button type="button" className={styles.wpDeleteBtn} onClick={removeImage}>🗑️</button>
                </div>
              )}

              {activeTab === "visual" ? (
                <div
                  ref={editorRef}
                  className={styles.wpVisualEditor}
                  contentEditable
                  suppressContentEditableWarning
                  onClick={handleEditorClick}
                  onInput={() => {
                    setEditorHtml(editorRef.current?.innerHTML || "");
                    const text = editorRef.current?.innerText || "";
                    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
                  }}
                  data-placeholder="Start writing your post here..."
                />
              ) : (
                <textarea
                  className={styles.wpContentInput}
                  rows={20}
                  value={textContent}
                  onChange={e => {
                    setTextContent(e.target.value);
                    setEditorHtml(e.target.value);
                  }}
                  placeholder="Write HTML here..."
                />
              )}
            </div>

            <div className={styles.wpWordCount}>Word count: {wordCount}</div>
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Excerpt</h2>
            <div className={styles.wpMetaBoxInside}>
              <textarea rows={3} className={styles.wpInput} placeholder="Short description (optional)" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            </div>
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>SEO Settings</h2>
            <div className={styles.wpMetaBoxInside}>
              <div className={styles.wpFormGroup}>
                <label className={styles.wpLabel}>Focus Keyword</label>
                <input
                  type="text"
                  className={styles.wpInput}
                  value={focusKeyword}
                  onChange={e => setFocusKeyword(e.target.value)}
                  placeholder="e.g. ai tools 2024"
                  style={{ borderColor: focusKeyword ? '#2271b1' : undefined }}
                />
              </div>
              <div className={styles.wpFormGroup}>
                <label className={styles.wpLabel}>SEO Title</label>
                <input type="text" className={styles.wpInput} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title} />
              </div>
              <div className={styles.wpFormGroup}>
                <label className={styles.wpLabel}>Meta Description</label>
                <textarea rows={3} className={styles.wpInput} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.wpSidebar}>
          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Publish</h2>
            <div className={styles.wpMetaBoxInside}>
              <div className={styles.wpPublishActions}>
                <button type="button" className={styles.wpButtonDefault} onClick={() => updatePost("draft")} disabled={saving}>
                  {saving ? "Updating..." : "Update Draft"}
                </button>
              </div>
              <div className={styles.wpPublishStatus}>
                <div className={styles.wpMiscPubSection}><span className={styles.wpIcon}>📌</span> Status: <strong>{postStatus}</strong></div>
                <div className={styles.wpMiscPubSection}><span className={styles.wpIcon}>👁️</span> Visibility: <strong>Public</strong></div>
              </div>
            </div>
            <div className={styles.wpPublishFooter}>
              <button type="button" className={styles.wpDeleteLink} onClick={moveToTrash} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} disabled={saving}>
                Move to Trash
              </button>
              <button type="button" className={styles.wpButtonPrimary} onClick={() => updatePost("published")} disabled={saving}>
                {saving ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Categories</h2>
            <div className={styles.wpMetaBoxInside}>
              <ul className={styles.wpCategoryList}>
                {parentCats.map(cat => (
                  <React.Fragment key={cat.id}>
                    <li><label><input type="radio" name="category" value={cat.name} checked={category === cat.name} onChange={() => setCategory(cat.name)} /> <strong>{cat.name}</strong></label></li>
                    {getSubcats(cat.id).map(sub => (
                      <li key={sub.id} style={{ paddingLeft: "1.25rem" }}>
                        <label><input type="radio" name="category" value={sub.name} checked={category === sub.name} onChange={() => setCategory(sub.name)} /> {sub.name}</label>
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>🎯 SEO Analysis</h2>
            <SeoAnalyzer
              title={seoTitle || title}
              content={editorHtml}
              metaDescription={metaDesc}
              focusKeyword={focusKeyword}
              slug={slugify(title)}
              featuredImage={featuredImage}
            />
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>🤖 AI Detector</h2>
            <AiDetector content={editorHtml} />
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Tags</h2>
            <div className={styles.wpMetaBoxInside}>
              <div className={styles.wpTagInputWrap}>
                <input type="text" className={styles.wpInput} style={{ width: "70%" }} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Tag name" />
                <button type="button" className={styles.wpButtonDefault} onClick={addTag}>Add</button>
              </div>
              {tags && (
                <div className={styles.wpTagsList}>
                  {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className={styles.wpTag}>{t} <button onClick={() => setTags(tags.split(",").filter(x => x.trim() !== t).join(", "))}>✕</button></span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.wpMetaBox}>
            <h2 className={styles.wpMetaBoxTitle}>Featured Image</h2>
            <div className={styles.wpMetaBoxInside}>
              {featuredImage ? (
                <div>
                  <img src={featuredImage} alt="Featured" style={{ width: "100%", borderRadius: 4, marginBottom: 8 }} />
                  <button className={styles.wpDeleteLink} onClick={() => setFeaturedImage("")}>Remove image</button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className={styles.wpButtonDefault} 
                  style={{ width: "100%" }}
                  onClick={() => {
                    setMediaLibraryMode("featured");
                    setShowMediaLibrary(true);
                  }}
                >
                  Set featured image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMediaLibrary && (
        <MediaLibrary 
          onSelect={handleMediaSelect} 
          onClose={() => setShowMediaLibrary(false)} 
        />
      )}
    </div>
  );
}
