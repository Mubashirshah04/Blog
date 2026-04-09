"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import styles from "./Navbar.module.css";
import { createClient } from "@/utils/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  subcategories?: Category[];
};

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("sort_order", { ascending: true });

      if (!data) return;

      // Build parent -> children tree
      const parents = data.filter(c => !c.parent_id);
      const tree = parents.map(parent => ({
        ...parent,
        subcategories: data.filter(c => c.parent_id === parent.id),
      }));
      setCategories(tree);
    };
    fetchCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className={`${styles.header} glass-effect`} style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div className={styles.container}>
        <div className={styles.logoAndNav}>
          <Link href="/" className={styles.logo}>
            Shah<span className={styles.accent}>Insights</span>
          </Link>

          <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileOpen : ""}`} ref={dropdownRef}>
            <Link href="/" className={styles.navLink}>Home</Link>

            {categories.map(cat => (
              <div
                key={cat.id}
                className={styles.dropdownContainer}
                onMouseEnter={() => setOpenDropdown(cat.slug)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={`${styles.navLink} ${styles.dropdownTrigger}`}
                >
                  {cat.name} <span className={styles.chevron}>▾</span>
                </Link>

                {openDropdown === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className={styles.megaMenu}>
                    <div className={styles.megaMenuHeader}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className={styles.megaMenuTitle}
                        onClick={() => setOpenDropdown(null)}
                      >
                        All {cat.name} →
                      </Link>
                    </div>
                    <div className={styles.megaMenuGrid}>
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className={styles.megaMenuItem}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.actions}>
          <form className={styles.searchForm} action="/search">
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <SearchIcon />
            </button>
          </form>

          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}
