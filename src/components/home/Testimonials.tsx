import React from "react"
import { Sparkles, Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Sofía Romero",
    handle: "sofidev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
    product: "ChatNode AI",
    metric: "+42,000 clicks",
    text: "Holding the #1 spot for 3 weeks brought us over 400 paying customers for our AI SaaS. The bid ROI was over 8x.",
  },
  {
    name: "Nico Valenzuela",
    handle: "cryptonico",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nico",
    product: "CryptoSniper Pro",
    metric: "+18,500 users",
    text: "The real-time leaderboard visibility is incredible. People follow rank upgrades minute-by-minute and the traffic is top quality.",
  },
  {
    name: "Marina Delgado",
    handle: "marina_seo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marina",
    product: "KiteSEO Analytics",
    metric: "#1 All-Time for 10 days",
    text: "Outbidding to regain #1 gave us massive traffic spikes. Hands down the best directory to validate and scale startups fast.",
  },
]

export function Testimonials() {
  return (
    <section className="w-full py-16 sm:py-20 border-t border-[var(--card-border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3.5 py-1 text-xs font-semibold text-[#FF4A1C] shadow-2xs mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Creators who claimed the <span className="text-[#FF4A1C]">Top 1</span> spot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xs flex flex-col justify-between hover:border-[#FF4A1C]/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full border border-[var(--card-border)] object-cover bg-white"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">{t.name}</h3>
                      <p className="text-xs text-[var(--muted)]">@{t.handle}</p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-orange-500/10 px-2 py-1 text-[11px] font-extrabold text-[#FF4A1C]">
                    {t.metric}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Project: <strong className="text-[var(--foreground)]">{t.product}</strong></span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
