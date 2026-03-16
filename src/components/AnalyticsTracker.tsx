"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === lastTrackedPath.current) return;

    const trackView = async () => {
      try {
        lastTrackedPath.current = pathname;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          if (profile?.role === "admin") return;
        }

        // Get Client Data
        const ua = window.navigator.userAgent;
        let os = "Unknown";
        if (ua.indexOf("Win") !== -1) os = "Windows";
        if (ua.indexOf("Mac") !== -1) os = "MacOS";
        if (ua.indexOf("X11") !== -1) os = "UNIX";
        if (ua.indexOf("Linux") !== -1) os = "Linux";
        if (ua.indexOf("Android") !== -1) os = "Android";
        if (ua.indexOf("iPhone") !== -1) os = "iOS";

        let browser = "Unknown";
        if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";
        else if (ua.indexOf("Edge") !== -1) browser = "Edge";

        const deviceType = /Mobile|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop";

        let postId = null;
        if (pathname.startsWith("/blog/")) {
          const slug = pathname.split("/").pop();
          const { data: post } = await supabase.from("posts").select("id").eq("slug", slug).single();
          postId = post?.id;
        }

        const referrer = document.referrer;
        let source = "Direct";
        if (referrer) {
           if (referrer.includes("google.com")) source = "Google";
           else if (referrer.includes("facebook.com")) source = "Facebook";
           else if (referrer.includes("twitter.com") || referrer.includes("t.co")) source = "Twitter";
           else source = new URL(referrer).hostname;
        }

        await supabase.from("analytics").insert({
          post_id: postId,
          event_type: "view",
          path: pathname,
          referrer: referrer || null,
          source: source,
          browser: browser,
          os: os,
          device_type: deviceType,
        });

      } catch (e) {
        console.error("Tracking failed:", e);
      }
    };

    const timer = setTimeout(trackView, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
