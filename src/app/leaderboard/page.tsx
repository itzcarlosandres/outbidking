"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RankingList } from "@/components/ranking/RankingList"
import { TopThree } from "@/components/ranking/TopThree"
import { CategoryFilter } from "@/components/ranking/CategoryFilter"
import { RankingSite } from "@/lib/ranking"
import { usePusherBids } from "@/hooks/usePusherBids"
import { Trophy, Loader2 } from "lucide-react"

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  
  const [sites, setSites] = useState<RankingSite[]>([])
  const [total, setTotal] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastBidSiteId, setLastBidSiteId] = useState<string | null>(null)

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        view: "all",
        page: page.toString(),
        limit: "50",
      })

      if (selectedCategory && selectedCategory !== "ALL") {
        params.set("category", selectedCategory)
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim())
      }

      const res = await fetch(`/api/ranking?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (e) {
      console.error("Error cargando leaderboard:", e)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, page])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  const handleRealtimeBid = useCallback((event: any) => {
    setLastBidSiteId(event.siteId)
    fetchRanking()
    setTimeout(() => setLastBidSiteId(null), 2000)
  }, [fetchRanking])

  usePusherBids(handleRealtimeBid)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3.5 py-1 text-xs font-semibold text-[#FF4A1C] shadow-2xs mb-3">
              <Trophy className="h-3.5 w-3.5" />
              <span>All-Time Hall of Fame</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
              All-Time Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5">
              The highest-ranking projects and bids in the history of puja.lol.
            </p>
          </div>

          <div className="mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
                setPage(1)
              }}
            />
          </div>

          {loading && sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C] mb-3" />
              <p className="text-xs font-semibold">Loading leaderboard...</p>
            </div>
          ) : (
            <RankingList
              initialSites={sites}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onRefresh={fetchRanking}
              lastBidSiteId={lastBidSiteId}
            />
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
