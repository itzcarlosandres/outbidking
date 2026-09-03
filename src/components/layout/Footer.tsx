import React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--background)] py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF4A1C] text-white shadow-xs">
              <span className="text-[11px] font-black">▲</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[var(--foreground)]">
                puja<span className="text-[#FF4A1C]">.lol</span>
              </p>
              <p className="text-xs text-[var(--muted)]">
                Project directory ranked by real-time outbidding.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
              Ranking
            </Link>
            <Link href="/daily" className="hover:text-[var(--foreground)] transition-colors">
              Today
            </Link>
            <Link href="/leaderboard" className="hover:text-[var(--foreground)] transition-colors">
              Leaderboard
            </Link>
            <Link href="/categories" className="hover:text-[var(--foreground)] transition-colors">
              Categories
            </Link>
            <Link href="/dashboard/sites/new" className="hover:text-[var(--foreground)] transition-colors">
              Submit Project
            </Link>
          </div>

          <div className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} puja.lol — All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
