"use client"

import React from "react"
import { formatCurrency } from "@/lib/utils"

export interface ActivityItem {
  id: string
  userHandle: string
  siteName: string
  siteSlug: string
  rank: number
  amount: number
  timeAgo: string
}

interface ActivityTickerProps {
  items?: ActivityItem[]
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: "1", userHandle: "cryptonico", siteName: "ChatNode AI", siteSlug: "chatnode-ai", rank: 1, amount: 17005, timeAgo: "2m ago" },
  { id: "2", userHandle: "marina_seo", siteName: "KiteSEO Analytics", siteSlug: "kiteseo-analytics", rank: 2, amount: 14250, timeAgo: "8m ago" },
  { id: "3", userHandle: "luna_codes", siteName: "PromptLayer Studio", siteSlug: "promptlayer-studio", rank: 3, amount: 11800, timeAgo: "15m ago" },
  { id: "4", userHandle: "mateorivas", siteName: "CryptoSniper Pro", siteSlug: "cryptosniper-pro", rank: 4, amount: 9600, timeAgo: "24m ago" },
  { id: "5", userHandle: "elenagrowth", siteName: "ViralMetrics Growth", siteSlug: "viralmetrics-growth", rank: 5, amount: 8200, timeAgo: "35m ago" },
]

export function ActivityTicker({ items = DEFAULT_ACTIVITIES }: ActivityTickerProps) {
  return (
    <div className="w-full border-y border-[var(--card-border)] bg-[var(--muted-bg)]/40 py-2.5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)] shrink-0 flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A1C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4A1C]"></span>
            </span>
            Live:
          </span>

          <div className="flex items-center gap-2.5 min-w-max">
            {items.map((act) => (
              <div
                key={act.id}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--foreground)] shadow-2xs hover:border-[#FF4A1C]/40 transition-colors"
              >
                <span className="font-bold text-[#FF4A1C]">@{act.userHandle}</span>
                <span className="text-[var(--muted)]">bid on #{act.rank}</span>
                <span className="font-extrabold text-[var(--foreground)] tabular-nums">
                  {formatCurrency(act.amount)}
                </span>
                <span className="text-[10px] text-[var(--muted)]">({act.timeAgo})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
