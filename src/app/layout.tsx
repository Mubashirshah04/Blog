import type { Metadata } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AdminBar } from "../components/AdminBar";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shah Insights - Tech, AI, Crypto & Finance Blog",
  description: "The premium source for AI tools, crypto news, tech updates, finance tips and online earning. Stay ahead of the curve.",
  keywords: "tech blog, ai tools, crypto news, finance, online earning, shah insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {/* WordPress-style admin bar — shows only when admin is logged in */}
          <AdminBar />
          <AnalyticsTracker />
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
