import styles from "./admin.module.css";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className={styles.wpContainer}>
      <header className={styles.wpHeader}>
        <h1 className={styles.wpTitle}>Dashboard</h1>
      </header>

      <div className={styles.wpWidgetsGrid}>
        <div className={styles.wpColumn}>
          {/* At a Glance Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>At a Glance</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <ul className={styles.wpGlanceList}>
                <li><span className={styles.wpIcon}>📌</span> <Link href="/admin/posts">142 Posts</Link></li>
                <li><span className={styles.wpIcon}>📄</span> <Link href="/admin/pages">12 Pages</Link></li>
                <li><span className={styles.wpIcon}>💬</span> <Link href="/admin/comments">892 Comments</Link></li>
              </ul>
              <p className={styles.wpGlanceFooter}>
                Next.js Version 16.1.6 running MagTech Theme.
              </p>
            </div>
          </div>

          {/* Activity Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Activity</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <h3 className={styles.wpSubTitle}>Recently Published</h3>
              <ul className={styles.wpActivityList}>
                <li><span>Oct 24th, 10:23 am</span> <Link href="#">The Future of AI Agents</Link></li>
                <li><span>Oct 21st, 2:15 pm</span> <Link href="#">Build a SAAS with Next.js</Link></li>
                <li><span>Oct 18th, 9:00 am</span> <Link href="#">Earn Money Online</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.wpColumn}>
          {/* Quick Draft Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Quick Draft</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <form className={styles.wpDraftForm}>
                <input type="text" placeholder="Title" className={styles.wpInput} />
                <textarea rows={4} placeholder="What's on your mind?" className={styles.wpInput}></textarea>
                <div className={styles.wpFormActions}>
                  <button type="button" className={styles.wpButtonPrimary}>Save Draft</button>
                </div>
              </form>
            </div>
          </div>
          
          {/* SEO Overview Widget */}
          <div className={styles.wpWidget}>
            <div className={styles.wpWidgetHeader}>
              <h2 className={styles.wpWidgetTitle}>Site Health Status</h2>
            </div>
            <div className={styles.wpWidgetContent}>
              <div className={styles.wpHealthGood}>
                <span className={styles.wpHealthCircle}></span> Good
              </div>
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#50575e' }}>
                Your site is running optimally. 0 critical issues found.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
