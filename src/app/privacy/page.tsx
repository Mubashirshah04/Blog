import styles from "./privacy.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: April 2026</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p className={styles.text}>
            At <strong>Shah Insights</strong>, accessible from https://blog-mubashir.vercel.app (or your domain), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Shah Insights and how we use it.
          </p>
          <p className={styles.text}>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>mubashirshah4112@gmail.com</strong>.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Log Files</h2>
          <p className={styles.text}>
            Shah Insights follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cookies and Web Beacons</h2>
          <p className={styles.text}>
            Like any other website, Shah Insights uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Google DoubleClick DART Cookie</h2>
          <p className={styles.text}>
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Advertising Partners</h2>
          <p className={styles.text}>
            Some of advertisers on our site may use cookies and web beacons. Our advertising partners include:
          </p>
          <ul className={styles.list}>
            <li>Google AdSense</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy Policies</h2>
          <p className={styles.text}>
            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Shah Insights, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p className={styles.text}>
            Note that Shah Insights has no access to or control over these cookies that are used by third-party advertisers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Third Party Privacy Policies</h2>
          <p className={styles.text}>
            Shah Insights's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Children's Information</h2>
          <p className={styles.text}>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p className={styles.text}>
            Shah Insights does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Online Privacy Policy Only</h2>
          <p className={styles.text}>
            This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Shah Insights. This policy is not applicable to any information collected offline or via channels other than this website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Consent</h2>
          <p className={styles.text}>
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
