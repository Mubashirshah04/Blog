"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "@/app/blog/[slug]/page.module.css";

export function CommentForm({ postId }: { postId: string }) {
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !name.trim() || !email.trim()) {
      setNotice({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setLoading(true);
    setNotice(null);

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      content: content.trim(),
      author_name: name.trim(),
      author_email: email.trim(),
      is_approved: false, // Default to false, needs admin approval
    });

    setLoading(false);

    if (error) {
      setNotice({ type: "error", text: `Failed to post comment: ${error.message}` });
    } else {
      setNotice({ type: "success", text: "Comment submitted! It will appear once approved by admin." });
      setContent("");
      setName("");
      setEmail("");
    }
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.commentHeading}>Leave a Comment</h3>
      <p className={styles.commentSub}>Your email address will not be published. Required fields are marked *</p>
      
      {notice && (
        <div style={{ 
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "1.5rem",
          backgroundColor: notice.type === "success" ? "#dcfce7" : "#fee2e2",
          color: notice.type === "success" ? "#166534" : "#991b1b",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          {notice.text}
        </div>
      )}

      <form className={styles.commentForm} onSubmit={handleSubmit}>
        <textarea 
          placeholder="Write your comment here..." 
          className={styles.commentArea} 
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        ></textarea>
        <div className={styles.formRow}>
          <input 
            type="text" 
            placeholder="Name *" 
            className={styles.inputField} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <input 
            type="email" 
            placeholder="Email *" 
            className={styles.inputField} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Submitting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
