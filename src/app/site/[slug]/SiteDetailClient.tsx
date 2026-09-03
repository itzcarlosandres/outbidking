"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BidModal } from "@/components/ranking/BidModal"
import { formatCurrency, getFaviconUrl, getDomain } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  MousePointerClick,
  Share2,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react"
import Link from "next/link"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface SiteDetailClientProps {
  site: any
}

export function SiteDetailClient({ site: initialSite }: SiteDetailClientProps) {
  const [site, setSite] = useState(initialSite)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)

  // Datos formateados para el gráfico de Recharts
  const chartData = [...site.bids]
    .reverse()
    .map((b: any, index: number) => ({
      index: index + 1,
      date: new Date(b.createdAt).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
      monto: b.amount,
      user: `@${b.user.handle || "usuario"}`,
    }))

  const handleBidSuccess = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* Botón Volver */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to ranking</span>
          </Link>

          {/* Header del Proyecto */}
          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <img
                  src={getFaviconUrl(site.url, 96)}
                  alt={site.name}
                  className="h-16 w-16 rounded-2xl bg-white p-2 shadow-xs border border-[var(--card-border)] object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = "none"
                  }}
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-xl bg-[#FF4A1C] px-2.5 py-0.5 text-xs font-black text-white shadow-2xs">
                      #{site.position} on Leaderboard
                    </span>
                    <span className="rounded-xl bg-[var(--muted-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--muted)]">
                      {site.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                    {site.name}
                  </h1>

                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Submitted by @{site.owner.handle || "creator"} · {getDomain(site.url)}
                  </p>
                </div>
              </div>

              {/* Botón de Visita Externa */}
              <div className="flex items-center gap-3">
                <a
                  href={`/api/go/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-xl bg-[#FF4A1C] text-white font-bold text-sm shadow-sm hover:bg-[#E63D10] transition-all flex items-center gap-2"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

            </div>

            {/* Descripción Completa */}
            <p className="text-sm sm:text-base text-[var(--foreground)]/90 leading-relaxed mt-6 pt-6 border-t border-[var(--card-border)]">
              {site.description}
            </p>

            {/* Métricas clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--card-border)]">
              <div className="rounded-2xl bg-[var(--muted-bg)] p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                  Winning Bid
                </span>
                <span className="text-xl font-black text-[#FF4A1C] tabular-nums">
                  {formatCurrency(site.winningBid)}
                </span>
              </div>

              <div className="rounded-2xl bg-[var(--muted-bg)] p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                  Total Clicks
                </span>
                <span className="text-xl font-black text-[var(--foreground)] tabular-nums">
                  {new Intl.NumberFormat("en-US").format(site.clicks)}
                </span>
              </div>

              <div className="rounded-2xl bg-[var(--muted-bg)] p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                  Total Bids
                </span>
                <span className="text-xl font-black text-[var(--foreground)] tabular-nums">
                  {site.bids.length}
                </span>
              </div>

              <div className="rounded-2xl bg-[var(--muted-bg)] p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                  Expires On
                </span>
                <span className="text-sm font-bold text-[var(--foreground)] mt-1 block">
                  {new Date(site.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* CTA de Superar Puja & Gráfico de Evolución */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Card de Puja Rápida */}
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#FF4A1C]">
                  <Flame className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Boost this ranking spot
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                  Outbid the current winning bid of <strong className="text-[var(--foreground)]">{formatCurrency(site.winningBid)}</strong> to secure a top position.
                </p>
              </div>

              <button
                onClick={() => setIsBidModalOpen(true)}
                className="w-full h-13 rounded-2xl bg-[#FF4A1C] text-white font-black text-sm shadow-md hover:bg-[#E63D10] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Outbid this spot (+${5})</span>
              </button>
            </div>

            {/* Gráfico de Evolución de Pujas */}
            <div className="lg:col-span-2 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
              <h2 className="text-base font-bold text-[var(--foreground)] mb-4">
                Bid History Over Time
              </h2>

              <div className="h-60 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                      <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} />
                      <YAxis stroke="var(--muted)" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--card-border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(value: any) => [`$${value}`, "Bid"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="monto"
                        stroke="#FF4A1C"
                        strokeWidth={3}
                        dot={{ fill: "#FF4A1C", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--muted)]">
                    Not enough data to display chart yet.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Tabla de Historial de Pujas */}
          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">
              Detailed Bid History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                    <th className="pb-3 font-semibold uppercase">User</th>
                    <th className="pb-3 font-semibold uppercase">Amount</th>
                    <th className="pb-3 font-semibold uppercase">Date</th>
                    <th className="pb-3 font-semibold uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {site.bids.map((b: any) => (
                    <tr key={b.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                      <td className="py-3 font-medium text-[var(--foreground)] flex items-center gap-2">
                        <img
                          src={b.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.user.handle}`}
                          alt=""
                          className="h-6 w-6 rounded-full border border-[var(--card-border)]"
                        />
                        <span>@{b.user.handle || "user"}</span>
                      </td>
                      <td className="py-3 font-bold text-[#FF4A1C] tabular-nums text-sm">
                        {formatCurrency(b.amount)}
                      </td>
                      <td className="py-3 text-[var(--muted)]">
                        {new Date(b.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 text-right">
                        {b.isWinning ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Winning
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--muted)]">Outbid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <BidModal
        site={site}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onBidSuccess={handleBidSuccess}
      />

      <Footer />
    </div>
  )
}
