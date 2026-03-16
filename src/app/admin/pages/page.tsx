"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./pages.module.css";
import Link from "next/link";

type Page = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
};

export default function AdminPages() {
  const supabase = createClient();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching pages:", error);
      setNotice(`❌ Error: ${error.message}`);
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    const { error } = await supabase.from("pages").delete().eq("id", id);

    if (error) {
      setNotice("❌ Error deleting page");
    } else {
      setNotice("✅ Page deleted successfully");
      fetchPages();
    }
    setTimeout(() => setNotice(""), 3000);
  };

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pages</h1>
        <Link href="/admin/pages/new" className={styles.addNewBtn}>Add New</Link>
      </div>

      {notice && <div className={styles.notice}>{notice}</div>}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className={styles.empty}>
            No pages found. <Link href="/admin/pages/new">Create one</Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className={styles.titleCol}>
                    <Link href={`/admin/pages/edit/${page.id}`} className={styles.pageTitle}>
                      {page.title}
                    </Link>
                    <div className={styles.rowActions}>
                      <Link href={`/admin/pages/edit/${page.id}`}>Edit</Link> | 
                      <Link href={`/${page.slug}`} target="_blank">View</Link> | 
                      <button onClick={() => handleDelete(page.id)} className={styles.deleteBtn}>Trash</button>
                    </div>
                  </td>
                  <td>Admin</td>
                  <td>
                    Published<br />
                    {formatDate(page.created_at)}
                  </td>
                  <td>
                    <span className={page.status === 'published' ? styles.statusPub : styles.statusDraft}>
                      {page.status}
                    </span>
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
