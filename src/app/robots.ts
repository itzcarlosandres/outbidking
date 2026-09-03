import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://puja.lol"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/leaderboard", "/categories", "/site/", "/dashboard/sites/new"],
        disallow: ["/admin/", "/api/", "/dashboard/sites/edit/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  }
}
