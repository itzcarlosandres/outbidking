"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getCategoryIcon } from "@/lib/categories"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Flame,
  Globe,
  Grid,
  Loader2,
  PlusCircle,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"

interface CategorySite {
  id: string
  name: string
  slug: string
  url: string
  description: string
  winningBid: number
  clicks: number
}

interface CategoryOverviewItem {
  id: string
  name: string
  slug: string
  icon: string
  order: number
  totalSites: number
  totalVolume: number
  topSites: CategorySite[]
  leader: CategorySite | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryOverviewItem[]>([])
  const [mostActive, setMostActive] = useState<CategoryOverviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/api/categories/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
        if (data.mostActive) setMostActive(data.mostActive)
      })
      .catch((e) => console.error("Error cargando categorías:", e))
      .finally(() => setLoading(false))
  }, [])

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          {/* Header Principal */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-[var(--foreground)] tracking-tight title-tight mb-3">
              Categories
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Every category features its own independent leaderboard. Select a category to explore leading projects or compete for the #1 spot.
            </p>

            {/* Buscador de Categorías */}
            <div className="mt-6 max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search by category name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-11 pr-4 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:border-[#FF4A1C] focus:ring-2 focus:ring-[#FF4A1C]/20 shadow-xs transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-[var(--muted)]">
              <Loader2 className="h-9 w-9 animate-spin text-[#FF4A1C] mb-4" />
              <p className="text-xs font-semibold">Loading category rankings...</p>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in">
              
              {/* SECCIÓN 1: Categorías Más Activas (Highlight Banner) */}
              {!searchQuery && mostActive.length > 0 && (
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-7 shadow-soft">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A1C] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4A1C]"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF4A1C] flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      Most Active Categories
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-5">
                    Where spots are being contested right now and who holds the leadership.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mostActive.map((item, idx) => {
                      const IconComp = getCategoryIcon(item.icon)
                      const badgeLabel = idx === 0 ? "#1 MOST POPULAR" : `#${idx + 1}`

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)]/60 p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF4A1C]/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4A1C] bg-[#FF4A1C]/10 px-2 py-0.5 rounded-md">
                                {badgeLabel}
                              </span>
                              <span className="text-[11px] text-[var(--muted)] font-medium">
                                {item.totalSites} {item.totalSites === 1 ? "project" : "projects"}
                              </span>
                            </div>

                            <Link
                              href={`/?category=${encodeURIComponent(item.name)}`}
                              className="group flex items-center gap-2 text-sm sm:text-base font-extrabold text-[var(--foreground)] group-hover:text-[#FF4A1C] transition-colors"
                            >
                              <IconComp className="h-4 w-4 text-[#FF4A1C] shrink-0" />
                              <span className="group-hover:text-[#FF4A1C] transition-colors truncate">
                                {item.name}
                              </span>
                            </Link>

                            <div className="text-[11px] text-[var(--muted)] mt-1">
                              Total volume: <strong className="text-[var(--foreground)]">{formatCurrency(item.totalVolume)}</strong>
                            </div>
                          </div>

                          {/* Proyecto Líder */}
                          {item.leader ? (
                            <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={getFaviconUrl(item.leader.url, 32)}
                                  alt=""
                                  className="h-5 w-5 rounded-md shrink-0 bg-white p-0.5 border border-[var(--card-border)]"
                                  onError={(e) => {
                                    ;(e.target as HTMLElement).style.display = "none"
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="text-[10px] text-[var(--muted)] block">Current leader</span>
                                  <Link
                                    href={`/site/${item.leader.slug}`}
                                    className="text-xs font-bold text-[var(--foreground)] hover:text-[#FF4A1C] transition-colors truncate block"
                                  >
                                    {item.leader.name}
                                  </Link>
                                </div>
                              </div>

                              <span className="text-xs font-black text-[#FF4A1C] tabular-nums whitespace-nowrap">
                                {formatCurrency(item.leader.winningBid)}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-4 pt-3 border-t border-[var(--card-border)] text-[11px] text-[var(--muted)]">
                              No leader recorded yet
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: Grid Completo de Todas las Categorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((cat) => {
                  const IconComp = getCategoryIcon(cat.icon)
                  const hasSites = cat.topSites.length > 0

                  return (
                    <div
                      key={cat.id}
                      className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--card-border)]">
                          <Link
                            href={`/?category=${encodeURIComponent(cat.name)}`}
                            className="flex items-center gap-2.5 min-w-0"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--muted-bg)] group-hover:bg-[#FF4A1C]/10 text-[#FF4A1C] transition-colors">
                              <IconComp className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[#FF4A1C] transition-colors truncate">
                              {cat.name}
                            </h2>
                          </Link>

                          <Link
                            href={`/?category=${encodeURIComponent(cat.name)}`}
                            className="text-[11px] font-bold text-[var(--muted)] group-hover:text-[#FF4A1C] transition-colors flex items-center shrink-0"
                            aria-label={`View ranking of ${cat.name}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>

                        {/* Filas del Top 3 de la Categoría */}
                        {hasSites ? (
                          <div className="space-y-2.5">
                            {cat.topSites.map((site, index) => {
                              const rankNum = index + 1
                              return (
                                <div
                                  key={site.id}
                                  className="flex items-center justify-between gap-2 text-xs py-1"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`text-[10px] font-black rounded-md px-1.5 py-0.5 shrink-0 ${
                                        rankNum === 1
                                          ? "bg-[#FF4A1C] text-white"
                                          : rankNum === 2
                                          ? "bg-slate-200 dark:bg-slate-800 text-[var(--foreground)]"
                                          : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                                      }`}
                                    >
                                      #{rankNum}
                                    </span>

                                    <img
                                      src={getFaviconUrl(site.url, 32)}
                                      alt=""
                                      className="h-4 w-4 rounded-xs shrink-0 bg-white p-0.5 border border-[var(--card-border)]"
                                      onError={(e) => {
                                        ;(e.target as HTMLElement).style.display = "none"
                                      }}
                                    />

                                    <Link
                                      href={`/site/${site.slug}`}
                                      className="font-semibold text-[var(--foreground)] hover:text-[#FF4A1C] transition-colors truncate max-w-[150px]"
                                    >
                                      {site.name}
                                    </Link>
                                  </div>

                                  <span className="font-bold text-[#FF4A1C] tabular-nums whitespace-nowrap text-[11px]">
                                    {formatCurrency(site.winningBid)}
                                  </span>
                                </div>
                              )
                            })}

                            {/* Si hay menos de 3 proyectos, rellenar con puestos libres */}
                            {cat.topSites.length < 3 && (
                              <Link
                                href={`/dashboard/sites/new?category=${encodeURIComponent(cat.name)}`}
                                className="block text-center py-2 px-3 rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--muted-bg)]/30 text-[11px] text-[var(--muted)] hover:border-[#FF4A1C] hover:text-[#FF4A1C] transition-colors mt-2"
                              >
                                + Claim spot #{cat.topSites.length + 1}
                              </Link>
                            )}
                          </div>
                        ) : (
                          /* Estado vacío si no hay proyectos en la categoría */
                          <div className="py-6 text-center">
                            <p className="text-xs text-[var(--muted)] mb-3">
                              No projects in this category yet.
                            </p>
                            <Link
                              href={`/dashboard/sites/new?category=${encodeURIComponent(cat.name)}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4A1C]/10 hover:bg-[#FF4A1C] text-[#FF4A1C] hover:text-white px-3.5 py-1.5 text-xs font-bold transition-colors"
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>Claim #1</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Footer de la Tarjeta */}
                      <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-[11px]">
                        <span className="text-[var(--muted)]">
                          {cat.totalSites} {cat.totalSites === 1 ? "registered project" : "registered projects"}
                        </span>
                        <Link
                          href={`/?category=${encodeURIComponent(cat.name)}`}
                          className="font-bold text-[#FF4A1C] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View ranking</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
