import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dexpert.app";

const staticRoutes = [
  "",
  "/auth/sign-in",
  "/auth/sign-up",
  "/student/dashboard",
  "/student/projects",
  "/student/portfolio",
  "/student/profile",
  "/pyme/dashboard",
  "/pyme/projects",
  "/pyme/catalog",
  "/pyme/analytics",
  "/pyme/profile",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
