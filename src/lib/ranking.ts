import { prisma } from "@/lib/db"
import { SiteStatus } from "@prisma/client"

export interface RankingSite {
  id: string
  name: string
  slug: string
  url: string
  description: string
  category: string
  clicks: number
  expiresAt: string
  createdAt: string
  winningBid: number
  bidCount: number
  position: number
  owner: {
    id: string
    name: string | null
    handle: string | null
    image: string | null
  }
}

export interface GetRankingOptions {
  view?: "all" | "today"
  category?: string
  search?: string
  page?: number
  limit?: number
}

export async function getRanking(options: GetRankingOptions = {}) {
  const { view = "all", category, search, page = 1, limit = 50 } = options
  const now = new Date()

  // 1. Lazy expiration check: actualizar sitios expirados
  await prisma.site.updateMany({
    where: {
      status: SiteStatus.ACTIVE,
      expiresAt: { lt: now },
    },
    data: {
      status: SiteStatus.EXPIRED,
    },
  })

  // 2. Filtro de fecha para vista "today" (últimas 24h)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

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

  // 3. Obtener sitios activos con sus pujas y dueño
  const sites = await prisma.site.findMany({
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
        where: view === "today" ? { auctionDate: { gte: twentyFourHoursAgo } } : undefined,
        orderBy: { amount: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // 4. Calcular puja ganadora y ordenar ranking
  const rankedSites: RankingSite[] = sites.map((site) => {
    const winningBidObj = site.bids.find((b) => b.isWinning) || site.bids[0]
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

  // Ordenar: primero por puja ganadora más alta (DESC); si empatan, por fecha de creación (ASC)
  rankedSites.sort((a, b) => {
    if (b.winningBid !== a.winningBid) {
      return b.winningBid - a.winningBid
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // Asignar número de posición 1, 2, 3...
  rankedSites.forEach((site, index) => {
    site.position = index + 1
  })

  const total = rankedSites.length
  const totalPages = Math.ceil(total / limit) || 1
  const startIndex = (page - 1) * limit
  const paginatedSites = rankedSites.slice(startIndex, startIndex + limit)

  return {
    sites: paginatedSites,
    total,
    page,
    totalPages,
    limit,
  }
}

export async function getTopThree(): Promise<RankingSite[]> {
  const { sites } = await getRanking({ limit: 3, view: "all" })
  return sites.slice(0, 3)
}

export async function getPlatformStats() {
  const [totalRevenueAgg, totalSites, totalBids, auctionConfig] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.site.count({
      where: { status: SiteStatus.ACTIVE },
    }),
    prisma.bid.count(),
    prisma.auctionConfig.findFirst(),
  ])

  const totalRevenue = totalRevenueAgg._sum.amount ? Number(totalRevenueAgg._sum.amount) : 0

  return {
    totalRevenue,
    totalSites,
    totalBids,
    minIncrement: auctionConfig ? Number(auctionConfig.minIncrement) : 5,
    onlineEstimate: 87 + Math.floor(Math.sin(Date.now() / 60000) * 12),
  }
}
