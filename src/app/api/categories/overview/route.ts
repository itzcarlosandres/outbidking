import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCategories } from "@/lib/categories"
import { SiteStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [categories, allSites] = await Promise.all([
      getCategories(),
      prisma.site.findMany({
        where: { status: SiteStatus.ACTIVE },
        include: {
          bids: {
            where: { isWinning: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

    // Agrupar sitios por categoría y calcular ranking por categoría
    const categoryMap: Record<
      string,
      {
        totalSites: number
        totalVolume: number
        bidsCount: number
        lastActivity: string | null
        topSites: Array<{
          id: string
          name: string
          slug: string
          url: string
          description: string
          winningBid: number
          clicks: number
        }>
      }
    > = {}

    categories.forEach((cat) => {
      categoryMap[cat.name] = {
        totalSites: 0,
        totalVolume: 0,
        bidsCount: 0,
        lastActivity: null,
        topSites: [],
      }
    })

    allSites.forEach((site) => {
      const catName = site.category
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          totalSites: 0,
          totalVolume: 0,
          bidsCount: 0,
          lastActivity: null,
          topSites: [],
        }
      }

      const topBid = site.bids[0] ? Number(site.bids[0].amount) : 0
      categoryMap[catName].totalSites += 1
      categoryMap[catName].totalVolume += topBid

      categoryMap[catName].topSites.push({
        id: site.id,
        name: site.name,
        slug: site.slug,
        url: site.url,
        description: site.description,
        winningBid: topBid,
        clicks: site.clicks,
      })
    })

    // Ordenar topSites dentro de cada categoría (Mayor puja -> Mayor clicks)
    const categoryCards = categories.map((cat) => {
      const data = categoryMap[cat.name] || {
        totalSites: 0,
        totalVolume: 0,
        bidsCount: 0,
        lastActivity: null,
        topSites: [],
      }

      data.topSites.sort((a, b) => {
        if (b.winningBid !== a.winningBid) {
          return b.winningBid - a.winningBid
        }
        return b.clicks - a.clicks
      })

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: cat.order,
        totalSites: data.totalSites,
        totalVolume: data.totalVolume,
        topSites: data.topSites.slice(0, 3),
        leader: data.topSites[0] || null,
      }
    })

    // Calcular las 3 categorías más activas para el bloque "🔥 Categorías más activas"
    const mostActive = [...categoryCards]
      .filter((c) => c.totalVolume > 0 || c.totalSites > 0)
      .sort((a, b) => b.totalVolume - a.totalVolume || b.totalSites - a.totalSites)
      .slice(0, 3)

    return NextResponse.json({
      categories: categoryCards,
      mostActive,
    })
  } catch (error) {
    console.error("Error en GET /api/categories/overview:", error)
    return NextResponse.json(
      { error: "Error al obtener resumen de categorías" },
      { status: 500 }
    )
  }
}
