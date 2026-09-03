"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { RankingSite } from "@/lib/ranking"
import { formatCurrency, getFaviconUrl, getDomain } from "@/lib/utils"
import { firePodiumConfetti, fireStarsExplosion, fireSideCannons } from "@/lib/confetti"
import {
  ExternalLink,
  Flame,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  Trophy,
  Crown,
  Medal,
  Award,
  PartyPopper,
} from "lucide-react"

interface TopThreeProps {
  sites: RankingSite[]
  onSelectBidSite?: (site: RankingSite) => void
}

export function TopThree({ sites, onSelectBidSite }: TopThreeProps) {
  const [hasCelebrated, setHasCelebrated] = useState(false)

  if (!sites || sites.length === 0) return null

  const handleCelebrate = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setHasCelebrated(true)
    firePodiumConfetti()
    setTimeout(() => {
      fireStarsExplosion()
    }, 300)
  }

  return (
    <div className="mb-10 relative">
      {/* Encabezado del Podio con Botón de Celebración */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-xs">
            <Trophy className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
              <span>Podium of Champions (Top 3)</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4A1C]/10 dark:bg-[#FF4A1C]/20 border border-[#FF4A1C]/30 px-2.5 py-0.5 text-[10px] font-extrabold text-[#FF4A1C]">
                <Sparkles className="h-2.5 w-2.5" /> Maximum Exposure
              </span>
            </h2>
            <p className="text-xs text-[var(--muted)]">
              The 3 projects with the highest visibility, direct traffic, and clicks on the platform.
            </p>
          </div>
        </div>

        {/* Disparador de Confeti Interactivo */}
        <button
          type="button"
          onClick={handleCelebrate}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-orange-500/20 px-3.5 py-2 text-xs font-black text-amber-600 dark:text-amber-400 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <PartyPopper className="h-4 w-4 animate-bounce" />
          <span>🎉 Celebrate Top 3</span>
        </button>
      </div>

      {/* Grid del Podio con Animación Framer Motion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {sites.slice(0, 3).map((site, index) => {
          const rank = index + 1
          const isFirst = rank === 1
          const isSecond = rank === 2
          const isThird = rank === 3

          const RankIcon = isFirst ? Crown : isSecond ? Medal : Award

          // Paleta de colores temáticos por posición
          const cardStyles = isFirst
            ? "bg-gradient-to-b from-amber-500/10 via-[#FF4A1C]/5 to-transparent dark:from-amber-500/15 dark:via-[#FF4A1C]/10 border-amber-400/40 dark:border-amber-500/30 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/20"
            : isSecond
            ? "bg-gradient-to-b from-slate-300/15 via-[var(--card)] to-transparent dark:from-slate-700/20 border-slate-300 dark:border-slate-700 shadow-md"
            : "bg-gradient-to-b from-amber-700/10 via-[var(--card)] to-transparent dark:from-amber-900/15 border-amber-600/30 dark:border-amber-800/30 shadow-md"

          const badgeColor = isFirst
            ? "bg-gradient-to-r from-amber-500 to-[#FF4A1C] text-white shadow-amber-500/20"
            : isSecond
            ? "bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-slate-500/20"
            : "bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-amber-800/20"

          return (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => {
                if (isFirst && !hasCelebrated) handleCelebrate()
                onSelectBidSite?.(site)
              }}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between group backdrop-blur-xs ${cardStyles}`}
            >
              {/* Partículas decorativas en Top 1 */}
              {isFirst && (
                <div className="absolute -top-3 -right-2 flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-black uppercase shadow-lg shadow-amber-500/30 animate-pulse pointer-events-none">
                  <Sparkles className="h-3 w-3" /> #1 Current King
                </div>
              )}

              {/* Badge de Posición */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 items-center justify-center gap-1.5 px-3 rounded-xl font-black text-xs shadow-md ${badgeColor}`}
                  >
                    <RankIcon className="h-3.5 w-3.5" />
                    <span>#{rank}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {site.category}
                  </span>
                </div>

                <a
                  href={`/api/go/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-xl p-2 text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#FF4A1C] transition-colors"
                  title="Visit official site"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Contenido Central: Favicon + Nombre + Descripción */}
              <div className="mb-5 flex-1">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="relative">
                    <img
                      src={getFaviconUrl(site.url, 64)}
                      alt={site.name}
                      className="h-11 w-11 rounded-2xl bg-white p-2 shadow-sm border border-[var(--card-border)] object-contain transition-transform group-hover:scale-105"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = "none"
                      }}
                    />
                    {isFirst && (
                      <span className="absolute -top-1.5 -left-1.5 text-amber-500">
                        👑
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-black text-[var(--foreground)] truncate group-hover:text-[#FF4A1C] transition-colors flex items-center gap-1.5">
                      <span>{site.name}</span>
                    </h3>
                    <p className="text-xs text-[var(--muted)] truncate font-medium">
                      {getDomain(site.url)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--foreground)]/80 line-clamp-2 leading-relaxed mb-3 font-normal">
                  {site.description}
                </p>

                {/* Métricas: Clicks & Dueño */}
                <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] font-medium">
                  <span className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
                    <MousePointerClick className="h-3 w-3 text-[#FF4A1C]" />
                    {new Intl.NumberFormat("en-US").format(site.clicks)} clicks
                  </span>
                  <span>·</span>
                  <span className="truncate">@{site.owner.handle || "creator"}</span>
                </div>
              </div>

              {/* Footer de la Card: Puja y Botón */}
              <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[var(--muted)] block">
                    Winning Bid
                  </span>
                  <span className={`text-xl font-black tabular-nums ${isFirst ? "text-amber-500 dark:text-amber-400" : "text-[#FF4A1C]"}`}>
                    {formatCurrency(site.winningBid)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectBidSite?.(site)
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:scale-102 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                    isFirst ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-[#FF4A1C] hover:bg-[#E63D10]"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Outbid</span>
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
