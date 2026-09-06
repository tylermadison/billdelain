import type { MetadataRoute } from "next";
import { business } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: business.siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${business.siteUrl}/book`, changeFrequency: "daily", priority: 0.9 },
  ];
}
