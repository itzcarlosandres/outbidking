"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BidModal } from "@/components/ranking/BidModal"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import {
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  LayoutDashboard,
  MousePointerClick,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Trophy,
} from "lucide-react"

interface DashboardClientProps {
  user: any
  sites: any[]
  bids: any[]
}

export function DashboardClient({
  user,
  sites: initialSites,
  bids,
}: DashboardClientProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"sites" | "bids">("sites")
  const [sites, setSites] = useState(initialSites)
  const [selectedBoostSite, setSelectedBoostSite] = useState<any | null>(null)
  const [showPublishedAlert, setShowPublishedAlert] = useState(false)

  useEffect(() => {
    if (searchParams.get("published") === "true") {
      setShowPublishedAlert(true)
    }
  }, [searchParams])

  const totalClicks = sites.reduce((acc, s) => acc + (s.clicks || 0), 0)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          {/* Alerta de Publicación Exitosa */}
          {showPublishedAlert && (
            <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>¡Tu proyecto ha sido publicado y activado con éxito en el ranking!</span>
              </div>
              <button
                onClick={() => setShowPublishedAlert(false)}
                className="text-xs font-bold underline"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Header del Dashboard */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                Panel de Control
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Bienvenido, <strong className="text-[var(--foreground)]">@{user.handle || user.name}</strong> · Administra tus proyectos y pujas en vivo.
              </p>
            </div>

            <Link
              href="/dashboard/sites/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4A1C] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E63D10] transition-all self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publicar Nuevo Sitio</span>
            </Link>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Mis Proyectos
              </span>
              <span className="text-3xl font-black text-[var(--foreground)] tabular-nums">
                {sites.length}
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Clicks Recibidos
              </span>
              <span className="text-3xl font-black text-[#FF4A1C] tabular-nums">
                {new Intl.NumberFormat("es-ES").format(totalClicks)}
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Pujas Realizadas
              </span>
              <span className="text-3xl font-black text-[var(--foreground)] tabular-nums">
                {bids.length}
              </span>
            </div>
          </div>

          {/* Tabs Selector */}
          <div className="flex items-center gap-2 border-b border-[var(--card-border)] pb-3 mb-6">
            <button
              onClick={() => setActiveTab("sites")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "sites"
                  ? "bg-[#FF4A1C] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Mis Sitios ({sites.length})
            </button>

            <button
              onClick={() => setActiveTab("bids")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "bids"
                  ? "bg-[#FF4A1C] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Historial de Mis Pujas ({bids.length})
            </button>
          </div>

          {/* TAB 1: Mis Sitios */}
          {activeTab === "sites" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
              {sites.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-[var(--muted)] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    Aún no has publicado ningún proyecto
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 mb-5">
                    Publica tu web o producto para comenzar a recibir tráfico directo desde el ranking.
                  </p>
                  <Link
                    href="/dashboard/sites/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF4A1C] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E63D10]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Publicar mi primer sitio</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                        <th className="pb-3 font-semibold uppercase">Proyecto</th>
                        <th className="pb-3 font-semibold uppercase">Posición</th>
                        <th className="pb-3 font-semibold uppercase">Clicks</th>
                        <th className="pb-3 font-semibold uppercase">Puja Ganadora</th>
                        <th className="pb-3 font-semibold uppercase">Días Restantes</th>
                        <th className="pb-3 font-semibold uppercase text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                      {sites.map((s) => (
                        <tr key={s.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getFaviconUrl(s.url, 48)}
                                alt=""
                                className="h-8 w-8 rounded-lg bg-white p-1 border border-[var(--card-border)]"
                              />
                              <div>
                                <Link
                                  href={`/site/${s.slug}`}
                                  className="font-bold text-[var(--foreground)] hover:text-[#FF4A1C] transition-colors"
                                >
                                  {s.name}
                                </Link>
                                <span className="text-[11px] text-[var(--muted)] block">
                                  {s.category}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4">
                            <span className="rounded-lg bg-orange-500/10 px-2 py-0.5 text-xs font-black text-[#FF4A1C]">
                              #{s.position}
                            </span>
                          </td>

                          <td className="py-4 font-bold text-[var(--foreground)] tabular-nums">
                            {new Intl.NumberFormat("es-ES").format(s.clicks)}
                          </td>

                          <td className="py-4 font-bold text-[#FF4A1C] tabular-nums">
                            {formatCurrency(s.winningBid)}
                          </td>

                          <td className="py-4">
                            {s.daysLeft > 0 ? (
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {s.daysLeft} días
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                                Expirado
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBoostSite({
                                    ...s,
                                    owner: { id: user.id },
                                  })
                                }}
                                className="rounded-lg bg-[#FF4A1C] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#E63D10] transition-colors flex items-center gap-1"
                              >
                                <Flame className="h-3 w-3" />
                                <span>Impulsar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Mis Pujas */}
          {activeTab === "bids" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
              {bids.length === 0 ? (
                <div className="text-center py-12 text-[var(--muted)]">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 text-[var(--muted)]" />
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    No has realizado ninguna puja aún
                  </p>
                  <p className="text-xs mt-1">
                    Explora el ranking y puja por tus proyectos favoritos para posicionarlos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                        <th className="pb-3 font-semibold uppercase">Proyecto</th>
                        <th className="pb-3 font-semibold uppercase">Monto Pujado</th>
                        <th className="pb-3 font-semibold uppercase">Fecha</th>
                        <th className="pb-3 font-semibold uppercase text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                      {bids.map((b) => (
                        <tr key={b.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                          <td className="py-3 font-bold text-[var(--foreground)]">
                            <Link href={`/site/${b.site.slug}`} className="hover:text-[#FF4A1C]">
                              {b.site.name}
                            </Link>
                          </td>
                          <td className="py-3 font-bold text-[#FF4A1C] tabular-nums text-sm">
                            {formatCurrency(b.amount)}
                          </td>
                          <td className="py-3 text-[var(--muted)]">
                            {new Date(b.createdAt).toLocaleDateString("es-ES", {
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
                                GANANDO
                              </span>
                            ) : (
                              <span className="rounded-full bg-[var(--muted-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                                SUPERADA
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Modal de Impulso */}
      <BidModal
        site={selectedBoostSite}
        isOpen={!!selectedBoostSite}
        onClose={() => setSelectedBoostSite(null)}
        onBidSuccess={() => window.location.reload()}
      />

      <Footer />
    </div>
  )
}
