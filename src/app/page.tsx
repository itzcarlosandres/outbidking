"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { HeroClaim } from "@/components/home/HeroClaim"
import { ActivityTicker, ActivityItem } from "@/components/ranking/ActivityTicker"
import { CategoryFilter } from "@/components/ranking/CategoryFilter"
import { RankingList } from "@/components/ranking/RankingList"
import { StatsCounter } from "@/components/home/StatsCounter"
import { Testimonials } from "@/components/home/Testimonials"
import { Footer } from "@/components/layout/Footer"
import { RankingSite } from "@/lib/ranking"
import { usePusherBids } from "@/hooks/usePusherBids"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [view, setView] = useState<"all" | "today">("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  
  const [sites, setSites] = useState<RankingSite[]>([])
  const [total, setTotal] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  
  const [stats, setStats] = useState({
    totalRevenue: 241105,
    totalSites: 20,
    totalBids: 85,
    onlineEstimate: 87,
  })

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", userHandle: "cryptonico", siteName: "ChatNode AI", siteSlug: "chatnode-ai", rank: 1, amount: 17005, timeAgo: "2m ago" },
    { id: "2", userHandle: "marina_seo", siteName: "KiteSEO Analytics", siteSlug: "kiteseo-analytics", rank: 2, amount: 14250, timeAgo: "8m ago" },
    { id: "3", userHandle: "luna_codes", siteName: "PromptLayer Studio", siteSlug: "promptlayer-studio", rank: 3, amount: 11800, timeAgo: "15m ago" },
    { id: "4", userHandle: "mateorivas", siteName: "CryptoSniper Pro", siteSlug: "cryptosniper-pro", rank: 4, amount: 9600, timeAgo: "24m ago" },
  ])

  const [lastBidSiteId, setLastBidSiteId] = useState<string | null>(null)

  // Cargar datos del ranking
  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        view,
        page: page.toString(),
        limit: "50",
      })

      if (selectedCategory && selectedCategory !== "ALL") {
        params.set("category", selectedCategory)
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim())
      }

      const res = await fetch(`/api/ranking?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (e) {
      console.error("Error cargando ranking:", e)
    } finally {
      setLoading(false)
    }
  }, [view, selectedCategory, searchQuery, page])

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error("Error cargando stats:", e)
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  useEffect(() => {
    fetchStats()
  }, [])

  // Suscribirse a eventos de puja en tiempo real
  const handleRealtimeBid = useCallback((event: any) => {
    setLastBidSiteId(event.siteId)

    // Agregar actividad al ticker
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      userHandle: event.userHandle || "user",
      siteName: event.siteName || "Project",
      siteSlug: event.siteSlug || "",
      rank: event.newRank || 1,
      amount: event.amount || 0,
      timeAgo: "just now",
    }
    setActivities((prev) => [newActivity, ...prev.slice(0, 10)])

    // Refrescar ranking y stats
    fetchRanking()
    fetchStats()

    // Limpiar flash después de 2 segundos
    setTimeout(() => {
      setLastBidSiteId(null)
    }, 2000)
  }, [fetchRanking])

  usePusherBids(handleRealtimeBid)

  // Obtener el precio del puesto #1
  const topOnePrice = sites.length > 0 && sites[0].position === 1 ? sites[0].winningBid : 14250

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] transition-colors">
      
      {/* Navbar con toggle y buscador */}
      <Navbar
        currentView={view}
        onViewChange={(newView) => {
          setView(newView)
          setPage(1)
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
      />

      {/* Ticker de Actividad en Vivo */}
      <ActivityTicker items={activities} />

      <main className="flex-1">
        {/* Hero Section con precio dinámico y cálculo de puesto en tiempo real */}
        <HeroClaim
          topPrice={topOnePrice}
          rankingSites={sites}
          onlineCount={stats.onlineEstimate}
          totalVisitors={1483786}
        />

        {/* Sección Principal del Ranking */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          
          {/* Filtro de Categorías */}
          <div className="mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
                setPage(1)
              }}
            />
          </div>

          {/* Lista de Ranking */}
          {loading && sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C] mb-3" />
              <p className="text-xs font-semibold">Loading live rankings...</p>
            </div>
          ) : (
            <RankingList
              initialSites={sites}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onRefresh={fetchRanking}
              lastBidSiteId={lastBidSiteId}
            />
          )}

        </section>

        {/* Contador de Ingresos Generados */}
        <StatsCounter
          totalRevenue={stats.totalRevenue}
          totalSites={stats.totalSites}
          totalBids={stats.totalBids}
        />

        {/* Testimonios */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}
