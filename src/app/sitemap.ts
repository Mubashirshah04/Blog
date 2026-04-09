import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://shahinsights.com";
  
  // Use a try-catch to prevent build failures if Supabase isn't configured or tables don't exist
  try {
    const supabase = await createClient();

    // Fetch all posts
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, created_at")
      .eq("status", "published");

    // Fetch all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, created_at");

    // Fetch all custom pages
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("status", "published");

    const postUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryUrls = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.created_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const pageUrls = (pages || []).map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at || new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      ...postUrls,
      ...categoryUrls,
      ...pageUrls,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Fallback to static URLs if DB fetch fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }
}
