"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./comments.module.css";
import Link from "next/link";

type Comment = {
  id: string;
  post_id: string;
  content: string;
  author_name: string;
  author_email: string;
  is_approved: boolean;
  created_at: string;
  posts: { title: string; slug: string } | null;
};

export default function AdminComments() {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        posts (title, slug)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleApprove = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: !currentStatus })
      .eq("id", id);

    if (error) {
      setNotice("❌ Error updating status");
    } else {
      setNotice(`✅ Comment ${!currentStatus ? "approved" : "unapproved"}`);
      fetchComments();
    }
    setTimeout(() => setNotice(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      setNotice("❌ Error deleting comment");
    } else {
      setNotice("✅ Comment deleted");
      fetchComments();
    }
    setTimeout(() => setNotice(""), 3000);
  };

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString("en-US", { 
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
    });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Comments Management</h1>
        {notice && <div className={styles.notice}>{notice}</div>}
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}>No comments found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Author</th>
                <th>Comment</th>
                <th>In Response To</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className={!comment.is_approved ? styles.pendingRow : ""}>
                  <td className={styles.authorCol}>
                    <strong>{comment.author_name}</strong>
                    <br />
                    <span>{comment.author_email}</span>
                  </td>
                  <td className={styles.contentCol}>
                    <div className={styles.contentScroll}>{comment.content}</div>
                  </td>
                  <td className={styles.postCol}>
                    <Link href={`/blog/${comment.posts?.slug || ""}`} target="_blank">
                      {comment.posts?.title || "Unknown Post"}
                    </Link>
                  </td>
                  <td>{formatDate(comment.created_at)}</td>
                  <td>
                    <span className={comment.is_approved ? styles.statusApproved : styles.statusPending}>
                      {comment.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className={styles.actionsCol}>
                    <button 
                      className={comment.is_approved ? styles.unapproveBtn : styles.approveBtn}
                      onClick={() => handleApprove(comment.id, comment.is_approved)}
                    >
                      {comment.is_approved ? "Unapprove" : "Approve"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(comment.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
