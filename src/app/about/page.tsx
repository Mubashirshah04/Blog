import styles from "./about.module.css";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.badge}>Welcome to Shah Insights</span>
        <h1 className={styles.title}>
          Your Trusted Source for <span className={styles.gradientText}>Modern Digital Wealth</span>
        </h1>
        <p className={styles.subtitle}>
          Providing clear, accurate, and useful information to help you stay informed 
          and thrive in the fast-paced worlds of Online Earning, AI, and Mobile Technology.
        </p>
      </section>

      {/* Mission Section */}
      <section className={styles.grid}>
        <div className={styles.imageWrapper}>
          <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200" 
            alt="Digital Growth" 
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
            Whether it’s mastering new AI tools, exploring sustainable online earning opportunities, 
            or staying updated with the most productive mobile apps — we aim to deliver content that is 
            easy to read and genuinely helpful.
          </p>
          
          <div className={styles.trustBox}>
            <h3 className={styles.valueTitle}>✅ Why Trust Us?</h3>
            <ul className={styles.trustList} style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>✔️ We focus on original and informative core-tech content</li>
              <li style={{ marginBottom: '8px' }}>✔️ We avoid misleading earning claims or fake tech news</li>
              <li style={{ marginBottom: '8px' }}>✔️ We prioritize user value over high-volume clickbait</li>
              <li style={{ marginBottom: '8px' }}>✔️ We regularly update our reviews and guides for accuracy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Focus Categories Section */}
      <section className={styles.valuesHero}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>🌍 Our Core Focus</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>📈</span>
            <h3 className={styles.valueTitle}>Online Earning</h3>
            <p className={styles.valueText}>
              Proven strategies, digital skills, and legit platforms to build and scale your income in the global gig economy.
            </p>
          </div>
          
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>🤖</span>
            <h3 className={styles.valueTitle}>AI Tools</h3>
            <p className={styles.valueText}>
              Deep dives into Artificial Intelligence breakthroughs and productivity tools that give you a competitive edge.
            </p>
          </div>
          
          <div className={styles.valueCard}>
            <span className={styles.valueIcon}>📱</span>
            <h3 className={styles.valueTitle}>Mobile Apps</h3>
            <p className={styles.valueText}>
              Reviews and guides for the latest apps across Android and iOS that simplify your life and work.
            </p>
          </div>
        </div>
      </section>

      {/* Policy & Commitment */}
      <section className={styles.textBlock} style={{ marginTop: '4rem', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
        <h2 className={styles.sectionTitle}>📌 Content Policy</h2>
        <p className={styles.text}>
          All content published on Shah Insights is created for informational purposes only. While we strive for accuracy, we recommend readers verify important information independently, especially regarding earnings and technological specs.
        </p>
        <p className={styles.text}>
          We do not promote scams, misleading schemes, or unrealistic earning claims.
        </p>
        
        <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>🤝 Our Commitment</h2>
        <p className={styles.text}>
          We are committed to building a platform that readers can rely on. As our website grows, we will continue improving content quality, user experience, and our coverage of Tech and Finance.
        </p>
      </section>

      {/* Contact Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>📬 Contact Us</h2>
        <p className={styles.text} style={{ marginBottom: '1.5rem' }}>
          Questions about our guides, tools, or partnerships? We’d love to hear from you.
        </p>
        <p className={styles.text} style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
          📧 Email: mubashirshah4112@gmail.com
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className={styles.ctaButton}>
            Explore Insights
          </Link>
        </div>
      </section>
    </div>
  );
}
