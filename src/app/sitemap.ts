import type { MetadataRoute } from "next";
import { EVENT } from "@/config/event";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: EVENT.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

