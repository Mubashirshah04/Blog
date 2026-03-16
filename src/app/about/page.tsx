import styles from "./about.module.css";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>About MagTech</h1>
        <p className={styles.subtitle}>Empowering the next generation of tech enthusiasts and builders.</p>
      </header>
      
      <div className={styles.content}>
        <div className={styles.imageBlock}>
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="Team collaborating" className={styles.image} />
        </div>
        
        <div className={styles.textBlock}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.text}>
            Founded in 2024, MagTech is the premier destination for ambitious individuals who want to stay at the cutting edge of technology, finance, and online business. 
          </p>
          <p className={styles.text}>
            We believe that the rapid advancement in Artificial Intelligence and blockchain technology isn't just changing how we work—it's changing how we live. Our team of expert writers, industry veterans, and researchers are dedicated to bringing you the most accurate, actionable, and insightful content on the web.
          </p>
          
          <h2 className={styles.sectionTitle}>What We Cover</h2>
          <ul className={styles.list}>
            <li><strong>AI & Automation:</strong> Keeping you updated on tools that can save you hundreds of hours.</li>
            <li><strong>Crypto & Finance:</strong> Navigating the complex world of personal wealth and digital assets.</li>
            <li><strong>Startup Ecosystems:</strong> Analyzing funding trends, founder journeys, and market shifts.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
