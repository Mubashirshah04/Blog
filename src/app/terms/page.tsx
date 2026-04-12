import styles from "./terms.module.css";

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms & Services</h1>
        <p className={styles.lastUpdated}>Last Updated: April 2026</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p className={styles.text}>
            Welcome to <strong>Shah Insights</strong>. By accessing and using this website, you agree to comply with the following terms and conditions. If you do not agree, please do not use our website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📌 Use of Website</h2>
          <p className={styles.text}>
            All content provided on Shah Insights is for informational and educational purposes only. You agree to use this website only for lawful purposes and not to:
          </p>
          <ul className={styles.list}>
            <li>Violate any laws or regulations</li>
            <li>Copy or reuse content without permission</li>
            <li>Attempt to harm or disrupt the website</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📚 Content Accuracy</h2>
          <p className={styles.text}>
            We aim to provide accurate and up-to-date information. However:
          </p>
          <ul className={styles.list}>
            <li>We do not guarantee that all content is 100% complete or error-free</li>
            <li>Information may change over time</li>
            <li>Users should verify important details independently</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 Financial & Earning Disclaimer</h2>
          <p className={styles.text}>
            Some content on this website may include Finance updates, Online earning methods, or Investment-related information. 
            <strong> This content is not financial advice.</strong>
          </p>
          <p className={styles.text}>
            We are not responsible for any financial losses or decisions made based on our content. Always do your own research before making any financial decision.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 External Links</h2>
          <p className={styles.text}>
            Our website may contain links to third-party websites. We do not control or take responsibility for their content. Visiting external links is at your own risk.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📢 Advertisements</h2>
          <p className={styles.text}>
            Shah Insights may display ads through third-party networks such as Google AdSense. Ads may be personalized based on user activity. We are not responsible for the content of advertisements.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>©️ Intellectual Property</h2>
          <p className={styles.text}>
            All content on this website, including text, images, and design, is the property of Shah Insights unless stated otherwise. You may not copy, reproduce, or distribute content without permission.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚠️ Limitation of Liability</h2>
          <p className={styles.text}>
            We are not liable for any losses or damages from using this website, errors or omissions in content, or temporary unavailability of the website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔄 Changes to Terms</h2>
          <p className={styles.text}>
            We may update these Terms and Services at any time without prior notice. Users are encouraged to review this page regularly.
          </p>
        </section>

        <div className={styles.contactBox}>
          <h2 className={styles.sectionTitle} style={{ justifyContent: 'center' }}>📬 Contact Us</h2>
          <p className={styles.text}>
            If you have any questions regarding these terms, you can contact us:
            <span className={styles.email}>mubashirshah4112@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
