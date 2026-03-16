"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./AdminBar.module.css";

export function AdminBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") setIsAdmin(true);
    };
    check();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!isAdmin) return null;

  return (
    <div className={styles.adminBar}>
      <div className={styles.adminBarInner}>
        {/* Left side */}
        <div className={styles.adminBarLeft}>
          {/* WP Logo / Site Name */}
          <div className={styles.adminBarItem}>
            <Link href="/admin" className={styles.adminBarLink}>
              <span className={styles.wpIcon}>⚡</span>
              <span className={styles.siteName}>Digital Info</span>
            </Link>
            <div className={styles.subMenu}>
              <Link href="/admin" className={styles.subMenuItem}>Dashboard</Link>
              <Link href="/" className={styles.subMenuItem}>Visit Site</Link>
            </div>
          </div>

          {/* Dashboard */}
          <div className={styles.adminBarItem}>
            <Link href="/admin" className={styles.adminBarLink}>
              Dashboard
            </Link>
          </div>

          {/* Posts */}
          <div className={styles.adminBarItem}>
            <Link href="/admin/posts" className={styles.adminBarLink}>
              Posts
            </Link>
            <div className={styles.subMenu}>
              <Link href="/admin/posts" className={styles.subMenuItem}>All Posts</Link>
              <Link href="/admin/posts/new" className={styles.subMenuItem}>Add New Post</Link>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.adminBarItem}>
            <Link href="/admin/categories" className={styles.adminBarLink}>
              Categories
            </Link>
            <div className={styles.subMenu}>
              <Link href="/admin/categories" className={styles.subMenuItem}>All Categories</Link>
            </div>
          </div>

          {/* New */}
          <div className={`${styles.adminBarItem} ${styles.newItem}`}>
            <button
              className={styles.adminBarLink}
              onClick={() => setNewPostOpen(!newPostOpen)}
            >
              + New
            </button>
            <div className={styles.subMenu}>
              <Link href="/admin/posts/new" className={styles.subMenuItem}>Post</Link>
              <Link href="/admin/categories" className={styles.subMenuItem}>Category</Link>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className={styles.adminBarRight}>
          {/* Howdy Admin */}
          <div className={styles.adminBarItem}>
            <span className={styles.adminBarLink}>
              <span className={styles.avatar}>👤</span>
              Howdy, Admin
            </span>
            <div className={`${styles.subMenu} ${styles.subMenuRight}`}>
              <Link href="/admin" className={styles.subMenuItem}>Edit Profile</Link>
              <button onClick={handleLogout} className={styles.subMenuLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
