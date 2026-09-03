import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { SiteDetailClient } from "./SiteDetailClient"
import { ProductJsonLd } from "@/components/seo/JsonLd"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const site = await prisma.site.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      category: true,
      url: true,
    },
  })

  if (!site) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found on puja.lol.",
    }
  }

  const cleanDescription =
    site.description.length > 160
      ? `${site.description.slice(0, 157)}...`
      : site.description

  return {
    title: `${site.name} — Live Rankings & Traffic on puja.lol`,
    description: cleanDescription,
    keywords: [
      site.name,
      site.category,
      "saas leaderboard",
      "project directory",
      "startup rankings",
      "puja.lol",
    ],
    openGraph: {
      title: `${site.name} — Live Rankings on puja.lol`,
      description: cleanDescription,
      url: `/site/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — Live Rankings on puja.lol`,
      description: cleanDescription,
    },
    alternates: {
      canonical: `/site/${slug}`,
    },
  }
}

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const site = await prisma.site.findUnique({
    where: { slug },
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
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!site) {
    notFound()
  }

  // Calcular posición actual en el ranking
  const allActiveSites = await prisma.site.findMany({
    where: { status: "ACTIVE" },
    include: {
      bids: {
        where: { isWinning: true },
        take: 1,
      },
    },
  })

  const sortedSites = allActiveSites.map((s) => {
    const top = s.bids[0] ? Number(s.bids[0].amount) : 0
    return { id: s.id, amount: top }
  })
  sortedSites.sort((a, b) => b.amount - a.amount)

  const currentRank = sortedSites.findIndex((s) => s.id === site.id) + 1

  const winningBidObj = site.bids.find((b) => b.isWinning) || site.bids[0]
  const winningBidAmount = winningBidObj ? Number(winningBidObj.amount) : 0

  const serializedSite = {
    id: site.id,
    name: site.name,
    slug: site.slug,
    url: site.url,
    description: site.description,
    category: site.category,
    status: site.status,
    clicks: site.clicks,
    expiresAt: site.expiresAt.toISOString(),
    createdAt: site.createdAt.toISOString(),
    winningBid: winningBidAmount,
    position: currentRank || 1,
    owner: {
      id: site.owner.id,
      name: site.owner.name,
      handle: site.owner.handle,
      image: site.owner.image,
    },
    bids: site.bids.map((b) => ({
      id: b.id,
      amount: Number(b.amount),
      isWinning: b.isWinning,
      createdAt: b.createdAt.toISOString(),
      user: {
        id: b.user.id,
        name: b.user.name,
        handle: b.user.handle,
        image: b.user.image,
      },
    })),
  }

  return (
    <>
      <ProductJsonLd
        name={site.name}
        description={site.description}
        url={site.url}
        slug={site.slug}
        category={site.category}
        winningBid={winningBidAmount}
        rank={currentRank || 1}
      />
      <SiteDetailClient site={serializedSite} />
    </>
  )
}
