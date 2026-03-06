import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/mcp"],
        disallow: ["/api/diagnose", "/api/feedback", "/api/like", "/api/feed"],
      },
    ],
    sitemap: "https://ai-shindan.ezoai.jp/sitemap.xml",
  };
}
