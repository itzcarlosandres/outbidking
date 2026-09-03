import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DashboardClient } from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard")
  }

  // 1. Obtener sitios del usuario
  const userSites = await prisma.site.findMany({
    where: { ownerId: session.user.id },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calcular ranking actual para cada sitio
  const allActive = await prisma.site.findMany({
    where: { status: "ACTIVE" },
    include: {
      bids: {
        where: { isWinning: true },
        take: 1,
      },
    },
  })

  const sortedAll = allActive.map((s) => ({
    id: s.id,
    amount: s.bids[0] ? Number(s.bids[0].amount) : 0,
  }))
  sortedAll.sort((a, b) => b.amount - a.amount)

  const serializedSites = userSites.map((s) => {
    const rank = sortedAll.findIndex((item) => item.id === s.id) + 1
    const topBid = s.bids[0] ? Number(s.bids[0].amount) : 0
    const now = new Date()
    const daysLeft = Math.max(0, Math.ceil((new Date(s.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      url: s.url,
      description: s.description,
      category: s.category,
      status: s.status,
      clicks: s.clicks,
      daysLeft,
      position: rank || "-",
      winningBid: topBid,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }
  })

  // 2. Obtener pujas del usuario
  const userBids = await prisma.bid.findMany({
    where: { userId: session.user.id },
    include: {
      site: {
        select: {
          id: true,
          name: true,
          slug: true,
          url: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const serializedBids = userBids.map((b) => ({
    id: b.id,
    amount: Number(b.amount),
    isWinning: b.isWinning,
    createdAt: b.createdAt.toISOString(),
    site: b.site,
  }))

  return (
    <DashboardClient
      user={session.user}
      sites={serializedSites}
      bids={serializedBids}
    />
  )
}
