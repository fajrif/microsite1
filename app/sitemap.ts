import { MetadataRoute } from "next";

const baseUrl = "https://quantara.id";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Homepage
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];
}
