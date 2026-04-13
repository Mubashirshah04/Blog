import styles from "./disclaimer.module.css";

export default function DisclaimerPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Disclaimer</h1>
        <p className={styles.lastUpdated}>Last Updated: April 2026</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p className={styles.text}>
            The information provided by <strong>Shah Insights</strong> ("we," "us," or "our") on https://blog-mubashir.vercel.app (the "Site") is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 Professional & Financial Disclaimer</h2>
          <p className={styles.text}>
            The Site cannot and does not contain professional financial or investment advice. The financial information (including online earning methods, crypto updates, and economic news) is provided for general informational and educational purposes only and is not a substitute for professional advice.
          </p>
          <p className={styles.text}>
            Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of financial advice. THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THE SITE IS SOLELY AT YOUR OWN RISK.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📈 Earning Disclaimer</h2>
          <p className={styles.text}>
            Any results or examples of online earning mentioned on this Site are not to be taken as a guarantee of what you will earn. Your success depends on your background, effort, and many other factors. We do not promote "get rich quick" schemes or unrealistic earning claims.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 External Links Disclaimer</h2>
          <p className={styles.text}>
            The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, reliability, availability, or completeness by us.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🤖 AI & Technology Content</h2>
          <p className={styles.text}>
            While we strive to provide the most accurate reviews and guides for AI tools and Mobile Apps, technology evolves rapidly. Features, pricing, and availability of tools mentioned may change after publication.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📢 Advertisements & Affiliate Disclosure</h2>
          <p className={styles.text}>
            Shah Insights may display advertisements from third-party networks like Google AdSense. Some of the links on this Site may be affiliate links. This means if you click on the link and purchase an item or sign up for a service, we may receive a commission at no extra cost to you.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚠️ "Use at Your Own Risk"</h2>
          <p className={styles.text}>
            UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN RISK.
          </p>
        </section>

        <section className={styles.section} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <p className={styles.text}>
            If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <strong>mubashirshah4112@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
