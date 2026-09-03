import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import { getSiteConfig } from "@/lib/config"
import { getCategories } from "@/lib/categories"
import { AdminClient } from "./AdminClient"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login?callbackUrl=/admin")
  }

  const [sites, payments, users, config, categories] = await Promise.all([
    prisma.site.findMany({
      include: {
        owner: { select: { id: true, name: true, handle: true, email: true, image: true } },
        bids: { orderBy: { amount: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, handle: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      include: {
        _count: { select: { sites: true, bids: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteConfig(),
    getCategories(),
  ])

  const serializedSites = sites.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    url: s.url,
    description: s.description,
    category: s.category,
    status: s.status,
    clicks: s.clicks,
    winningBid: s.bids[0] ? Number(s.bids[0].amount) : 0,
    expiresAt: s.expiresAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    owner: s.owner,
  }))

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    type: p.type,
    status: p.status,
    paymentMethod: p.paymentMethod,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
  }))

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    handle: u.handle,
    role: u.role,
    image: u.image,
    siteCount: u._count.sites,
    bidCount: u._count.bids,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <AdminClient
      sites={serializedSites}
      payments={serializedPayments}
      users={serializedUsers}
      config={config}
      categories={categories}
    />
  )
}
