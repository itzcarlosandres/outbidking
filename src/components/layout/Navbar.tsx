"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { INITIAL_CATEGORIES, CategoryData, getCategoryIcon } from "@/lib/categories"
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Flame,
  ChevronDown,
  Grid,
  Sparkles,
  ArrowRight,
} from "lucide-react"

interface NavbarProps {
  currentView?: "all" | "today"
  onViewChange?: (view: "all" | "today") => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function Navbar({
  currentView = "all",
  onViewChange,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [catSearch, setCatSearch] = useState("")

  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories.filter((c: CategoryData) => c.isActive))
        } else {
          setCategories(
            INITIAL_CATEGORIES.map((c, i) => ({
              id: `init-${i}`,
              name: c.name,
              slug: c.slug,
              icon: c.icon,
              order: c.order,
              isActive: true,
            }))
          )
        }
      })
      .catch(() => {
        setCategories(
          INITIAL_CATEGORIES.map((c, i) => ({
            id: `init-${i}`,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            order: c.order,
            isActive: true,
          }))
        )
      })
  }, [])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  const handleCategorySelect = (categoryName: string) => {
    setCategoriesOpen(false)
    setMobileMenuOpen(false)
    router.push(`/?category=${encodeURIComponent(categoryName)}`)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Toggle */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4A1C] text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="text-xs font-black tracking-tighter">▲</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                puja<span className="text-[#FF4A1C]">.lol</span>
              </span>
            </Link>

            {/* Toggle segmentado All-time / Hoy */}
            {onViewChange && (
              <div className="hidden sm:flex items-center rounded-xl bg-[var(--muted-bg)] p-1 border border-[var(--card-border)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onViewChange("all")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    currentView === "all"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  All-time
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange("today")}
                  className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1 ${
                    currentView === "today"
                      ? "bg-[#FF4A1C] text-white shadow-xs font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  Today
                </button>
              </div>
            )}
          </div>

          {/* Buscador central en desktop */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-md mx-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search projects, websites, creators..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-1.5 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--muted)] transition-all focus:border-[#FF4A1C] focus:outline-hidden focus:ring-2 focus:ring-[#FF4A1C]/20"
                />
              </div>
            </div>
          )}

          {/* Links de navegación y acciones */}
          <div className="flex items-center gap-3">
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[var(--foreground)]">
              <Link href="/" className="transition-colors hover:text-[#FF4A1C]">
                Live Ranking
              </Link>
              <Link href="/daily" className="transition-colors hover:text-[#FF4A1C]">
                Today
              </Link>
              <Link href="/leaderboard" className="transition-colors hover:text-[#FF4A1C]">
                Leaderboard
              </Link>

              {/* Enlace y Menú Desplegable de Categorías */}
              <div className="relative flex items-center" ref={categoriesRef}>
                <Link
                  href="/categories"
                  className="transition-colors hover:text-[#FF4A1C] flex items-center gap-1"
                >
                  <Grid className="h-4 w-4 text-[#FF4A1C]" />
                  <span>Categories</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  aria-label="Open categories dropdown"
                  className="p-1 text-[var(--muted)] hover:text-[#FF4A1C] transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      categoriesOpen ? "rotate-180 text-[#FF4A1C]" : ""
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[460px] rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    
                    {/* Buscador dentro del menú de categorías */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-1.5 pl-8 pr-3 text-xs text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:border-[#FF4A1C]"
                      />
                    </div>

                    <div className="flex items-center justify-between px-1 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Explore Categories ({filteredCategories.length})
                      </span>
                      <Link
                        href="/categories"
                        onClick={() => setCategoriesOpen(false)}
                        className="text-[11px] font-bold text-[#FF4A1C] hover:underline flex items-center gap-0.5"
                      >
                        <span>View all</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Grid de Categorías */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                      {filteredCategories.map((c) => {
                        const IconComp = getCategoryIcon(c.icon)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleCategorySelect(c.name)}
                            className="flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)] hover:text-[#FF4A1C] transition-colors group cursor-pointer"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--muted-bg)] group-hover:bg-[#FF4A1C]/10 text-[var(--foreground)] group-hover:text-[#FF4A1C] transition-colors">
                              <IconComp className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{c.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="h-4 w-px bg-[var(--card-border)] hidden lg:block" />

            {/* Selector de Tema */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)] cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            {/* Publicar CTA */}
            <Link
              href="/dashboard/sites/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#FF4A1C] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#E63D10] hover:shadow-md active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Submit
            </Link>

            {/* Admin Badge si hay sesión de Administrador */}
            {session?.user?.role === "ADMIN" && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 transition-colors hover:bg-amber-500/20 cursor-pointer text-amber-600 dark:text-amber-400"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold hidden sm:inline">Admin</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-[var(--card-border)] mb-1">
                      <p className="text-xs font-bold text-[var(--foreground)] truncate">
                        {session.user.name || "Administrator"}
                      </p>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">
                        SUPERADMIN
                      </span>
                    </div>

                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#FF4A1C]" />
                      Admin Panel
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 mt-1 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--card-border)] py-4 space-y-3 animate-in slide-in-from-top-2">
            {onSearchChange && (
              <div className="relative w-full mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--muted)]"
                />
              </div>
            )}

            {onViewChange && (
              <div className="flex items-center rounded-xl bg-[var(--muted-bg)] p-1 border border-[var(--card-border)] text-xs font-semibold mb-3">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange("all")
                    setMobileMenuOpen(false)
                  }}
                  className={`flex-1 rounded-lg py-2 text-center transition-all ${
                    currentView === "all" ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-bold" : "text-[var(--muted)]"
                  }`}
                >
                  All-time
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onViewChange("today")
                    setMobileMenuOpen(false)
                  }}
                  className={`flex-1 rounded-lg py-2 text-center transition-all flex items-center justify-center gap-1 ${
                    currentView === "today" ? "bg-[#FF4A1C] text-white shadow-xs font-bold" : "text-[var(--muted)]"
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  Hoy
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center text-[var(--foreground)] font-bold"
              >
                Ranking
              </Link>
              <Link
                href="/daily"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center text-[var(--foreground)] font-bold"
              >
                Diario
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center text-[var(--foreground)] font-bold"
              >
                All-Time
              </Link>
              <Link
                href="/dashboard/sites/new"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-[#FF4A1C] p-3 text-center text-white font-bold"
              >
                Publicar Proyecto
              </Link>
            </div>

            {/* Categorías en mobile */}
            <div className="pt-3 border-t border-[var(--card-border)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-2 px-1">
                Categorías Populares
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {categories.slice(0, 10).map((c) => {
                  const IconComp = getCategoryIcon(c.icon)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategorySelect(c.name)}
                      className="flex items-center gap-2 p-2 rounded-xl text-left text-xs text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors truncate"
                    >
                      <IconComp className="h-3.5 w-3.5 text-[#FF4A1C] shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
