import styles from "./about.module.css";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.badge}>Welcome to Shah Insights</span>
        <h1 className={styles.title}>
          Your Trusted Source for <span className={styles.gradientText}>Digital Intelligence</span>
        </h1>
        <p className={styles.subtitle}>
          Providing clear, accurate, and useful information to help you stay informed 
          and make better decisions in today's fast-changing digital world.
        </p>
      </section>

      {/* Mission Section */}
      <section className={styles.grid}>
        <div className={styles.imageWrapper}>
          <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200" 
            alt="Digital Insights" 
            className={styles.image} 
          />
          <div className={styles.imageDecoration}></div>
        </div>
        
        <div className={styles.textWrapper}>
          <h2 className={styles.sectionTitle}>🎯 Our Mission</h2>
          <p className={styles.text}>
            Our mission is to make information simple and accessible for everyone. 
            We believe that in 2026, knowledge should not be complicated.
          </p>
          <p className={styles.text}>
            Whether it’s understanding financial trends, exploring online earning opportunities, 
            or staying updated with the latest news — we aim to deliver content that is 
            easy to read and genuinely helpful.
          </p>
          
          <div className={styles.trustBox}>
            <h3 className={styles.valueTitle}>✅ Why Trust Us?</h3>
            <ul className={styles.trustList} style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>✔️ We focus on original and informative content</li>
              <li style={{ marginBottom: '8px' }}>✔️ We avoid misleading or fake information</li>
              <li style={{ marginBottom: '8px' }}>✔️ We prioritize user value over clickbait</li>
              <li style={{ marginBottom: '8px' }}>✔️ We regularly update our content for accuracy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.valuesHero}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>🌍 What We Cover</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>📰</span>
            <h3 className={styles.valueTitle}>Latest News</h3>
            <p className={styles.valueText}>
              Breaking global updates and essential news from Pakistan.
            </p>
          </div>
          
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>💰</span>
            <h3 className={styles.valueTitle}>Finance & Economy</h3>
            <p className={styles.valueText}>
              Navigating wealth creation and economic shifts in the digital age.
            </p>
          </div>
          
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>💻</span>
            <h3 className={styles.valueTitle}>Tech & AI</h3>
            <p className={styles.valueText}>
              The latest trends in Artificial Intelligence and technological breakthroughs.
            </p>
          </div>

          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>📈</span>
            <h3 className={styles.valueTitle}>Online Earning</h3>
            <p className={styles.valueText}>
              Proven strategies and digital skills to thrive in the gig economy.
            </p>
          </div>

          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>🏏</span>
            <h3 className={styles.valueTitle}>Sports</h3>
            <p className={styles.valueText}>
              Latest updates on PSL, Cricket, and the world of sports.
            </p>
          </div>
        </div>
      </section>

      {/* Policy & Commitment */}
      <section className={styles.textBlock} style={{ marginTop: '4rem', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
        <h2 className={styles.sectionTitle}>📌 Content Policy</h2>
        <p className={styles.text}>
          All content published on Shah Insights is created for informational purposes only. While we strive for accuracy, we recommend readers verify important information independently, especially in finance or investment-related topics.
        </p>
        <p className={styles.text}>
          We do not promote scams, misleading schemes, or unrealistic earning claims.
        </p>
        
        <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>🤝 Our Commitment</h2>
        <p className={styles.text}>
          We are committed to building a platform that readers can rely on. As our website grows, we will continue improving content quality, user experience, and coverage of important topics.
        </p>
      </section>

      {/* Contact Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>📬 Contact Us</h2>
        <p className={styles.text} style={{ marginBottom: '1.5rem' }}>
          Questions, suggestions, or feedback? We’d love to hear from you.
        </p>
        <p className={styles.text} style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
          📧 Email: mubashirshah4112@gmail.com
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className={styles.ctaButton}>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
