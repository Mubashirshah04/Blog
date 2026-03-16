"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

// Mock database search function
const searchPosts = (query: string) => {
  if (!query) return [];
  const q = query.toLowerCase();
  const allPosts = [
    { id: 1, title: "The Future of AI: How Agents Will Reshape Web Development by 2030", excerpt: "Discover the revolutionary impact of autonomous AI agents on the software engineering landscape.", category: "AI Tools", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600", slug: "future-of-ai-agents" },
    { id: 2, title: "Top 10 Crypto Projects to Watch Before the Next Halving", excerpt: "An in-depth analysis of the most promising cryptocurrency projects.", category: "Crypto", image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600", slug: "top-10-crypto-projects" },
    { id: 3, title: "Mastering Personal Finance: The 50/30/20 Rule", excerpt: "A beginner-friendly guide to managing your personal wealth effectively.", category: "Finance", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600", slug: "mastering-personal-finance" },
  ];
  return allPosts.filter(post => post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || post.category.toLowerCase().includes(q));
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const results = searchPosts(query);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Search Results</h1>
        <p className={styles.subtitle}>
          {query ? `Showing results for "${query}"` : "Enter a search term to find articles"}
        </p>
        
        <form className={styles.searchBar} action="/search">
          <input 
            type="text" 
            name="q" 
            defaultValue={query} 
            placeholder="Search articles, categories, topics..." 
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </header>

      {query && results.length > 0 ? (
        <div className={styles.resultsGrid}>
          {results.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={post.image} alt={post.title} className={styles.image} />
              </div>
              <div className={styles.content}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <span className={styles.readMore}>Read Article &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h2>No matching articles found</h2>
          <p>Try refining your search terms or exploring our popular categories.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
