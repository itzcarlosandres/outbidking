"use client"

import React, { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import { RankingSite } from "@/lib/ranking"
import { firePodiumConfetti, fireSideCannons } from "@/lib/confetti"
import {
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react"

interface BidModalProps {
  site: RankingSite | null
  minIncrement?: number
  isOpen: boolean
  onClose: () => void
  onBidSuccess: (updatedBid: { siteId: string; amount: number; newRank: number }) => void
}

export function BidModal({
  site,
  minIncrement = 5,
  isOpen,
  onClose,
  onBidSuccess,
}: BidModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Calcular puja mínima
  const currentWinning = site ? site.winningBid : 0
  const minRequired = currentWinning > 0 ? currentWinning + minIncrement : minIncrement
  const [bidAmount, setBidAmount] = useState<number>(minRequired)

  // Sincronizar monto si cambia el sitio seleccionado
  React.useEffect(() => {
    if (site) {
      const min = site.winningBid > 0 ? site.winningBid + minIncrement : minIncrement
      setBidAmount(min)
      setError(null)
      setSuccessMsg(null)
    }
  }, [site, minIncrement])

  const [paymentMethod, setPaymentMethod] = useState<"NOWPAYMENTS" | "MANUAL_TEST">("NOWPAYMENTS")
  const [userHandle, setUserHandle] = useState("")

  if (!isOpen || !site) return null

  const isOwner = session?.user?.id === site.owner.id

  const handleIncrement = (extra: number) => {
    setBidAmount((prev) => Math.max(minRequired, prev + extra))
  }

  const handleConfirmBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (bidAmount < minRequired) {
      setError(`Minimum bid must be at least ${formatCurrency(minRequired)}`)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site.id,
          amount: bidAmount,
          paymentMethod,
          userHandle: userHandle.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to process bid")
      }

      // Si es NOWPayments, redirigir al checkout oficial / sandbox
      if (data.isNowPayments && data.invoiceUrl) {
        setSuccessMsg("Invoice created successfully. Redirecting to crypto checkout...")
        setTimeout(() => {
          window.location.href = data.invoiceUrl
        }, 800)
        return
      }

      setSuccessMsg(`Bid of ${formatCurrency(bidAmount)} confirmed successfully!`)

      // Disparar confeti de celebración
      firePodiumConfetti()
      if ((data.newRank || 1) <= 3) {
        setTimeout(() => {
          fireSideCannons()
        }, 300)
      }

      setTimeout(() => {
        onBidSuccess({
          siteId: site.id,
          amount: bidAmount,
          newRank: data.newRank || 1,
        })
        onClose()
      }, 1200)
    } catch (err: any) {
      setError(err.message || "Failed to process bid")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header del Modal */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src={getFaviconUrl(site.url, 64)}
            alt={site.name}
            className="h-12 w-12 rounded-2xl bg-white p-2 shadow-xs border border-[var(--card-border)] object-contain"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />
          <div>
            <span className="text-xs font-bold text-[#FF4A1C] uppercase tracking-wider block">
              Outbid Project
            </span>
            <h3 className="text-lg font-black text-[var(--foreground)] leading-tight">
              {site.name}
            </h3>
          </div>
        </div>

        {/* Card Informativa de Valores Actuales */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[var(--muted-bg)] p-4 border border-[var(--card-border)] mb-5 text-center">
          <div>
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider block">
              Current Winning Bid
            </span>
            <span className="text-xl font-extrabold text-[var(--foreground)] tabular-nums">
              {formatCurrency(site.winningBid)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider block">
              Minimum to Outbid
            </span>
            <span className="text-xl font-black text-[#FF4A1C] tabular-nums">
              {formatCurrency(minRequired)}
            </span>
          </div>
        </div>

        {/* Formulario Directo de Puja */}
        <form onSubmit={handleConfirmBid} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Campo de Alias si no está logueado */}
          {!session?.user && (
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Your Nickname / Handle <span className="text-[var(--muted)] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. cryptonick, alex_dev..."
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-medium text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[var(--foreground)]">
                Your Bid Amount ($ USD)
              </label>
              <span className="text-[11px] font-semibold text-[#FF4A1C]">
                {isOwner ? "👑 You own this project — boost your rank!" : "Compete for this ranking spot"}
              </span>
            </div>

            <div className="flex items-center justify-between h-14 rounded-2xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-3 transition-all focus-within:border-[#FF4A1C] focus-within:ring-2 focus-within:ring-[#FF4A1C]/20">
              <button
                type="button"
                onClick={() => setBidAmount((prev) => Math.max(minRequired, prev - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] active:scale-95 transition-all cursor-pointer select-none"
                aria-label="Decrease bid"
              >
                −
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-[var(--muted)]">$</span>
                <input
                  type="number"
                  min={minRequired}
                  step="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Math.max(minRequired, Number(e.target.value) || minRequired))}
                  className="w-24 text-center text-2xl sm:text-3xl font-black text-[var(--foreground)] bg-transparent focus:outline-hidden tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Bid amount"
                />
              </div>
              <button
                type="button"
                onClick={() => setBidAmount((prev) => prev + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] active:scale-95 transition-all cursor-pointer select-none"
                aria-label="Increase bid"
              >
                +
              </button>
            </div>

            {/* Botones de incremento rápido */}
            <div className="flex items-center gap-2 mt-2">
              {[5, 25, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleIncrement(inc)}
                  className="flex-1 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] text-xs font-bold text-[var(--foreground)] hover:border-[#FF4A1C] hover:text-[#FF4A1C] transition-colors cursor-pointer"
                >
                  +{inc}$
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
              Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("NOWPAYMENTS")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "NOWPAYMENTS"
                    ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                    : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--foreground)]">Cryptocurrency</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] text-[var(--muted)] leading-tight">
                  USDT, SOL, BTC, ETH (NOWPayments)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("MANUAL_TEST")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "MANUAL_TEST"
                    ? "border-[#FF4A1C] bg-[#FF4A1C]/10 shadow-xs"
                    : "border-[var(--card-border)] bg-[var(--card)] hover:border-[#FF4A1C]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--foreground)]">Test Mode</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <span className="text-[10px] text-[var(--muted)] leading-tight">
                  Instant 1-click test confirmation
                </span>
              </button>
            </div>
          </div>

          {/* Explicación de cómo funciona el ranking de pujas */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-3.5 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
              <Sparkles className="h-4 w-4 text-[#FF4A1C]" />
              <span>Instant Rank Upgrade</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              As soon as the payment of <strong>{formatCurrency(bidAmount)}</strong> is confirmed via blockchain or test mode, this project will instantly climb the leaderboard.
            </p>
          </div>

          {/* Botón de Confirmación */}
          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full h-14 rounded-2xl bg-[#FF4A1C] text-white font-black text-base shadow-lg shadow-[#FF4A1C]/25 hover:bg-[#E63D10] hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing checkout...</span>
              </>
            ) : paymentMethod === "NOWPAYMENTS" ? (
              <>
                <TrendingUp className="h-5 w-5" />
                <span>Pay with Crypto — {formatCurrency(bidAmount)}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Confirm in Test Mode — {formatCurrency(bidAmount)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
