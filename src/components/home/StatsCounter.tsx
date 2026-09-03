"use client"

import React, { useState, useEffect, useRef } from "react"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Flame, Rocket, Users } from "lucide-react"

interface StatsCounterProps {
  totalRevenue?: number
  totalSites?: number
  totalBids?: number
}

export function StatsCounter({
  totalRevenue = 0,
  totalSites = 0,
  totalBids = 0,
}: StatsCounterProps) {
  const [animatedRevenue, setAnimatedRevenue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const duration = 2000
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Curva easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setAnimatedRevenue(Math.floor(easeProgress * totalRevenue))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [totalRevenue, hasAnimated])

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="w-full py-16 sm:py-24 border-t border-[var(--card-border)] bg-[var(--card)]/40 relative overflow-hidden"
    >
      {/* Fondo con resplandor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[350px] bg-[#FF4A1C]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
          Impact on Creators & Projects
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          This ranked directory has generated
        </h2>

        {/* Número Gigante Naranja con Count-Up */}
        <div className="my-6">
          <span className="text-5xl sm:text-7xl md:text-8xl font-black title-tight text-[#FF4A1C] tabular-nums tracking-tight block">
            {formatCurrency(animatedRevenue)}
          </span>
          <span className="text-xs sm:text-sm text-[var(--muted)] mt-2 block font-medium">
            in live bids and direct visibility for independent projects
          </span>
        </div>

        {/* 3 Métricas clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
          
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex justify-center mb-2">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#FF4A1C]">
                <Rocket className="h-5 w-5" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums block">
              {totalSites}
            </span>
            <span className="text-xs text-[var(--muted)]">Active projects</span>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex justify-center mb-2">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#FF4A1C]">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums block">
              {totalBids}
            </span>
            <span className="text-xs text-[var(--muted)]">Total bids placed</span>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex justify-center mb-2">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#FF4A1C]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums block">
              1.48M+
            </span>
            <span className="text-xs text-[var(--muted)]">Total visitors</span>
          </div>

        </div>

      </div>
    </section>
  )
}
