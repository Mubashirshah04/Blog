"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./studio.module.css";
import Link from "next/link";

interface StatItem {
  id: string;
  title: string;
  views: number;
}

interface CommonStat {
  name: string;
  count: number;
}

export default function AdminStudio() {
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postStats, setPostStats] = useState<StatItem[]>([]);
  const [dailyStats, setDailyStats] = useState<number[]>(new Array(7).fill(0));
  const [sources, setSources] = useState<CommonStat[]>([]);
  const [browsers, setBrowsers] = useState<CommonStat[]>([]);
  const [devices, setDevices] = useState<Record<string, number>>({ Desktop: 0, Mobile: 0 });
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLastSync(new Date());
      // ... same logic but add today filter ...
      const { data: analytics, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("event_type", "view");

      if (error) throw error;
      
      const viewsCount = analytics?.length || 0;
      setTotalViews(viewsCount);

      // Today's views
      const today = new Date().toDateString();
      const todayCount = analytics?.filter(a => new Date(a.created_at).toDateString() === today).length || 0;
      setTodayViews(todayCount);

      // --- Data Processing Helpers ---
      const countBy = (arr: any[], key: string) => {
        return arr.reduce((acc, item) => {
          const val = item[key] || "Unknown";
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      };

      const toSortedList = (obj: Record<string, number>) => {
        return Object.entries(obj)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
      };

      // --- Process Analytics ---
      if (analytics && analytics.length > 0) {
        setSources(toSortedList(countBy(analytics, "source")).slice(0, 5));
        setBrowsers(toSortedList(countBy(analytics, "browser")).slice(0, 5));
        const devCounts = countBy(analytics, "device_type");
        setDevices({ Desktop: devCounts.Desktop || 0, Mobile: devCounts.Mobile || 0 });

        // 7-Day Trend
        const daily = new Array(7).fill(0);
        const dayLabels = [];
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(now.getDate() - (6 - i));
          const dateStr = d.toDateString();
          daily[i] = analytics.filter(a => new Date(a.created_at).toDateString() === dateStr).length;
        }
        setDailyStats(daily);
      }

      // 1. Fetch Posts
      const { data: postsData, count: postsCount } = await supabase
        .from("posts")
        .select("id, title", { count: "exact" })
        .order("created_at", { ascending: false });
      
      setTotalPosts(postsCount || 0);

      // --- Process Posts Stats ---
      const viewsMap = analytics && analytics.length > 0 ? countBy(analytics, "post_id") : {};
      const stats = postsData?.map((post) => ({
        id: post.id,
        title: post.title,
        views: viewsMap[post.id] || 0,
      })) || [];
      
      setPostStats(stats.sort((a, b) => b.views - a.views));

    } catch (err) {
      console.error("Studio Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className={styles.studioWrap}><div className={styles.header}><h1 className={styles.title}>Studio Analytics</h1><p>Building advanced reports...</p></div></div>;

  // Correct Day Labels
  const labelDays = [];
  for(let i=6; i>=0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     labelDays.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  const maxDaily = Math.max(...dailyStats) || 1;

  return (
    <div className={styles.studioWrap}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>Advanced Studio Dashboard</h1>
            <p>Deep insights into your audience, devices, and traffic sources.</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#646970' }}>
            Last Synced: {lastSync.toLocaleTimeString()}<br/>
            <span style={{ color: '#22c55e' }}>● Real-time Active</span>
          </div>
        </div>
      </div>

      {/* Primary Indicators */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Today's Views</span>
            <span className={styles.statIcon} style={{ animation: 'pulse 2s infinite' }}>📈</span>
          </div>
          <div className={styles.statValue}>{todayViews.toLocaleString()}</div>
          <div className={`${styles.statTrend} ${styles.trendUp}`}>↑ Lifetime: {totalViews}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Live Content</span>
            <span className={styles.statIcon}>💎</span>
          </div>
          <div className={styles.statValue}>{totalPosts}</div>
          <div className={styles.statTrend}>Total Database Articles</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Mobile Traffic</span>
            <span className={styles.statIcon}>📱</span>
          </div>
          <div className={styles.statValue}>{totalViews > 0 ? Math.round((devices.Mobile / totalViews) * 100) : 0}%</div>
          <div className={styles.statTrend}>Audience Device Mix</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Desktop Traffic</span>
            <span className={styles.statIcon}>💻</span>
          </div>
          <div className={styles.statValue}>{totalViews > 0 ? Math.round((devices.Desktop / totalViews) * 100) : 0}%</div>
          <div className={styles.statTrend}>Active Workstations</div>
        </div>
      </div>

      <div className={styles.secondaryGrid}>
        {/* Top Traffic Sources */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Top Traffic Sources</h2></div>
          <div style={{ padding: '20px' }}>
            {sources.length === 0 ? <p className={styles.empty}>No source data yet</p> : sources.map(s => (
              <div key={s.name} className={styles.sourceItem}>
                <div className={styles.sourceInfo}>
                  <div className={styles.sourceLabel}><span className={styles.sourceName}>{s.name}</span></div>
                  <span className={styles.sourceCount}>{s.count}</span>
                </div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${(s.count / totalViews) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Browsers */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Browser Breakdown</h2></div>
          <div style={{ padding: '20px' }}>
            {browsers.length === 0 ? <p className={styles.empty}>No browser data yet</p> : browsers.map(b => (
              <div key={b.name} className={styles.sourceItem}>
                <div className={styles.sourceInfo}>
                  <div className={styles.sourceLabel}><span className={styles.sourceName}>{b.name}</span></div>
                  <span className={styles.sourceCount}>{b.count}</span>
                </div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${(b.count / totalViews) * 100}%`, backgroundColor: '#4f46e5' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Performance */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Article Real-time Performance</h2></div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th style={{ width: 100 }}>Views</th>
              <th>Engagement Bar</th>
            </tr>
          </thead>
          <tbody>
            {postStats.length === 0 ? (
              <tr><td colSpan={3} className={styles.empty}>No posts found in database.</td></tr>
            ) : (
              postStats.map((item) => (
                <tr key={item.id}>
                  <td><Link href={`/admin/posts/edit/${item.id}`} className={styles.postLink}>{item.title}</Link></td>
                  <td className={styles.viewCount}>{item.views.toLocaleString()}</td>
                  <td>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${item.views > 0 ? (item.views / (postStats[0]?.views || 1)) * 100 : 0}%` }} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Traffic Trend */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>7-Day Growth Trend</h2></div>
        <div style={{ padding: '24px' }}>
          <div className={styles.chartContainer}>
            {dailyStats.map((count, i) => (
              <div key={i} className={styles.chartBar} style={{ height: `${(count / maxDaily) * 100}%` }}>
                <div className={styles.chartTooltip}>{count} unique visits</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#646970', fontSize: 13, marginTop: 12 }}>
            {labelDays.map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
