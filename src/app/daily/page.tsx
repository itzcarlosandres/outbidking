"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RankingList } from "@/components/ranking/RankingList"
import { TopThree } from "@/components/ranking/TopThree"
import { CategoryFilter } from "@/components/ranking/CategoryFilter"
import { BidModal } from "@/components/ranking/BidModal"
import { RankingSite } from "@/lib/ranking"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import { usePusherBids } from "@/hooks/usePusherBids"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  DollarSign,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  History,
  Layers,
  ListOrdered,
  Loader2,
  Medal,
  Radio,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react"

interface DailyStats {
  totalRevenueToday: number
  bidsCountToday: number
  activeSitesToday: number
  topSite: {
    name: string
    amount: number
    slug: string
  } | null
}

interface ActivityItem {
  id: string
  amount: number
  createdAt: string
  user: {
    id: string
    name: string | null
    handle: string | null
    image: string | null
  }
  site: {
    id: string
    name: string
    slug: string
    url: string
    category: string
  }
}

export default function DailyRankingPage() {
  const [activeTab, setActiveTab] = useState<"ranking" | "feed">("ranking")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [page, setPage] = useState<number>(1)

  const [sites, setSites] = useState<RankingSite[]>([])
  const [total, setTotal] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastBidSiteId, setLastBidSiteId] = useState<string | null>(null)

  const [stats, setStats] = useState<DailyStats>({
    totalRevenueToday: 0,
    bidsCountToday: 0,
    activeSitesToday: 0,
    topSite: null,
  })

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([])
  
  // Modal de puja rápida
  const [selectedSiteForBid, setSelectedSiteForBid] = useState<RankingSite | null>(null)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)

  const fetchDailyData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      })

      if (selectedCategory && selectedCategory !== "ALL") {
        params.set("category", selectedCategory)
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim())
      }

      const res = await fetch(`/api/daily?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        if (data.stats) setStats(data.stats)
        if (data.activityFeed) setActivityFeed(data.activityFeed)
      }
    } catch (e) {
      console.error("Error cargando daily data:", e)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, page])

  useEffect(() => {
    fetchDailyData()
  }, [fetchDailyData])

  // Pusher en tiempo real
  const handleRealtimeBid = useCallback((event: any) => {
    setLastBidSiteId(event.siteId)
    fetchDailyData()
    setTimeout(() => setLastBidSiteId(null), 2500)
  }, [fetchDailyData])

  usePusherBids(handleRealtimeBid)

  const topThreeSites = sites.slice(0, 3)

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffSec = Math.floor(diffMs / 1000)
      if (diffSec < 60) return "a few seconds ago"
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr}h ago`
      return "today"
    } catch {
      return "recent"
    }
  }

  const handleOpenBid = (site: RankingSite) => {
    setSelectedSiteForBid(site)
    setIsBidModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar
        currentView="today"
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
      />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header con estilo llamativo */}
          <div className="mb-8 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-1.5 text-xs font-bold text-[#FF4A1C] shadow-xs mb-4 animate-in fade-in">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A1C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4A1C]"></span>
              </span>
              <Flame className="h-4 w-4" />
              <span>Live · Last 24 Hours Activity</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight title-tight">
              Today's Rankings & Bids
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2 leading-relaxed">
              Discover which projects are dominating the spots today, how much capital has been bid in the last 24 hours, and the live transaction feed.
            </p>
          </div>

          {/* 4 Tarjetas de Métricas de Hoy */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            
            {/* Total Invertido Hoy */}
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Volume Today (24h)
                </span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-[#FF4A1C]">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#FF4A1C] tabular-nums tracking-tight">
                  {formatCurrency(stats.totalRevenueToday)}
                </span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                  total volume bid today
                </span>
              </div>
            </div>

            {/* Total de Pujas Hoy */}
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Bids Placed
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums tracking-tight">
                  {stats.bidsCountToday}
                </span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                  movements recorded
                </span>
              </div>
            </div>

            {/* Proyectos Activos Hoy */}
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Active Projects
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Rocket className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums tracking-tight">
                  {stats.activeSitesToday}
                </span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                  with bids today
                </span>
              </div>
            </div>

            {/* Líder de Hoy (#1) */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" />
                  Leader of the Day
                </span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                  #1 TODAY
                </span>
              </div>
              <div>
                {stats.topSite ? (
                  <Link
                    href={`/site/${stats.topSite.slug}`}
                    className="group flex flex-col"
                  >
                    <span className="text-lg font-extrabold text-[var(--foreground)] truncate group-hover:text-[#FF4A1C] transition-colors">
                      {stats.topSite.name}
                    </span>
                    <span className="text-xs font-black text-[#FF4A1C] tabular-nums mt-0.5">
                      {formatCurrency(stats.topSite.amount)}
                    </span>
                  </Link>
                ) : (
                  <span className="text-xs text-[var(--muted)]">No leader today yet</span>
                )}
              </div>
            </div>

          </div>

          {/* Selector de Pestañas: Ranking de Hoy vs Feed en Vivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--card-border)] pb-4">
            
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--muted-bg)] p-1 border border-[var(--card-border)] text-xs font-bold w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("ranking")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                  activeTab === "ranking"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-black text-[#FF4A1C]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <ListOrdered className="h-4 w-4" />
                <span>Leaderboard Rankings</span>
                <span className="rounded-full bg-[#FF4A1C]/10 text-[#FF4A1C] px-2 py-0.2 text-[10px]">
                  {sites.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("feed")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                  activeTab === "feed"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-black text-[#FF4A1C]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>Live Bids & Purchases Feed</span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px]">
                  {activityFeed.length}
                </span>
              </button>
            </div>

            {/* CTA Publicar */}
            <Link
              href="/dashboard/sites/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4A1C] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#E63D10] transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Outbid & Claim Spot Today</span>
            </Link>

          </div>

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

          {/* VISTA 1: Ranking de Posiciones de Hoy */}
          {activeTab === "ranking" && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Lista Completa del Ranking (incluye Top 3 internamente en página 1) */}
              {loading && sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C] mb-3" />
                  <p className="text-xs font-semibold">Loading today's rankings...</p>
                </div>
              ) : (
                <RankingList
                  initialSites={sites}
                  total={total}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onRefresh={fetchDailyData}
                  lastBidSiteId={lastBidSiteId}
                />
              )}

            </div>
          )}

          {/* VISTA 2: Feed en Vivo de Compras y Pujas */}
          {activeTab === "feed" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft animate-in fade-in space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <History className="h-5 w-5 text-[#FF4A1C]" />
                    <span>Chronological Log of Purchases & Bids (24h)</span>
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Every time a creator or user claims a spot or places a bid, it appears here in real-time.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live updates active
                </span>
              </div>

              {activityFeed.length === 0 ? (
                <div className="text-center py-16 text-[var(--muted)]">
                  <Flame className="h-10 w-10 mx-auto text-[var(--muted)]/40 mb-3" />
                  <p className="text-sm font-bold text-[var(--foreground)]">No bids recorded today yet</p>
                  <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                    Be the first to place a bid today to claim the #1 spot of the day.
                  </p>
                  <Link
                    href="/dashboard/sites/new"
                    className="inline-flex items-center gap-2 mt-4 rounded-xl bg-[#FF4A1C] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E63D10] transition-all"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Submit or Bid Now</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {activityFeed.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--muted-bg)]/40 px-3 rounded-2xl transition-colors"
                    >
                      {/* Usuario y Proyecto */}
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            item.user.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user.handle || item.user.name || "user"}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-full border border-[var(--card-border)] bg-white object-cover"
                        />

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[var(--foreground)]">
                              @{item.user.handle || item.user.name || "user"}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              bid on
                            </span>
                            <Link
                              href={`/site/${item.site.slug}`}
                              className="text-xs font-black text-[var(--foreground)] hover:text-[#FF4A1C] transition-colors inline-flex items-center gap-1"
                            >
                              <img
                                src={getFaviconUrl(item.site.url, 24)}
                                alt=""
                                className="h-3.5 w-3.5 rounded-xs inline"
                              />
                              <span>{item.site.name}</span>
                            </Link>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--muted)]">
                            <span className="rounded-md bg-[var(--muted-bg)] px-2 py-0.5 font-medium">
                              {item.site.category}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Monto y Botón de Superar */}
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-xs text-[var(--muted)] block font-medium">
                            Amount Paid
                          </span>
                          <span className="text-lg font-black text-[#FF4A1C] tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>

                        <Link
                          href={`/site/${item.site.slug}`}
                          className="h-9 px-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-xs font-bold text-[var(--foreground)] hover:border-[#FF4A1C] hover:text-[#FF4A1C] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>View project</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Modal de Pujas */}
      <BidModal
        site={selectedSiteForBid}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onBidSuccess={() => {
          fetchDailyData()
          setIsBidModalOpen(false)
        }}
      />

      <Footer />
    </div>
  )
}
