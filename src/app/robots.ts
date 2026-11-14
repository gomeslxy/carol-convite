import type { MetadataRoute } from "next";
import { EVENT } from "@/config/event";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${EVENT.siteUrl}/sitemap.xml`,
  };
}

