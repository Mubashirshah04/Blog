import Link from "next/link";
import styles from "./adminLayout.module.css";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wpAdminContainer}>
      <aside className={styles.wpSidebar}>
        <div className={styles.wpSidebarHeader}>
          <h2 className={styles.wpSiteTitle}>MagTech <span className={styles.wpSiteIcon}>Dashboard</span></h2>
        </div>
        
        <nav className={styles.wpNav}>
          <Link href="/admin" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>📊</span> Dashboard
          </Link>
          <Link href="/admin/studio" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>🎨</span> Studio
          </Link>
          
          <div className={styles.wpMenuSeparator}></div>
          
          <Link href="/admin/posts" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>📌</span> Posts
          </Link>
          <div className={styles.wpSubMenu}>
            <Link href="/admin/posts" className={styles.wpSubNavLink}>All Posts</Link>
            <Link href="/admin/posts/new" className={styles.wpSubNavLink}>Add New Post</Link>
            <Link href="/admin/categories" className={styles.wpSubNavLink}>Categories</Link>
            <Link href="/admin/tags" className={styles.wpSubNavLink}>Tags</Link>
          </div>
          
          <Link href="/admin/media" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>📸</span> Media
          </Link>
          <Link href="/admin/pages" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>📄</span> Pages
          </Link>
          <div className={styles.wpSubMenu}>
            <Link href="/admin/pages" className={styles.wpSubNavLink}>All Pages</Link>
            <Link href="/admin/pages/new" className={styles.wpSubNavLink}>Add New</Link>
          </div>
          <Link href="/admin/comments" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>💬</span> Comments
          </Link>
          
          <div className={styles.wpMenuSeparator}></div>
          
          <Link href="/admin/appearance" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>🎨</span> Appearance
          </Link>
          <Link href="/admin/plugins" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>🔌</span> Plugins
          </Link>
          <Link href="/admin/users" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>👥</span> Users
          </Link>
          <Link href="/admin/settings" className={styles.wpNavLink}>
            <span className={styles.wpIcon}>⚙️</span> Settings
          </Link>
          <div className={styles.wpSubMenu}>
             <Link href="/admin/settings/general" className={styles.wpSubNavLink}>General</Link>
             <Link href="/admin/settings/reading" className={styles.wpSubNavLink}>Reading</Link>
          </div>
        </nav>
      </aside>
      
      <div className={styles.wpMainContainer}>
        <div className={styles.wpTopBar}>
          <div className={styles.wpTopLeft}>
            {/* Links removed as per user request */}
          </div>
          <div className={styles.wpTopRight}>
            {/* User info removed as per request */}
          </div>
        </div>
        
        <main className={styles.wpMainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
