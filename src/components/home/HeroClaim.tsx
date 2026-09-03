"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import { CategoryData, INITIAL_CATEGORIES } from "@/lib/categories"
import { ArrowRight, Crown, Globe, Medal, Sparkles, TrendingUp, Trophy, Users, Zap } from "lucide-react"

interface HeroClaimProps {
  topPrice?: number
  rankingSites?: Array<{ winningBid: number; position?: number; id?: string }>
  onlineCount?: number
  totalVisitors?: number
}

export function HeroClaim({
  topPrice = 0,
  rankingSites = [],
  onlineCount = 87,
  totalVisitors = 1483786,
}: HeroClaimProps) {
  const router = useRouter()
  const [urlInput, setUrlInput] = useState("")
  const [faviconError, setFaviconError] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [categoryInput, setCategoryInput] = useState<string>("AI Agents & Infrastructure")
  const targetTopOneBid = topPrice > 0 ? topPrice + 5 : 5
  const [bidAmount, setBidAmount] = useState<number>(targetTopOneBid)
  const [userHasModifiedBid, setUserHasModifiedBid] = useState(false)
  const [onlineLive, setOnlineLive] = useState(onlineCount)

  // Sincronizar con el precio del #1 en tiempo real si el usuario no ha editado manualmente
  useEffect(() => {
    if (!userHasModifiedBid) {
      setBidAmount(topPrice > 0 ? topPrice + 5 : 5)
    }
  }, [topPrice, userHasModifiedBid])

  // Cálculo en tiempo real del puesto proyectado que comprará según el monto
  const projectedRank = useMemo(() => {
    if (!rankingSites || rankingSites.length === 0) return 1
    const higherCount = rankingSites.filter((s) => (s.winningBid || 0) >= bidAmount).length
    return higherCount + 1
  }, [bidAmount, rankingSites])

  // Extraer dominio limpio para obtener el favicon automáticamente
  const cleanDomain = urlInput
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
  const isValidDomain = cleanDomain.includes(".") && cleanDomain.length > 3
  const autoFavicon = isValidDomain && !faviconError ? getFaviconUrl(cleanDomain, 64) : null

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          const active = data.categories.filter((c: CategoryData) => c.isActive)
          setCategories(active)
          if (active[0]) setCategoryInput(active[0].name)
        }
      })
      .catch(() => {
        setCategories(
          INITIAL_CATEGORIES.map((c, i) => ({
            id: `init-${i}`,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            order: c.order,
            isActive: true,
          }))
        )
      })
  }, [])

  // Fluctuación sutil del contador de usuarios online
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineLive((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2
        return Math.max(50, prev + delta)
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (urlInput.trim()) query.set("url", urlInput.trim())
    if (categoryInput) query.set("category", categoryInput)
    if (bidAmount) query.set("bid", bidAmount.toString())
    router.push(`/dashboard/sites/new?${query.toString()}`)
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-14 md:pt-16 md:pb-20 text-center">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[300px] bg-[#FF4A1C]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Pill Superior con fluctuación */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-1.5 text-xs font-bold text-[var(--foreground)] shadow-xs transition-transform hover:scale-102 mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{onlineLive} online</span>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">
            {new Intl.NumberFormat("en-US").format(totalVisitors)} visitors
          </span>
          <span className="text-[var(--muted)]">·</span>
          <a href="#stats" className="text-[#FF4A1C] hover:underline flex items-center gap-1 font-bold">
            view stats
          </a>
        </div>

        {/* H1 Gigante Dinámico */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight title-tight text-[var(--foreground)] leading-[1.1] mb-5">
          Claim <span className="text-[#FF4A1C] font-black">#{projectedRank}</span> for{" "}
          <span className="tabular-nums font-black text-[#FF4A1C] inline-block transition-all duration-300">
            {formatCurrency(bidAmount)}
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-[var(--muted)] font-normal leading-relaxed mb-8">
          Submit your website, channel, or product and compete in live bids for the top ranking spot.
          The <span className="font-semibold text-[var(--foreground)]">Top 3</span> gets maximum visibility and direct traffic.
        </p>

        {/* Formulario Inline en una fila (se apila en mobile) */}
        <form
          onSubmit={handleClaim}
          className="mx-auto max-w-4xl rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-2 sm:p-2.5 shadow-soft flex flex-col md:flex-row items-stretch gap-2 transition-shadow hover:shadow-md"
        >
          <div className="relative flex-1 flex items-center min-w-0">
            {/* Cuadro redondo para el icono/favicon automático */}
            <div className="absolute left-2.5 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--card-border)] bg-[var(--card)] shadow-2xs overflow-hidden shrink-0 z-10 transition-all">
              {autoFavicon ? (
                <img
                  src={autoFavicon}
                  alt="Site icon"
                  className="w-5 h-5 object-contain rounded-full transition-transform duration-200"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Globe className="w-4 h-4 text-[var(--muted)]" />
              )}
            </div>

            <input
              type="text"
              placeholder="Your product URL (e.g. mysite.com)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setFaviconError(false)
              }}
              className="w-full h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] pl-12 pr-4 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:border-[#FF4A1C] focus:ring-2 focus:ring-[#FF4A1C]/20 transition-all"
            />
          </div>

          <div className="md:w-52 shrink-0">
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              aria-label="Select a category for your product"
              className="w-full h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] px-3 text-xs sm:text-sm font-medium text-[var(--foreground)] focus:outline-hidden focus:border-[#FF4A1C] focus:ring-2 focus:ring-[#FF4A1C]/20 transition-all cursor-pointer truncate"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stepper de Puja [-] $ 22 [+] */}
          <div className="flex items-center justify-between h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 w-full md:w-36 shrink-0 transition-all focus-within:border-[#FF4A1C] focus-within:ring-2 focus-within:ring-[#FF4A1C]/20">
            <button
              type="button"
              onClick={() => {
                setUserHasModifiedBid(true)
                setBidAmount((prev) => Math.max(1, prev - 1))
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] active:scale-95 transition-all cursor-pointer select-none"
              aria-label="Decrease bid"
            >
              −
            </button>
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-sm font-semibold text-[var(--muted)]">$</span>
              <input
                type="number"
                min={1}
                step={1}
                value={bidAmount}
                onChange={(e) => {
                  setUserHasModifiedBid(true)
                  setBidAmount(Math.max(1, Number(e.target.value) || 1))
                }}
                className="w-14 text-center text-base sm:text-lg font-black text-[var(--foreground)] bg-transparent focus:outline-hidden tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Bid amount"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setUserHasModifiedBid(true)
                setBidAmount((prev) => prev + 1)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] active:scale-95 transition-all cursor-pointer select-none"
              aria-label="Increase bid"
            >
              +
            </button>
          </div>

          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-[#FF4A1C] text-white font-bold text-sm shadow-sm transition-all hover:bg-[#E63D10] hover:shadow-md active:scale-98 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>
              {projectedRank === 1 ? "Claim #1 Spot 👑" : `Claim #${projectedRank} Spot`}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Indicador visual de puesto proyectado en vivo */}
        <div className="mt-4 flex items-center justify-center">
          {projectedRank === 1 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-2xs animate-in fade-in zoom-in duration-200">
              <Crown className="h-4 w-4 text-amber-500 animate-bounce" />
              <span>You will claim Position #1 — Leader of the Platform!</span>
            </div>
          ) : projectedRank <= 3 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-[#FF4A1C] shadow-2xs animate-in fade-in zoom-in duration-200">
              <Trophy className="h-4 w-4 text-[#FF4A1C]" />
              <span>You will claim Position #{projectedRank} — Top 3 Podium Spotlight</span>
            </div>
          ) : projectedRank <= 10 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 shadow-2xs animate-in fade-in zoom-in duration-200">
              <Medal className="h-4 w-4 text-blue-500" />
              <span>You will claim Position #{projectedRank} — Top 10 Leaderboard</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-1.5 text-xs font-bold text-[var(--muted)] shadow-2xs animate-in fade-in zoom-in duration-200">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>You will claim Position #{projectedRank} on Active Rankings</span>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
