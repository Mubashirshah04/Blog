"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import { trashPost, bulkTrashPosts, restorePost, deletePostPermanently } from "./actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
};

interface PostListProps {
  initialPosts: Post[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleTrash = async (id: string) => {
    if (!confirm("Are you sure you want to move this post to trash?")) return;
    
    setLoadingIds(prev => new Set(prev).add(id));
    const result = await trashPost(id);
    if (result.success) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'trash' } : p));
    } else {
      alert("Error: " + result.error);
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRestore = async (id: string) => {
    setLoadingIds(prev => new Set(prev).add(id));
    const result = await restorePost(id);
    if (result.success) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'draft' } : p));
    } else {
      alert("Error: " + result.error);
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeletePermanently = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this post? This cannot be undone.")) return;
    
    setLoadingIds(prev => new Set(prev).add(id));
    const result = await deletePostPermanently(id);
    if (result.success) {
      setPosts(prev => prev.filter(p => p.id !== id));
    } else {
      alert("Error: " + result.error);
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkApply = async () => {
    if (selectedIds.length === 0) return;

    if (bulkAction === "trash") {
      if (!confirm(`Are you sure you want to move ${selectedIds.length} posts to trash?`)) return;
      
      const result = await bulkTrashPosts(selectedIds);
      if (result.success) {
        setPosts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'trash' } : p));
        setSelectedIds([]);
        setBulkAction("");
      } else {
        alert("Error: " + result.error);
      }
    } else if (bulkAction === "restore") {
      const result = await Promise.all(selectedIds.map(id => restorePost(id)));
      if (result.every(r => r.success)) {
        setPosts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'draft' } : p));
        setSelectedIds([]);
        setBulkAction("");
      } else {
        alert("Some posts could not be restored.");
      }
    } else if (bulkAction === "delete") {
      if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedIds.length} posts?`)) return;
      const result = await Promise.all(selectedIds.map(id => deletePostPermanently(id)));
      if (result.every(r => r.success)) {
        setPosts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setBulkAction("");
      } else {
        alert("Some posts could not be deleted.");
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <>
      {/* Tablenav top */}
      <div className={styles.wpTablenav}>
        <div className={styles.wpAlignleft}>
          <select 
            className={styles.wpSelect} 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Bulk Actions</option>
            <option value="trash">Move to Trash</option>
            <option value="restore">Restore</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button 
            className={styles.wpButton} 
            style={{ marginLeft: 6 }}
            onClick={handleBulkApply}
            disabled={!bulkAction || selectedIds.length === 0}
          >
            Apply
          </button>
        </div>
        <div className={styles.wpTablenavPages}>
          <span className={styles.wpDisplayingNum}>
            {posts.length} {posts.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Table */}
      <table className={styles.wpListTable}>
        <thead>
          <tr>
            <th className={styles.wpCheckColumn}>
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={selectedIds.length === posts.length && posts.length > 0}
              />
            </th>
            <th className={styles.wpColumnTitle}>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#646970" }}>
                No posts found. <Link href="/admin/posts/new" style={{ color: "#2271b1" }}>Create your first post →</Link>
              </td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={`${index % 2 !== 0 ? styles.wpAlternateRow : ""} ${loadingIds.has(post.id) ? styles.wpRowLoading : ""}`}>
                <td className={styles.wpCheckColumn}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(post.id)}
                    onChange={() => handleSelectOne(post.id)}
                  />
                </td>
                <td className={styles.wpColumnTitle}>
                  <strong>
                    <Link href={`/blog/${post.slug}`} className={styles.wpRowTitle}>
                      {post.title}
                    </Link>
                    {post.status === "draft" && (
                      <span className={styles.wpPostState}> — Draft</span>
                    )}
                    {post.status === "trash" && (
                      <span className={styles.wpPostState} style={{ color: '#d63638' }}> — Trash</span>
                    )}
                  </strong>
                  <div className={styles.wpRowActions}>
                    {post.status !== 'trash' ? (
                      <>
                        <span><Link href={`/admin/posts/edit/${post.id}`}>Edit</Link> | </span>
                        <span>
                          <button 
                            onClick={() => handleTrash(post.id)}
                            style={{ color: "#d63638", background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                          >
                            Trash
                          </button> | 
                        </span>
                        <span><Link href={`/blog/${post.slug}`} target="_blank">View</Link></span>
                      </>
                    ) : (
                      <>
                        <span><button onClick={() => handleRestore(post.id)} style={{ color: "#2271b1", background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Restore</button> | </span>
                        <span><button onClick={() => handleDeletePermanently(post.id)} style={{ color: "#d63638", background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Delete Permanently</button></span>
                      </>
                    )}
                  </div>
                </td>
                <td>{post.category || "—"}</td>
                <td>
                  <span className={`${styles.wpStatusBadge} ${
                    post.status === "published" ? styles.wpStatusPublished : 
                    post.status === "trash" ? styles.wpStatusTrash : 
                    styles.wpStatusDraft
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td>
                  {post.status === "published"
                    ? `Published\n${formatDate(post.published_at!)}`
                    : `Last Modified\n${formatDate(post.created_at)}`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
