import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/quiz`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/create`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/stats`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/feed`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
  ];

  // Add recent result pages
  const resultPages: MetadataRoute.Sitemap = [];
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const ids = await kv.zrange("results:feed", 0, 99, { rev: true });
      if (ids) {
        for (const id of ids) {
          resultPages.push({
            url: `${siteUrl}/result/${id}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      }
    } catch {}
  }

  return [...staticPages, ...resultPages];
}
