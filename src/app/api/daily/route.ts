import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { SiteStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 1. Where clause para sitios
    const whereClause: {
      status: SiteStatus
      category?: { equals: string; mode?: "insensitive" }
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" }
        description?: { contains: string; mode: "insensitive" }
        url?: { contains: string; mode: "insensitive" }
      }>
    } = {
      status: SiteStatus.ACTIVE,
    }

    if (category && category !== "ALL" && category.trim().length > 0) {
      whereClause.category = { equals: category.trim(), mode: "insensitive" }
    }

    if (search && search.trim().length > 0) {
      const term = search.trim()
      whereClause.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { url: { contains: term, mode: "insensitive" } },
      ]
    }

    // 2. Obtener sitios con pujas de las últimas 24h
    const [sites, allTodayBids, totalRevenueAgg, auctionConfig] = await Promise.all([
      prisma.site.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              handle: true,
              image: true,
            },
          },
          bids: {
            where: {
              auctionDate: { gte: twentyFourHoursAgo },
            },
            orderBy: { amount: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  handle: true,
                  image: true,
                },
              },
            },
          },
        },
      }),

      // Feed de actividad de las últimas 24h
      prisma.bid.findMany({
        where: {
          auctionDate: { gte: twentyFourHoursAgo },
        },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              slug: true,
              url: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      // Suma total transaccionada en 24h
      prisma.bid.aggregate({
        where: {
          auctionDate: { gte: twentyFourHoursAgo },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      prisma.auctionConfig.findFirst(),
    ])

    // 3. Procesar y ordenar sitios para el ranking diario
    const rankedSites = sites.map((site) => {
      const winningBidObj = site.bids[0]
      const winningAmount = winningBidObj ? Number(winningBidObj.amount) : 0

      return {
        id: site.id,
        name: site.name,
        slug: site.slug,
        url: site.url,
        description: site.description,
        category: site.category,
        clicks: site.clicks,
        expiresAt: site.expiresAt.toISOString(),
        createdAt: site.createdAt.toISOString(),
        winningBid: winningAmount,
        bidCount: site.bids.length,
        position: 0,
        owner: {
          id: site.owner.id,
          name: site.owner.name,
          handle: site.owner.handle,
          image: site.owner.image,
        },
      }
    })

    // Ordenar: primero por la puja más alta de hoy (DESC); luego por clicks
    rankedSites.sort((a, b) => {
      if (b.winningBid !== a.winningBid) {
        return b.winningBid - a.winningBid
      }
      return b.clicks - a.clicks
    })

    rankedSites.forEach((site, index) => {
      site.position = index + 1
    })

    const total = rankedSites.length
    const totalPages = Math.ceil(total / limit) || 1
    const startIndex = (page - 1) * limit
    const paginatedSites = rankedSites.slice(startIndex, startIndex + limit)

    // Formatear feed de actividad de hoy
    const activityFeed = allTodayBids.map((b) => ({
      id: b.id,
      amount: Number(b.amount),
      createdAt: b.createdAt.toISOString(),
      user: {
        id: b.user.id,
        name: b.user.name,
        handle: b.user.handle,
        image: b.user.image,
      },
      site: {
        id: b.site.id,
        name: b.site.name,
        slug: b.site.slug,
        url: b.site.url,
        category: b.site.category,
      },
    }))

    const totalRevenueToday = totalRevenueAgg._sum.amount
      ? Number(totalRevenueAgg._sum.amount)
      : rankedSites.reduce((acc, s) => acc + s.winningBid, 0)

    const bidsCountToday = totalRevenueAgg._count.id || allTodayBids.length

    const topSite = rankedSites[0] || null

    return NextResponse.json({
      sites: paginatedSites,
      total,
      page,
      totalPages,
      limit,
      stats: {
        totalRevenueToday,
        bidsCountToday,
        activeSitesToday: rankedSites.filter((s) => s.winningBid > 0).length,
        topSite: topSite ? { name: topSite.name, amount: topSite.winningBid, slug: topSite.slug } : null,
      },
      activityFeed,
      minIncrement: auctionConfig ? Number(auctionConfig.minIncrement) : 5,
    })
  } catch (error) {
    console.error("Error en GET /api/daily:", error)
    return NextResponse.json(
      { error: "Error al obtener datos diarios" },
      { status: 500 }
    )
  }
}
