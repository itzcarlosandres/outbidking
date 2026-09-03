"use client"

import React from "react"
import Link from "next/link"
import { RankingSite } from "@/lib/ranking"
import { formatCurrency, getFaviconUrl, getDomain } from "@/lib/utils"
import { ExternalLink, MousePointerClick, TrendingUp } from "lucide-react"

interface RankingRowProps {
  site: RankingSite
  onSelectBidSite: (site: RankingSite) => void
  isUpdated?: boolean
}

export function RankingRow({
  site,
  onSelectBidSite,
  isUpdated = false,
}: RankingRowProps) {
  // Cálculo de tiempo transcurrido
  const daysAgo = Math.max(
    1,
    Math.floor((Date.now() - new Date(site.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  )

  return (
    <div
      onClick={() => onSelectBidSite(site)}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-4.5 transition-all duration-200 cursor-pointer hover:border-[#FF4A1C]/40 hover:bg-[var(--muted-bg)]/60 hover:shadow-sm ${
        isUpdated ? "animate-bid-flash" : ""
      }`}
    >
      {/* Lado izquierdo: Posición + Icono + Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        
        {/* Badge de Posición */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-black text-[var(--muted)] group-hover:border-[#FF4A1C]/50 group-hover:text-[#FF4A1C] transition-colors">
          #{site.position}
        </div>

        {/* Favicon del proyecto */}
        <img
          src={getFaviconUrl(site.url, 48)}
          alt={site.name}
          className="h-9 w-9 shrink-0 rounded-xl bg-white p-1 shadow-2xs border border-[var(--card-border)] object-contain"
          onError={(e) => {
            ;(e.target as HTMLElement).style.display = "none"
          }}
        />

        {/* Título & Meta Line */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate group-hover:text-[#FF4A1C] transition-colors">
              {site.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)] mt-0.5">
            <span className="font-semibold text-[var(--foreground)]/70">
              {site.category}
            </span>
            <span>·</span>
            <span>{daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`}</span>
            <span>·</span>
            <span className="truncate">{getDomain(site.url)}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-[#FF4A1C] font-semibold">
              <MousePointerClick className="h-3 w-3" />
              {new Intl.NumberFormat("en-US").format(site.clicks)}
            </span>
            <span>·</span>
            <Link
              href={`/site/${site.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#FF4A1C] hover:underline font-medium"
            >
              view details
            </Link>
          </div>
        </div>
      </div>

      {/* Lado derecho: Precio & Botón Pujar */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--card-border)]">
        
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block sm:hidden">
            Bid
          </span>
          <span className="text-base sm:text-lg font-black text-[#FF4A1C] tabular-nums block">
            {formatCurrency(site.winningBid)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`/api/go/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl border border-[var(--card-border)] p-2 text-[var(--muted)] hover:bg-[var(--card)] hover:text-[#FF4A1C] transition-colors"
            title="Visit site"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectBidSite(site)
            }}
            className="rounded-xl bg-[#FF4A1C] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#E63D10] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Outbid</span>
          </button>
        </div>

      </div>
    </div>
  )
}
