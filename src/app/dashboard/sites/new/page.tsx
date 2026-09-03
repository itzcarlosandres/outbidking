"use client"

import React, { useState, useEffect, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryData, INITIAL_CATEGORIES } from "@/lib/categories"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Crown,
  Flame,
  Globe,
  HelpCircle,
  Loader2,
  Medal,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"

function PublishWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [url, setUrl] = useState(searchParams.get("url") || "")
  const [description, setDescription] = useState("")
  const [ownerHandle, setOwnerHandle] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "AI Agents & Infrastructure"
  )
  
  // Bidding state
  const [initialBid, setInitialBid] = useState<number>(() => {
    const p = searchParams.get("bid")
    return p && !isNaN(Number(p)) && Number(p) > 0 ? Number(p) : 22
  })
  const [rankingList, setRankingList] = useState<Array<{ id: string; winningBid: number; name: string }>>([])
  const [loadingRanking, setLoadingRanking] = useState(true)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          const active = data.categories.filter((c: CategoryData) => c.isActive)
          setCategories(active)
          const requestedCat = searchParams.get("category")
          if (requestedCat) {
            const found = active.find(
              (c: CategoryData) =>
                c.name.toLowerCase() === requestedCat.toLowerCase() ||
                c.slug.toLowerCase() === requestedCat.toLowerCase()
            )
            if (found) setCategory(found.name)
          } else if (active[0]) {
            setCategory(active[0].name)
          }
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

    // Fetch current ranking to calculate thresholds
    fetch("/api/ranking?limit=100&view=all")
      .then((res) => res.json())
      .then((data) => {
        if (data.sites) {
          setRankingList(
            data.sites.map((s: any) => ({
              id: s.id,
              winningBid: s.winningBid || 0,
              name: s.name,
            }))
          )
        }
      })
      .catch((e) => console.error("Error cargando ranking base:", e))
      .finally(() => setLoadingRanking(false))
  }, [searchParams])

  // Auto-deducir nombre a partir de URL si está vacío
  useEffect(() => {
    if (url && !name) {
      try {
        const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
        const clean = hostname.replace(/^www\./, "").split(".")[0]
        setName(clean.charAt(0).toUpperCase() + clean.slice(1))
      } catch {}
    }
  }, [url, name])

  // Cálculo en tiempo real del puesto proyectado
  const projectedRank = useMemo(() => {
    if (!rankingList.length) return 1
    // Contar cuántos sitios tienen una puja mayor a initialBid
    const higherCount = rankingList.filter((s) => s.winningBid >= initialBid).length
    return higherCount + 1
  }, [initialBid, rankingList])

  // Puntos de referencia calculados dinámicamente
  const top1Bid = rankingList[0] ? rankingList[0].winningBid + 5 : 100
  const top3Bid = rankingList[2] ? rankingList[2].winningBid + 5 : 50
  const top10Bid = rankingList[9] ? rankingList[9].winningBid + 5 : 25
  const minEntryBid = 5

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C]" />
      </div>
    )
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || name.length < 2) {
      setError("Name must be at least 2 characters long.")
      return
    }
    if (!url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      setError("Enter a valid URL starting with http:// or https://")
      return
    }
    if (!description.trim() || description.length < 10) {
      setError("Description must be between 10 and 200 characters long.")
      return
    }

    setStep(2)
  }

  const [paymentMethod, setPaymentMethod] = useState<"NOWPAYMENTS" | "MANUAL_TEST">("NOWPAYMENTS")

  const handleConfirmPublish = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          description,
          category,
          initialBid,
          paymentMethod,
          ownerHandle: ownerHandle.trim() || undefined,
          ownerEmail: ownerEmail.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project")
      }

      if (data.isNowPayments && data.invoiceUrl) {
        window.location.href = data.invoiceUrl
        return
      }

      router.push("/?published=true")
    } catch (err: any) {
      setError(err.message || "Failed to process submission")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          
          {/* Stepper Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
              Submit Project & Claim Spot
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-xl mx-auto">
              On <strong>puja.lol</strong>, rank positions are claimed via live bids. The higher your bid, the higher your project ranks and the more exposure you get.
            </p>

            {/* Steps Progress Bar */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {[
                { s: 1, label: "1. Information" },
                { s: 2, label: "2. Bid & Spot" },
                { s: 3, label: "3. Confirmation" },
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step >= item.s
                        ? "bg-[#FF4A1C] text-white shadow-xs"
                        : "bg-[var(--card-border)] text-[var(--muted)]"
                    }`}
                  >
                    {step > item.s ? <Check className="h-4 w-4" /> : item.s}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      step >= item.s ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.s < 3 && <div className="h-0.5 w-6 bg-[var(--card-border)]" />}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* PASO 1: Formulario del Sitio */}
          {step === 1 && (
            <form
              onSubmit={handleStep1Next}
              className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5 animate-in fade-in"
            >
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Project or Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ChatNode AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Website or Channel URL *
                </label>
                <input
                  type="url"
                  placeholder="https://yourdomain.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                  required
                />
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Favicon and click-tracking redirect will be generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[var(--foreground)]">
                    Short Description *
                  </label>
                  <span className="text-[11px] text-[var(--muted)]">
                    {description.length}/200
                  </span>
                </div>
                <textarea
                  placeholder="Describe what your product does, main benefits, and why people should try it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3.5 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden resize-none"
                  required
                />
              </div>

              {/* Campos opcionales de creador directo */}
              {!session?.user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Your Nickname / Creator <span className="text-[var(--muted)] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @alex_founder"
                      value={ownerHandle}
                      onChange={(e) => setOwnerHandle(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Contact Email <span className="text-[var(--muted)] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#FF4A1C] text-white font-bold text-sm shadow-sm hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Spot Bidding</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Selección de Puja Inicial y Puesto */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Tarjeta de Cálculo de Puesto en Tiempo Real */}
              <div className="rounded-3xl border-2 border-[#FF4A1C] bg-[#FFEEE4]/40 dark:bg-[#2A170F]/50 p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF4A1C] block mb-1">
                      Estimated Leaderboard Rank
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                        Rank #{projectedRank}
                      </span>
                      {projectedRank === 1 && (
                        <span className="flex items-center gap-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-black">
                          <Crown className="h-4 w-4" />
                          TOP OF LEADERBOARD!
                        </span>
                      )}
                      {projectedRank > 1 && projectedRank <= 3 && (
                        <span className="flex items-center gap-1 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-1 text-xs font-black">
                          <Trophy className="h-4 w-4" />
                          TOP 3 PODIUM
                        </span>
                      )}
                      {projectedRank > 3 && projectedRank <= 10 && (
                        <span className="flex items-center gap-1 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-black">
                          <Medal className="h-4 w-4" />
                          TOP 10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-[var(--card-border)] sm:pl-6">
                    <span className="text-xs text-[var(--muted)] block">Your Initial Bid</span>
                    <span className="text-3xl font-black text-[#FF4A1C] tabular-nums">
                      {formatCurrency(initialBid)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] mt-4 pt-3 border-t border-[var(--card-border)]/60">
                  ⚡ Your project will be listed with this initial winning bid. If another project outbids you, you will move down but can outbid anytime to rank back up.
                </p>
              </div>

              {/* Botones de Selección Rápida de Objetivos */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-3">
                  Quick Rank Targets:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Objetivo: Entrada Mínima */}
                  <button
                    type="button"
                    onClick={() => setInitialBid(minEntryBid)}
                    className={`rounded-2xl p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      initialBid === minEntryBid
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[var(--foreground)]">Base Entry</span>
                        <Zap className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-xl font-black text-[var(--foreground)] tabular-nums">
                        ${minEntryBid}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] mt-2">
                      Enter the active leaderboard
                    </span>
                  </button>

                  {/* Objetivo: Top 10 */}
                  <button
                    type="button"
                    onClick={() => setInitialBid(top10Bid)}
                    className={`rounded-2xl p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      initialBid === top10Bid
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[var(--foreground)]">Top 10</span>
                        <Medal className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xl font-black text-[var(--foreground)] tabular-nums">
                        ${top10Bid}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] mt-2">
                      Rank in the top 10
                    </span>
                  </button>

                  {/* Objetivo: Top 3 */}
                  <button
                    type="button"
                    onClick={() => setInitialBid(top3Bid)}
                    className={`rounded-2xl p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      initialBid === top3Bid
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[var(--foreground)]">Top 3 Podium</span>
                        <Trophy className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="text-xl font-black text-[var(--foreground)] tabular-nums">
                        ${top3Bid}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] mt-2">
                      Prominent header spotlight
                    </span>
                  </button>

                  {/* Objetivo: Reclamar #1 */}
                  <button
                    type="button"
                    onClick={() => setInitialBid(top1Bid)}
                    className={`rounded-2xl p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      initialBid === top1Bid
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#FF4A1C]">Claim #1</span>
                        <Crown className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-xl font-black text-[#FF4A1C] tabular-nums">
                        ${top1Bid}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] mt-2">
                      Maximum site visibility
                    </span>
                  </button>

                </div>
              </div>

              {/* Campo Personalizado para Ajustar Puja */}
              <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[var(--foreground)]">
                    Or enter your custom bid ($ USD)
                  </label>
                  <span className="text-xs text-[var(--muted)]">Minimum: $1 USD</span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-[var(--muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={initialBid}
                    onChange={(e) => setInitialBid(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-14 rounded-2xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-4 text-2xl font-black text-[var(--foreground)] tabular-nums focus:border-[#FF4A1C] focus:outline-hidden"
                  />
                </div>

                {/* Botones de incremento rápido */}
                <div className="flex items-center gap-2">
                  {[5, 10, 25, 50, 100].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setInitialBid((prev) => prev + inc)}
                      className="flex-1 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] text-xs font-bold text-[var(--foreground)] hover:border-[#FF4A1C] hover:text-[#FF4A1C] transition-colors cursor-pointer"
                    >
                      +{inc}$
                    </button>
                  ))}
                </div>
              </div>

              {/* Guía Explicativa del Funcionamiento del Ranking */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                  <HelpCircle className="h-4 w-4 text-[#FF4A1C]" />
                  <span>How does the bidding leaderboard work?</span>
                </div>
                <ul className="text-[11px] text-[var(--muted)] space-y-1 pl-6 list-disc">
                  <li><strong>Position-based ranking:</strong> You don't pay recurring subscriptions; you directly buy your spot on the leaderboard.</li>
                  <li><strong>Outbidding:</strong> If another project places a higher bid, they will take your spot and you move down one position.</li>
                  <li><strong>Defense & counter-bidding:</strong> You can place a new bid at any moment to climb or reclaim the #1 spot.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-12 px-6 rounded-xl bg-[#FF4A1C] text-white font-bold text-sm shadow-sm hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Resumen & Confirmación */}
          {step === 3 && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Review & Confirm Spot
              </h2>

              <div className="rounded-2xl bg-[var(--muted-bg)] p-5 border border-[var(--card-border)] space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getFaviconUrl(url, 48)}
                    alt={name}
                    className="h-10 w-10 rounded-xl bg-white p-1 shadow-2xs border border-[var(--card-border)]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">{name}</h3>
                    <p className="text-xs text-[var(--muted)]">{url}</p>
                  </div>
                </div>

                <p className="text-xs text-[var(--foreground)]/80 leading-relaxed pt-2 border-t border-[var(--card-border)]">
                  {description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">Category:</span>
                    <strong className="text-[var(--foreground)]">{category}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Estimated Rank:</span>
                    <strong className="text-[#FF4A1C]">Rank #{projectedRank}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Initial Bid:</span>
                    <strong className="text-[#FF4A1C]">{formatCurrency(initialBid)}</strong>
                  </div>
                </div>
              </div>

              {/* Selector de Pasarela / Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NOWPAYMENTS")}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === "NOWPAYMENTS"
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-[var(--foreground)]">Cryptocurrency (NOWPayments)</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      Pay with USDT (TRC20, Solana, Polygon), USDC, BTC, ETH, or SOL. Automated invoice and instant activation.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MANUAL_TEST")}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === "MANUAL_TEST"
                        ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-[var(--foreground)]">Test Mode / Simulated</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs" />
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      Instant test confirmation and rank positioning for local testing without real payments.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
                <div>
                  <span className="text-xs text-[var(--muted)] block">Total to Pay (Initial Winning Bid)</span>
                  <span className="text-2xl font-black text-[#FF4A1C] tabular-nums">
                    {formatCurrency(initialBid)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-[var(--muted)]">
                  {paymentMethod === "NOWPAYMENTS" ? "Official NOWPayments Invoice" : "Instant Confirmation (Test)"}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="h-12 px-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Modify Bid</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={loading}
                  className="h-12 px-8 rounded-xl bg-[#FF4A1C] text-white font-bold text-sm shadow-md hover:bg-[#E63D10] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Project...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      <span>Confirm & Claim Spot #{projectedRank} ({formatCurrency(initialBid)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PublishWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C]" />
        </div>
      }
    >
      <PublishWizardContent />
    </Suspense>
  )
}
