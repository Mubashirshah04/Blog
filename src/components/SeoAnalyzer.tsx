"use client";
import { useMemo } from "react";
import styles from "./SeoAnalyzer.module.css";

interface SeoAnalyzerProps {
  title: string;
  content: string; // HTML content from editor
  metaDescription: string;
  focusKeyword: string;
  slug: string;
  featuredImage: string;
}

interface SeoCheck {
  id: string;
  label: string;
  status: "good" | "ok" | "bad";
  message: string;
}

function getTextFromHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function getReadingEase(text: string): number {
  const words = countWords(text);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const syllables = text.split(/[aeiouAEIOU]/).length;
  // Flesch Reading Ease approximation
  const ease = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.min(100, Math.max(0, ease));
}

function getKeywordDensity(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const words = text.toLowerCase().split(/\s+/);
  const kw = keyword.toLowerCase();
  const count = words.filter(w => w.includes(kw)).length;
  return (count / words.length) * 100;
}

export function SeoAnalyzer({ title, content, metaDescription, focusKeyword, slug, featuredImage }: SeoAnalyzerProps) {
  const checks: SeoCheck[] = useMemo(() => {
    const plainText = getTextFromHtml(content);
    const wordCount = countWords(plainText);
    const kw = focusKeyword.toLowerCase().trim();
    const titleLower = title.toLowerCase();
    const descLower = metaDescription.toLowerCase();
    const slugLower = slug.toLowerCase();
    const contentLower = plainText.toLowerCase();

    const hasH2 = content.includes("<h2");
    const hasH3 = content.includes("<h3");
    const hasLink = content.includes("<a ");
    const hasImage = content.includes("<img") || !!featuredImage;
    const imgHasAlt = content.match(/<img[^>]+alt="[^"]{3,}"/);
    const keyDensity = getKeywordDensity(plainText, kw);
    const readingEase = getReadingEase(plainText);
    const paragraphs = content.split(/<\/p>/i).filter(p => p.trim()).length;
    const firstParaText = plainText.substring(0, 200).toLowerCase();

    const list: SeoCheck[] = [
      // ---- FOCUS KEYWORD ----
      {
        id: "kw_set",
        label: "Focus Keyword",
        status: kw ? "good" : "bad",
        message: kw ? `Focus keyword: "${focusKeyword}"` : "Focus keyword set nahi hai — zaroor set karein"
      },
      {
        id: "kw_title",
        label: "Keyword in Title",
        status: !kw ? "bad" : titleLower.includes(kw) ? "good" : "bad",
        message: titleLower.includes(kw)
          ? "✓ Focus keyword title mein mojood hai"
          : "✗ Focus keyword title mein nahi — add karein"
      },
      {
        id: "kw_desc",
        label: "Keyword in Meta Description",
        status: !kw ? "bad" : descLower.includes(kw) ? "good" : "ok",
        message: descLower.includes(kw)
          ? "✓ Keyword meta description mein hai"
          : "⚠ Meta description mein keyword add karein"
      },
      {
        id: "kw_slug",
        label: "Keyword in URL Slug",
        status: !kw ? "bad" : slugLower.includes(kw.replace(/\s+/g, "-")) ? "good" : "ok",
        message: slugLower.includes(kw.replace(/\s+/g, "-"))
          ? "✓ Keyword slug mein hai"
          : "⚠ Slug mein keyword include karna behtar hoga"
      },
      {
        id: "kw_first_para",
        label: "Keyword in First Paragraph",
        status: !kw ? "bad" : firstParaText.includes(kw) ? "good" : "ok",
        message: firstParaText.includes(kw)
          ? "✓ Pehle paragraph mein keyword hai"
          : "⚠ Pehle 200 words mein focus keyword add karein"
      },
      {
        id: "kw_density",
        label: "Keyword Density",
        status: !kw ? "bad"
          : keyDensity >= 0.5 && keyDensity <= 2.5 ? "good"
          : keyDensity > 2.5 ? "ok" : "bad",
        message: !kw
          ? "Keyword set karein"
          : keyDensity > 2.5
          ? `⚠ Keyword density ${keyDensity.toFixed(1)}% — thodi zyada hai (max 2.5%)`
          : keyDensity >= 0.5
          ? `✓ Keyword density ${keyDensity.toFixed(1)}% — bilkul sahi`
          : `✗ Keyword density ${keyDensity.toFixed(1)}% — content mein zyada use karein`
      },

      // ---- TITLE ----
      {
        id: "title_length",
        label: "SEO Title Length",
        status: title.length >= 50 && title.length <= 60 ? "good"
          : title.length > 30 && title.length < 70 ? "ok" : "bad",
        message: title.length === 0
          ? "✗ Title likhen"
          : title.length < 30
          ? `✗ Title bahut chhota (${title.length} chars) — 50-60 chars ideal hai`
          : title.length > 70
          ? `⚠ Title thoda lamba (${title.length} chars) — 60 chars se kam rakhein`
          : `✓ Title length sahi hai (${title.length} chars)`
      },

      // ---- META DESCRIPTION ----
      {
        id: "meta_length",
        label: "Meta Description Length",
        status: metaDescription.length >= 120 && metaDescription.length <= 158 ? "good"
          : metaDescription.length > 60 ? "ok" : "bad",
        message: metaDescription.length === 0
          ? "✗ Meta description likhein — SEO ke liye zaroori hai"
          : metaDescription.length < 120
          ? `⚠ Meta description chhoti (${metaDescription.length} chars) — 120-158 chars chahiye`
          : metaDescription.length > 158
          ? `⚠ Meta description lambi (${metaDescription.length} chars) — 158 se kam rakhein`
          : `✓ Meta description bilkul sahi (${metaDescription.length} chars)`
      },

      // ---- CONTENT ----
      {
        id: "word_count",
        label: "Content Length",
        status: wordCount >= 1000 ? "good" : wordCount >= 300 ? "ok" : "bad",
        message: wordCount >= 1000
          ? `✓ Content lambi hai (${wordCount} words) — Google prefer karta hai`
          : wordCount >= 300
          ? `⚠ Content thodi chhoti (${wordCount} words) — 1000+ words behtar hain`
          : `✗ Content bahut chhoti (${wordCount} words) — kam se kam 300 words likhein`
      },
      {
        id: "headings",
        label: "Headings (H2/H3)",
        status: hasH2 && hasH3 ? "good" : hasH2 ? "ok" : "bad",
        message: hasH2 && hasH3
          ? "✓ H2 aur H3 headings use ki hain — bilkul sahi"
          : hasH2
          ? "⚠ H2 hai lekin H3 bhi add karein structure ke liye"
          : "✗ Content mein koi H2/H3 heading nahi — zaroor add karein"
      },
      {
        id: "links",
        label: "Internal/External Links",
        status: hasLink ? "good" : "ok",
        message: hasLink
          ? "✓ Links post mein add ki hain"
          : "⚠ Content mein koi link nahi — internal ya external links add karein"
      },
      {
        id: "image",
        label: "Featured Image",
        status: featuredImage ? "good" : "bad",
        message: featuredImage
          ? "✓ Featured image set hai"
          : "✗ Featured image set nahi — Google ke liye zaroori hai"
      },
      {
        id: "img_alt",
        label: "Image Alt Text",
        status: hasImage && imgHasAlt ? "good" : hasImage && !imgHasAlt ? "ok" : "bad",
        message: !hasImage
          ? "✗ Content mein koi image nahi"
          : imgHasAlt
          ? "✓ Images mein alt text hai"
          : "⚠ Images par alt text add karein accessibility ke liye"
      },
      {
        id: "reading_ease",
        label: "Readability",
        status: readingEase >= 60 ? "good" : readingEase >= 30 ? "ok" : "bad",
        message: wordCount < 50
          ? "Content aur likhein"
          : readingEase >= 60
          ? `✓ Reading ease acha hai (${readingEase.toFixed(0)}/100)`
          : readingEase >= 30
          ? `⚠ Thoda mushkil text (${readingEase.toFixed(0)}/100) — chhote sentences likhein`
          : `✗ Bahut complex text (${readingEase.toFixed(0)}/100) — simple rakhein`
      },
      {
        id: "paragraphs",
        label: "Paragraph Structure",
        status: paragraphs >= 5 ? "good" : paragraphs >= 2 ? "ok" : "bad",
        message: paragraphs >= 5
          ? `✓ Post mein ${paragraphs} paragraphs hain`
          : paragraphs >= 2
          ? `⚠ Sirf ${paragraphs} paragraphs — zyada tod ke likhein`
          : "✗ Content ko chhote paragraphs mein tod ke likhein"
      },
    ];

    return list;
  }, [title, content, metaDescription, focusKeyword, slug, featuredImage]);

  const goodCount = checks.filter(c => c.status === "good").length;
  const okCount = checks.filter(c => c.status === "ok").length;
  const badCount = checks.filter(c => c.status === "bad").length;
  const total = checks.length;
  const score = Math.round(((goodCount + okCount * 0.5) / total) * 100);

  const scoreColor = score >= 70 ? "#00a32a" : score >= 40 ? "#dba617" : "#d63638";
  const scoreLabel = score >= 70 ? "Good" : score >= 40 ? "Needs Work" : "Poor";

  return (
    <div className={styles.seoBox}>
      {/* Score Circle */}
      <div className={styles.seoHeader}>
        <div className={styles.seoScoreWrap}>
          <svg viewBox="0 0 36 36" className={styles.seoCircle}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#e0e0e0" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={scoreColor}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
            />
            <text x="18" y="20.35" className={styles.seoCircleText} fill={scoreColor}>{score}</text>
          </svg>
          <div>
            <div className={styles.seoScoreLabel} style={{ color: scoreColor }}>{scoreLabel}</div>
            <div className={styles.seoScoreSub}>SEO Score</div>
          </div>
        </div>

        <div className={styles.seoCounts}>
          <span className={styles.seoCountGood}>✓ {goodCount} Good</span>
          <span className={styles.seoCountOk}>⚠ {okCount} OK</span>
          <span className={styles.seoCountBad}>✗ {badCount} Fix</span>
        </div>
      </div>

      {/* Score Bar */}
      <div className={styles.seoBar}>
        <div className={styles.seoBarFill} style={{ width: `${score}%`, background: scoreColor }} />
      </div>

      {/* Checks List */}
      <div className={styles.seoChecks}>
        {/* Bad first */}
        {checks.filter(c => c.status === "bad").map(c => (
          <div key={c.id} className={`${styles.seoCheck} ${styles.seoBad}`}>
            <span className={styles.seoCheckIcon}>✗</span>
            <div>
              <div className={styles.seoCheckLabel}>{c.label}</div>
              <div className={styles.seoCheckMsg}>{c.message}</div>
            </div>
          </div>
        ))}
        {/* OK */}
        {checks.filter(c => c.status === "ok").map(c => (
          <div key={c.id} className={`${styles.seoCheck} ${styles.seoOk}`}>
            <span className={styles.seoCheckIcon}>⚠</span>
            <div>
              <div className={styles.seoCheckLabel}>{c.label}</div>
              <div className={styles.seoCheckMsg}>{c.message}</div>
            </div>
          </div>
        ))}
        {/* Good */}
        {checks.filter(c => c.status === "good").map(c => (
          <div key={c.id} className={`${styles.seoCheck} ${styles.seoGood}`}>
            <span className={styles.seoCheckIcon}>✓</span>
            <div>
              <div className={styles.seoCheckLabel}>{c.label}</div>
              <div className={styles.seoCheckMsg}>{c.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
