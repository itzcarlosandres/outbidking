"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RankingSite } from "@/lib/ranking"
import { TopThree } from "@/components/ranking/TopThree"
import { RankingRow } from "@/components/ranking/RankingRow"
import { BidModal } from "@/components/ranking/BidModal"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface RankingListProps {
  initialSites: RankingSite[]
  total: number
  page: number
  totalPages: number
  limit?: number
  onPageChange: (newPage: number) => void
  onRefresh?: () => void
  lastBidSiteId?: string | null
}

export function RankingList({
  initialSites,
  total,
  page,
  totalPages,
  limit = 50,
  onPageChange,
  onRefresh,
  lastBidSiteId,
}: RankingListProps) {
  const [selectedBidSite, setSelectedBidSite] = useState<RankingSite | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)

  // Timer para "Actualizado hace Xs"
  useEffect(() => {
    setSecondsAgo(0)
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [initialSites])

  const handleBidSuccess = () => {
    if (onRefresh) onRefresh()
  }

  // Separar Top 3 de los puestos 4+
  const topThree = page === 1 ? initialSites.slice(0, 3) : []
  const remainingSites = page === 1 ? initialSites.slice(3) : initialSites

  const startRecord = (page - 1) * limit + 1
  const endRecord = Math.min(page * limit, total)

  return (
    <div className="w-full">
      {/* Top 3 Destacados */}
      {topThree.length > 0 && (
        <TopThree sites={topThree} onSelectBidSite={setSelectedBidSite} />
      )}

      {/* Header de la lista de puestos restantes */}
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--muted)] px-1">
        <span className="font-semibold uppercase tracking-wider">
          {page === 1 && topThree.length > 0 ? "Remaining Positions (#4+)" : "All Positions"}
        </span>

        <div className="flex items-center gap-2">
          <span>Updated {secondsAgo}s ago</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:text-[var(--foreground)] transition-colors rounded-md"
              title="Reload ranking"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Lista con animación FLIP de Framer Motion */}
      {initialSites.length === 0 ? (
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center my-6">
          <p className="text-sm font-bold text-[var(--foreground)]">
            No projects found in this category or search query.
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Be the first to submit a project and claim the #1 spot.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {remainingSites.map((site) => (
              <motion.div
                key={site.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              >
                <RankingRow
                  site={site}
                  onSelectBidSite={setSelectedBidSite}
                  isUpdated={lastBidSiteId === site.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Barra de Paginación */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-[var(--card-border)] text-xs text-[var(--muted)]">
          <div>
            Showing <span className="font-bold text-[var(--foreground)]">{startRecord}-{endRecord}</span> of{" "}
            <span className="font-bold text-[var(--foreground)]">{new Intl.NumberFormat("en-US").format(total)}</span> projects
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--muted-bg)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1
              if (totalPages > 5 && page > 3) {
                pNum = page - 3 + i
                if (pNum > totalPages) pNum = totalPages - (4 - i)
              }
              return (
                <button
                  key={pNum}
                  onClick={() => onPageChange(pNum)}
                  className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                    page === pNum
                      ? "bg-[#FF4A1C] text-white shadow-xs"
                      : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  }`}
                >
                  {pNum}
                </button>
              )
            })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--muted-bg)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Puja */}
      <BidModal
        site={selectedBidSite}
        isOpen={!!selectedBidSite}
        onClose={() => setSelectedBidSite(null)}
        onBidSuccess={handleBidSuccess}
      />
    </div>
  )
}
