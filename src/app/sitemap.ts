import { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidar cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXTAUTH_URL || "https://puja.lol").replace(/\/$/, "")

  // 1. Rutas principales estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/sites/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // 2. Rutas dinámicas de todos los proyectos activos en el ranking
  let siteRoutes: MetadataRoute.Sitemap = []
  try {
    const sites = await prisma.site.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 1000,
    })

    siteRoutes = sites.map((site) => ({
      url: `${baseUrl}/site/${site.slug}`,
      lastModified: site.updatedAt || new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    }))
  } catch (error) {
    console.error("Error generating dynamic site routes for sitemap:", error)
  }

  // 3. Categorías dinámicas
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.categoryItem.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        createdAt: true,
      },
    })

    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/categories?category=${cat.slug}`,
      lastModified: cat.createdAt || new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error generating category routes for sitemap:", error)
  }

  return [...staticRoutes, ...siteRoutes, ...categoryRoutes]
}
