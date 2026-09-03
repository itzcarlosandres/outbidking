"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { formatCurrency, getFaviconUrl } from "@/lib/utils"
import { SiteConfigData } from "@/lib/config"
import { CategoryData, ICON_MAP, getCategoryIcon } from "@/lib/categories"
import { Role } from "@prisma/client"
import {
  Ban,
  CheckCircle2,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  LayoutDashboard,
  Loader2,
  Lock,
  Plus,
  PlusCircle,
  Save,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
  Moon,
  Sun,
  LogOut,
  ArrowUpRight,
  Menu,
  Sparkles,
  BarChart3,
  Activity,
  Clock,
  Trophy,
  AlertCircle,
  ArrowRight,
  MousePointerClick,
  CreditCard,
  Wallet,
  Copy,
  Check,
  Key,
  RefreshCw,
} from "lucide-react"

interface AdminClientProps {
  sites: any[]
  payments: any[]
  users: any[]
  config: SiteConfigData
  categories: CategoryData[]
}

export function AdminClient({
  sites: initialSites,
  payments,
  users: initialUsers,
  config: initialConfig,
  categories: initialCategories,
}: AdminClientProps) {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "branding" | "seo" | "gateways" | "categories" | "sites" | "users" | "payments"
  >("dashboard")

  const [sites, setSites] = useState(initialSites)
  const [users, setUsers] = useState(initialUsers)
  const [config, setConfig] = useState<SiteConfigData>(initialConfig)
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories)
  const [savingConfig, setSavingConfig] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Estado para Pasarelas & Pagos
  const [testingNowPayments, setTestingNowPayments] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; status: string } | null>(null)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showIpnSecret, setShowIpnSecret] = useState(false)

  // Filtros de búsqueda para tablas
  const [siteSearch, setSiteSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  
  // Estado de Gestión de Pagos
  const [paymentList, setPaymentList] = useState(payments)
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "FAILED">("ALL")
  const [paymentSearch, setPaymentSearch] = useState("")
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null)
  
  // Modal de Puja/Pago Manual
  const [manualBidModalOpen, setManualBidModalOpen] = useState(false)
  const [manualSiteId, setManualSiteId] = useState("")
  const [manualAmount, setManualAmount] = useState<number>(10)
  const [savingManualBid, setSavingManualBid] = useState(false)

  // Estado del Modal de Edición de Proyecto
  const [editingSite, setEditingSite] = useState<any | null>(null)
  const [editName, setEditName] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editCategory, setEditCategory] = useState<string>("")
  const [editClicks, setEditClicks] = useState<number>(0)
  const [editDaysToAdd, setEditDaysToAdd] = useState<number>(0)
  const [savingEditSite, setSavingEditSite] = useState(false)

  // Estado del Modal de Categorías (Crear / Editar)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null)
  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [catIcon, setCatIcon] = useState("Bot")
  const [catDesc, setCatDesc] = useState("")
  const [catOrder, setCatOrder] = useState<number>(0)
  const [savingCategory, setSavingCategory] = useState(false)

  const showNotification = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  // Guardar Configuración (SEO, Branding, Planes, etc.)
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingConfig(true)

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_site_config",
          config,
        }),
      })

      if (res.ok) {
        showNotification("¡Configuración guardada exitosamente!")
      } else {
        const data = await res.json()
        showNotification(data.error || "Error al guardar configuración.")
      }
    } catch (e: any) {
      showNotification("Error de red al guardar configuración.")
    } finally {
      setSavingConfig(false)
    }
  }

  // Probar Conexión con NOWPayments API
  const handleTestNowPayments = async () => {
    setTestingNowPayments(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_nowpayments",
          apiKey: config.nowpaymentsApiKey || "",
          isSandbox: config.nowpaymentsSandbox || false,
        }),
      })
      const data = await res.json()
      setTestResult(data)
    } catch (e: any) {
      setTestResult({
        success: false,
        status: "error",
        message: "Error de red al intentar conectar con NOWPayments.",
      })
    } finally {
      setTestingNowPayments(false)
    }
  }

  // Copiar URL de Webhook IPN
  const handleCopyWebhook = () => {
    const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"
    const webhookUrl = `${appUrl}/api/webhooks/nowpayments`
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2500)
  }

  // ================= CATEGORÍAS CRUD =================
  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCatName("")
    setCatSlug("")
    setCatIcon("Bot")
    setCatDesc("")
    setCatOrder(categories.length + 1)
    setCategoryModalOpen(true)
  }

  const openEditCategoryModal = (cat: CategoryData) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatIcon(cat.icon)
    setCatDesc(cat.description || "")
    setCatOrder(cat.order)
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingCategory(true)

    try {
      const isEdit = !!editingCategory
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isEdit ? "update_category" : "create_category",
          categoryId: editingCategory?.id,
          name: catName,
          slug: catSlug,
          icon: catIcon,
          description: catDesc,
          order: catOrder,
        }),
      })

      const data = await res.json()
      if (res.ok && data.category) {
        if (isEdit) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? data.category : c))
          )
          showNotification(`Categoría "${catName}" actualizada.`)
        } else {
          setCategories((prev) => [...prev, data.category])
          showNotification(`Categoría "${catName}" creada con éxito.`)
        }
        setCategoryModalOpen(false)
      } else {
        showNotification(data.error || "Error al guardar categoría.")
      }
    } catch (e) {
      showNotification("Error de conexión.")
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_category",
          categoryId: catId,
        }),
      })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== catId))
        showNotification(`Categoría "${name}" eliminada.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleCategoryStatus = async (catId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_category_status",
          categoryId: catId,
          isActive: !currentStatus,
        }),
      })
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, isActive: !currentStatus } : c))
        )
        showNotification(`Estado de la categoría actualizado.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Suspender / Reactivar Sitio
  const handleToggleStatus = async (siteId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_site_status",
          siteId,
          newStatus,
        }),
      })
      if (res.ok) {
        setSites((prev) =>
          prev.map((s) => (s.id === siteId ? { ...s, status: newStatus } : s))
        )
        showNotification(`Proyecto ${newStatus === "ACTIVE" ? "reactivado" : "suspendido"} correctamente.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Eliminar Proyecto
  const handleDeleteSite = async (siteId: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente el proyecto "${name}"?`)) {
      return
    }

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_site",
          siteId,
        }),
      })
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.id !== siteId))
        showNotification(`Proyecto "${name}" eliminado.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Abrir Modal de Edición de Proyecto
  const openEditSiteModal = (site: any) => {
    setEditingSite(site)
    setEditName(site.name)
    setEditUrl(site.url)
    setEditDesc(site.description)
    setEditCategory(site.category)
    setEditClicks(site.clicks)
    setEditDaysToAdd(0)
  }

  // Guardar Edición de Proyecto
  const handleSaveEditSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSite) return
    setSavingEditSite(true)

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_site",
          siteId: editingSite.id,
          name: editName,
          url: editUrl,
          description: editDesc,
          category: editCategory,
          clicks: editClicks,
          daysToAdd: editDaysToAdd,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSites((prev) =>
          prev.map((s) =>
            s.id === editingSite.id
              ? {
                  ...s,
                  name: editName,
                  url: editUrl,
                  description: editDesc,
                  category: editCategory,
                  clicks: editClicks,
                }
              : s
          )
        )
        showNotification("Proyecto actualizado con éxito.")
        setEditingSite(null)
      } else {
        showNotification(data.error || "Error al actualizar proyecto.")
      }
    } catch (e) {
      showNotification("Error de red.")
    } finally {
      setSavingEditSite(false)
    }
  }

  // Cambiar Rol de Usuario
  const handleToggleUserRole = async (userId: string, currentRole: Role) => {
    const newRole = currentRole === Role.ADMIN ? Role.USER : Role.ADMIN
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user_role",
          userId,
          newRole,
        }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        showNotification(`Rol actualizado a ${newRole}.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ================= GESTIÓN DE PAGOS & RESPALDO MANUAL =================
  const handleApprovePaymentManually = async (paymentId: string) => {
    if (!confirm("¿Deseas aprobar y activar este pago y su puja manualmente?")) return
    setProcessingPaymentId(paymentId)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_payment_manually", paymentId }),
      })
      const data = await res.json()
      if (res.ok) {
        setPaymentList((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: "COMPLETED" } : p))
        )
        showNotification("¡Pago aprobado y puja activada en vivo!")
      } else {
        showNotification(data.error || "Error al aprobar pago")
      }
    } catch (e) {
      showNotification("Error de conexión")
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleCancelPayment = async (paymentId: string) => {
    if (!confirm("¿Deseas marcar este pago como fallido?")) return
    setProcessingPaymentId(paymentId)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_payment", paymentId }),
      })
      if (res.ok) {
        setPaymentList((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: "FAILED" } : p))
        )
        showNotification("Pago marcado como fallido.")
      }
    } catch (e) {
      showNotification("Error de conexión")
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleCreateManualBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualSiteId || manualAmount <= 0) return
    setSavingManualBid(true)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_manual_bid",
          siteId: manualSiteId,
          amount: manualAmount,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showNotification("¡Puja manual registrada y ranking actualizado en vivo!")
        setManualBidModalOpen(false)
        window.location.reload()
      } else {
        showNotification(data.error || "Error al registrar puja manual")
      }
    } catch (e) {
      showNotification("Error de conexión al registrar puja")
    } finally {
      setSavingManualBid(false)
    }
  }

  // Filtrar listas
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.slug.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.owner?.handle?.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.category?.toLowerCase().includes(siteSearch.toLowerCase())
  )

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.handle && u.handle.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  )

  const filteredPayments = paymentList.filter((p) => {
    const matchesFilter =
      paymentFilter === "ALL" ? true : p.status === paymentFilter

    const q = paymentSearch.toLowerCase().trim()
    const matchesSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      (p.user?.name && p.user.name.toLowerCase().includes(q)) ||
      (p.user?.handle && p.user.handle.toLowerCase().includes(q)) ||
      (p.paymentMethod && p.paymentMethod.toLowerCase().includes(q))

    return matchesFilter && matchesSearch
  })

  // Métricas del Dashboard
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const completedPayments = paymentList.filter((p) => p.status === "COMPLETED")
  const pendingPayments = paymentList.filter((p) => p.status === "PENDING")
  
  const totalRevenue = completedPayments.reduce((acc, p) => acc + p.amount, 0)
  
  const todayPayments = completedPayments.filter((p) => new Date(p.createdAt) >= oneDayAgo)
  const todayRevenue = todayPayments.reduce((acc, p) => acc + p.amount, 0)
  const todayBidsCount = todayPayments.length

  const activeSites = sites.filter((s) => s.status === "ACTIVE")
  const totalClicks = sites.reduce((acc, s) => acc + (s.clicks || 0), 0)

  // Ranking ordenado por puja más alta
  const sortedRanking = [...sites].sort((a, b) => b.winningBid - a.winningBid)
  const top1Site = sortedRanking[0] || null
  const top5Sites = sortedRanking.slice(0, 5)

  // Transacciones recientes
  const recentPayments = [...paymentList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  interface AdminTabItem {
    id: string
    label: string
    count: number | null
    icon: any
  }

  interface AdminSection {
    title: string
    items: AdminTabItem[]
  }

  const ADMIN_SECTIONS: AdminSection[] = [
    {
      title: "Visión General",
      items: [
        { id: "dashboard", label: "Dashboard", count: null, icon: BarChart3 },
      ],
    },
    {
      title: "Directorio & Contenido",
      items: [
        { id: "sites", label: "Proyectos", count: sites.length, icon: LayoutDashboard },
        { id: "categories", label: "Categorías", count: categories.length, icon: Tag },
        { id: "users", label: "Usuarios", count: users.length, icon: Users },
      ],
    },
    {
      title: "Finanzas & Monetización",
      items: [
        { id: "gateways", label: "Pasarelas & Cripto", count: null, icon: CreditCard },
        { id: "payments", label: "Control de Pagos", count: paymentList.length, icon: DollarSign },
      ],
    },
    {
      title: "Configuración del Sistema",
      items: [
        { id: "branding", label: "Branding & Subasta", count: null, icon: Zap },
        { id: "seo", label: "SEO & Metadatos", count: null, icon: Globe },
      ],
    },
  ]

  const ALL_ADMIN_TABS: AdminTabItem[] = ADMIN_SECTIONS.flatMap((s) => s.items)
  const currentTabObj: AdminTabItem = ALL_ADMIN_TABS.find((t) => t.id === activeTab) || ALL_ADMIN_TABS[0]
  const CurrentIcon = currentTabObj.icon

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* SIDEBAR FIJO DESKTOP */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)] flex-col justify-between sticky top-0 h-screen z-20 shadow-xs">
        
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF4A1C] to-[#E63D10] text-white shadow-md shadow-[#FF4A1C]/20 font-black text-base">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-[var(--foreground)] leading-none">
                  {config.siteName || "puja.lol"}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-xs" title="Sistema Activo" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#FF4A1C] bg-[#FF4A1C]/10 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                PANEL DE CONTROL
              </span>
            </div>
          </div>
        </div>

        {/* Links de Navegación Organizados por Secciones */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {ADMIN_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]/80 flex items-center justify-between">
                <span>{section.title}</span>
              </div>

              <div className="space-y-0.5">
                {section.items.map((tab) => {
                  const Icon = tab.icon
                  const isSelected = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-[#FF4A1C] text-white shadow-sm font-black"
                          : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isSelected ? "text-white" : "text-[var(--muted)] group-hover:text-[#FF4A1C]"
                          }`}
                        />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== null && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black tabular-nums transition-colors ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[var(--muted-bg)] text-[var(--muted)] group-hover:bg-[#FF4A1C]/10 group-hover:text-[#FF4A1C]"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-[var(--card-border)] space-y-2 bg-[var(--card)]">
          {/* Botón Salir a la Web Pública */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[#FF4A1C]/10 text-xs font-bold text-[var(--foreground)] hover:text-[#FF4A1C] transition-all border border-[var(--card-border)] group"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#FF4A1C] group-hover:rotate-12 transition-transform" />
              <span>Ver Web Pública</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Perfil Admin y Acciones */}
          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2 max-w-[130px] truncate">
              <img
                src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || "admin"}`}
                alt=""
                className="h-8 w-8 rounded-full border border-[var(--card-border)] bg-[var(--muted-bg)]"
              />
              <div className="truncate">
                <span className="text-xs font-bold text-[var(--foreground)] block truncate">
                  @{session?.user?.name?.split(" ")[0] || "Admin"}
                </span>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider block">
                  SUPERADMIN
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                title="Cambiar modo Claro / Oscuro"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* DRAWER MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-72 bg-[var(--card)] h-full flex flex-col justify-between border-r border-[var(--card-border)] p-4 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF4A1C] text-white font-black text-xs">
                    ▲
                  </div>
                  <span className="font-extrabold text-sm text-[var(--foreground)]">Panel Admin</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--muted-bg)] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
                {ADMIN_SECTIONS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] px-3 block">
                      {section.title}
                    </span>
                    <div className="space-y-0.5">
                      {section.items.map((tab) => {
                        const Icon = tab.icon
                        const isSelected = activeTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as any)
                              setMobileSidebarOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-[#FF4A1C] text-white font-black"
                                : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4" />
                              <span>{tab.label}</span>
                            </div>
                            {tab.count !== null && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                                  isSelected ? "bg-white/20 text-white" : "bg-[var(--muted-bg)] text-[var(--muted)]"
                                }`}
                              >
                                {tab.count}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            <div className="pt-3 border-t border-[var(--card-border)] space-y-2">
              <Link
                href="/"
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-[var(--muted-bg)] text-xs font-bold text-[var(--foreground)] hover:text-[#FF4A1C]"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#FF4A1C]" />
                  <span>Ver Web Pública</span>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA PRINCIPAL DERECHA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Header */}
        <header className="h-16 border-b border-[var(--card-border)] bg-[var(--card)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#FF4A1C]/10 text-[#FF4A1C] flex items-center justify-center">
                <CurrentIcon className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                {currentTabObj.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* KPI Rápido */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-1.5 text-xs">
              <span className="text-[var(--muted)]">Recaudado Total:</span>
              <span className="font-black text-[#FF4A1C] tabular-nums">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            {/* Botón Acción Rápida */}
            <button
              type="button"
              onClick={() => {
                if (sites[0]) setManualSiteId(sites[0].id)
                setManualAmount(10)
                setManualBidModalOpen(true)
              }}
              className="h-9 px-3.5 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold shadow-xs hover:bg-[#E63D10] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">+ Puja Manual</span>
            </button>
          </div>
        </header>

        {/* Notificación Flotante */}
        {feedback && (
          <div className="mx-4 sm:mx-8 mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Canvas de Contenido Principal - Full Width Fluid Layout */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">

          {/* TAB 0: DASHBOARD & OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Banner de Bienvenida & Status */}
              <div className="rounded-3xl border border-[var(--card-border)] bg-gradient-to-r from-[var(--card)] to-[var(--muted-bg)] p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Sistema Operativo & Pasarela NOWPayments Activa
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                    Panel de Control General
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
                    Monitoreo en vivo de pujas, volumen financiero, ranking y moderación de proyectos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (sites[0]) setManualSiteId(sites[0].id)
                      setManualAmount(10)
                      setManualBidModalOpen(true)
                    }}
                    className="h-11 px-4 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold shadow-md hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>+ Registrar Puja Manual</span>
                  </button>

                  <Link
                    href="/"
                    target="_blank"
                    className="h-11 px-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Globe className="h-4 w-4 text-[#FF4A1C]" />
                    <span className="hidden sm:inline">Ver Sitio</span>
                  </Link>
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Recaudado Total */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft hover:border-[#FF4A1C]/40 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--muted)]">Recaudación Total</span>
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums block">
                      {formatCurrency(totalRevenue)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      ✓ {completedPayments.length} transacciones exitosas
                    </span>
                  </div>
                </div>

                {/* KPI 2: Volumen 24h */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft hover:border-[#FF4A1C]/40 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--muted)]">Volumen 24 Horas</span>
                    <div className="h-9 w-9 rounded-xl bg-[#FF4A1C]/10 text-[#FF4A1C] flex items-center justify-center">
                      <Flame className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-[#FF4A1C] tabular-nums block">
                      {formatCurrency(todayRevenue)}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--muted)] mt-1 block">
                      ⚡ {todayBidsCount} pujas hoy
                    </span>
                  </div>
                </div>

                {/* KPI 3: Proyectos & Clicks */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft hover:border-[#FF4A1C]/40 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--muted)]">Proyectos & Clicks</span>
                    <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums block">
                      {activeSites.length} <span className="text-sm font-bold text-[var(--muted)]">/ {sites.length}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 block flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      <span>{totalClicks} clicks totales a proyectos</span>
                    </span>
                  </div>
                </div>

                {/* KPI 4: Usuarios & Pagos Pendientes */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft hover:border-[#FF4A1C]/40 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--muted)]">Comunidad & Pagos</span>
                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums block">
                      {users.length} <span className="text-sm font-bold text-[var(--muted)]">usuarios</span>
                    </span>
                    <span
                      className={`text-[11px] font-semibold mt-1 block ${
                        pendingPayments.length > 0
                          ? "text-amber-600 dark:text-amber-400 font-bold animate-pulse"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {pendingPayments.length > 0
                        ? `⚠️ ${pendingPayments.length} pagos pendientes por revisar`
                        : "✓ Cero pagos pendientes"}
                    </span>
                  </div>
                </div>

              </div>

              {/* SECCIÓN PRINCIPAL: 2 COLUMNAS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMNA IZQUIERDA (2 COLS): LÍDER DEL RANKING & TOP 5 */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Card Proyecto Líder #1 */}
                  {top1Site && (
                    <div className="rounded-3xl border-2 border-[#FF4A1C]/40 bg-gradient-to-br from-[#FF4A1C]/5 to-[var(--card)] p-6 shadow-soft space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <span className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                            Líder Actual del Ranking (Puesto #1)
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FF4A1C] text-white">
                          PUESTO #1
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <img
                            src={getFaviconUrl(top1Site.url, 64)}
                            alt={top1Site.name}
                            className="h-12 w-12 rounded-2xl bg-white p-1.5 shadow-xs border border-[var(--card-border)] shrink-0 object-contain"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-[var(--foreground)]">{top1Site.name}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--muted-bg)] text-[var(--muted)]">
                                {top1Site.category}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                              {top1Site.description}
                            </p>
                            <span className="text-[11px] text-[var(--muted)] mt-1 block">
                              Dueño: <strong>@{top1Site.owner?.handle || top1Site.owner?.name || "usuario"}</strong> • {top1Site.clicks} clicks
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-3 text-right shrink-0">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Puja Ganadora #1</span>
                          <span className="text-2xl font-black text-[#FF4A1C] tabular-nums">
                            {formatCurrency(top1Site.winningBid)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabla Top 5 Ranking */}
                  <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#FF4A1C]" />
                        <span>Top 5 Proyectos más Cotizados</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("sites")}
                        className="text-xs font-bold text-[#FF4A1C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver todos los {sites.length} proyectos</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                            <th className="pb-2.5 font-semibold uppercase">Puesto</th>
                            <th className="pb-2.5 font-semibold uppercase">Proyecto</th>
                            <th className="pb-2.5 font-semibold uppercase">Categoría</th>
                            <th className="pb-2.5 font-semibold uppercase">Puja Ganadora</th>
                            <th className="pb-2.5 font-semibold uppercase text-right">Clicks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                          {top5Sites.map((site, index) => (
                            <tr key={site.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                              <td className="py-2.5 font-black text-[#FF4A1C]">
                                #{index + 1}
                              </td>
                              <td className="py-2.5 font-bold text-[var(--foreground)] flex items-center gap-2">
                                <img
                                  src={getFaviconUrl(site.url, 32)}
                                  alt=""
                                  className="h-5 w-5 rounded-md bg-white p-0.5 border"
                                />
                                <span className="truncate max-w-[140px]">{site.name}</span>
                              </td>
                              <td className="py-2.5 text-[var(--muted)]">{site.category}</td>
                              <td className="py-2.5 font-black text-[var(--foreground)] tabular-nums">
                                {formatCurrency(site.winningBid)}
                              </td>
                              <td className="py-2.5 text-right font-bold text-[var(--muted)]">
                                {site.clicks}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* COLUMNA DERECHA (1 COL): ÚLTIMAS TRANSACCIONES & ACCESOS RÁPIDOS */}
                <div className="space-y-6">
                  
                  {/* Feed de Transacciones Recientes */}
                  <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#FF4A1C]" />
                        <span>Últimas Transacciones</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("payments")}
                        className="text-xs font-bold text-[#FF4A1C] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Ver más</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {recentPayments.length === 0 ? (
                        <p className="text-xs text-[var(--muted)] text-center py-4">No hay pagos registrados aún.</p>
                      ) : (
                        recentPayments.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <span className="text-xs font-bold text-[var(--foreground)] block truncate">
                                @{p.user?.handle || p.user?.name || "usuario"}
                              </span>
                              <span className="text-[10px] text-[var(--muted)] block">
                                {p.paymentMethod} • {new Date(p.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#FF4A1C] tabular-nums block">
                                {formatCurrency(p.amount)}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  p.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : p.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-red-500/10 text-red-600"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Accesos Rápidos Backoffice */}
                  <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-3">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Accesos Rápidos</h3>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (sites[0]) setManualSiteId(sites[0].id)
                          setManualAmount(10)
                          setManualBidModalOpen(true)
                        }}
                        className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] hover:border-[#FF4A1C]/50 text-left transition-all cursor-pointer"
                      >
                        <DollarSign className="h-4 w-4 text-[#FF4A1C] mb-1" />
                        <span className="text-xs font-bold text-[var(--foreground)] block">+ Puja Manual</span>
                        <span className="text-[10px] text-[var(--muted)] block">Subir puesto</span>
                      </button>

                      <button
                        type="button"
                        onClick={openCreateCategoryModal}
                        className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] hover:border-[#FF4A1C]/50 text-left transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4 text-emerald-500 mb-1" />
                        <span className="text-xs font-bold text-[var(--foreground)] block">+ Categoría</span>
                        <span className="text-[10px] text-[var(--muted)] block">Nueva sección</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("branding")}
                        className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] hover:border-[#FF4A1C]/50 text-left transition-all cursor-pointer"
                      >
                        <Zap className="h-4 w-4 text-amber-500 mb-1" />
                        <span className="text-xs font-bold text-[var(--foreground)] block">Branding</span>
                        <span className="text-[10px] text-[var(--muted)] block">Logo y lemas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("seo")}
                        className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] hover:border-[#FF4A1C]/50 text-left transition-all cursor-pointer"
                      >
                        <Globe className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-xs font-bold text-[var(--foreground)] block">SEO / Meta</span>
                        <span className="text-[10px] text-[var(--muted)] block">Google y OG</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 1: GESTIÓN DE CATEGORÍAS */}
          {activeTab === "categories" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Directorio de Categorías ({filteredCategories.length})
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Administra, crea, edita y asigna iconos vectoriales a las categorías de la plataforma.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      placeholder="Buscar categoría..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <button
                    onClick={openCreateCategoryModal}
                    className="h-10 px-4 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-xs hover:bg-[#E63D10] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Categoría</span>
                  </button>
                </div>
              </div>

              {/* Grid de Categorías con Iconos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
                {filteredCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon)
                  return (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        cat.isActive
                          ? "border-[var(--card-border)] bg-[var(--background)] hover:border-[#FF4A1C]/50"
                          : "border-red-500/20 bg-red-500/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-[#FF4A1C]/10 text-[#FF4A1C] flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-[var(--foreground)] line-clamp-1">
                              {cat.name}
                            </h3>
                            <span className="text-[10px] text-[var(--muted)] block">
                              Icono: {cat.icon}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-black text-[var(--muted)] px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)]">
                          #{cat.order}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
                        <button
                          onClick={() => handleToggleCategoryStatus(cat.id, cat.isActive)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                            cat.isActive
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          }`}
                        >
                          {cat.isActive ? "Activa" : "Inactiva"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-1 rounded-lg text-[var(--muted)] hover:text-[#FF4A1C] hover:bg-[var(--muted-bg)]"
                            title="Editar Categoría"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-500/10"
                            title="Eliminar Categoría"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* TAB 1: BRANDING & LOGO */}
          {activeTab === "branding" && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Identidad Visual & Nombre
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Nombre de la Plataforma
                      </label>
                      <input
                        type="text"
                        value={config.siteName}
                        onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Tagline / Lema Corto
                      </label>
                      <input
                        type="text"
                        value={config.tagline}
                        onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-medium text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Texto del Logo (Base)
                      </label>
                      <input
                        type="text"
                        value={config.logoText}
                        onChange={(e) => setConfig({ ...config, logoText: e.target.value })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Texto del Logo (Acento en Naranja)
                      </label>
                      <input
                        type="text"
                        value={config.logoAccent}
                        onChange={(e) => setConfig({ ...config, logoAccent: e.target.value })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[#FF4A1C] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Título Principal del Hero (H1 Base)
                    </label>
                    <input
                      type="text"
                      value={config.heroTitle}
                      onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Subtítulo del Hero
                    </label>
                    <textarea
                      rows={2}
                      value={config.heroSubtitle}
                      onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Banner de Notificación Superior (Opcional)
                    </label>
                    <input
                      type="text"
                      value={config.bannerNotice || ""}
                      onChange={(e) => setConfig({ ...config, bannerNotice: e.target.value })}
                      placeholder="ej: ¡Pujas abiertas 24/7 para el Top 1!"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-medium text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-3 border-t border-[var(--card-border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Incremento Mínimo por Puja ($ USD) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={config.minIncrement}
                        onChange={(e) => setConfig({ ...config, minIncrement: Number(e.target.value) })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                      <p className="text-[10px] text-[var(--muted)] mt-1">Monto mínimo añadido sobre la puja ganadora previa.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Límite de Pujas por Hora (Anti-Spam) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={config.maxBidsPerHour}
                        onChange={(e) => setConfig({ ...config, maxBidsPerHour: Number(e.target.value) })}
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                      <p className="text-[10px] text-[var(--muted)] mt-1">Máximo de pujas por usuario por hora.</p>
                    </div>
                  </div>
                </div>

                {/* Previsualización en Vivo */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Previsualización en Vivo del Logo
                  </h3>

                  <div className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4A1C] text-white shadow-sm font-black text-sm">
                      ▲
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
                      {config.logoText}
                      <span className="text-[#FF4A1C]">{config.logoAccent}</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--muted-bg)] text-xs text-[var(--muted)] space-y-1">
                    <p className="font-bold text-[var(--foreground)]">Hero H1 Preview:</p>
                    <p className="text-sm font-black text-[var(--foreground)]">
                      {config.heroTitle} <span className="font-black text-[#FF4A1C]">#1 por 14.250 $ +</span>
                    </p>
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="h-12 px-8 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-md hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Guardar Branding & Reglas de Subasta</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SEO & METADATOS */}
          {activeTab === "seo" && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Metadatos y Optimización para Motores de Búsqueda (SEO)
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Meta Título Principal (etiqueta title) *
                    </label>
                    <input
                      type="text"
                      value={config.metaTitle}
                      onChange={(e) => setConfig({ ...config, metaTitle: e.target.value })}
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-[var(--foreground)]">
                        Meta Descripción (etiqueta meta description) *
                      </label>
                      <span className="text-[11px] text-[var(--muted)]">
                        {config.metaDescription.length} caracteres (recomendado ~160)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={config.metaDescription}
                      onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Palabras Clave (Separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={config.metaKeywords}
                      onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                      placeholder="ranking, pujas en vivo, directorio saas..."
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        URL Imagen OpenGraph / Redes Sociales (1200x630)
                      </label>
                      <input
                        type="url"
                        value={config.ogImage || ""}
                        onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                        placeholder="https://tudominio.com/og.png"
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                        Google Analytics ID / Tag Manager (Opcional)
                      </label>
                      <input
                        type="text"
                        value={config.googleAnalyticsId || ""}
                        onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                        className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Previsualización en Google Search */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Vista Previa en Google SERP</span>
                  </h3>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left space-y-1 shadow-2xs font-sans">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="font-semibold">{config.siteName}</span>
                      <span className="text-slate-400">https://{config.siteName.toLowerCase()}</span>
                    </div>
                    <h4 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                      {config.metaTitle}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {config.metaDescription}
                    </p>
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="h-12 px-8 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-md hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Guardar Configuración SEO</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: PASARELAS & MÉTODOS DE PAGO */}
          {activeTab === "gateways" && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              
              {/* Bloque Superior: Resumen y Toggles de Métodos */}
              <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5">
                  <div>
                    <h2 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#FF4A1C]" />
                      <span>Métodos de Pago Habilitados para Usuarios</span>
                    </h2>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Activa o desactiva qué pasarelas y modalidades de cobro estarán visibles en la plataforma.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="h-10 px-5 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-sm hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    {savingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Toggle Criptomonedas (NOWPayments) */}
                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[var(--foreground)] flex items-center gap-1.5">
                          🪙 Criptomonedas (NOWPayments)
                        </span>
                        <input
                          type="checkbox"
                          checked={config.enableCryptoPayments ?? true}
                          onChange={(e) => setConfig({ ...config, enableCryptoPayments: e.target.checked })}
                          className="h-4 w-4 accent-[#FF4A1C] cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Permite a los usuarios pagar con USDT, BTC, ETH, SOL y más de 300 criptoactivos de forma automática.
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold mt-3 px-2 py-0.5 rounded-md inline-block w-fit ${config.enableCryptoPayments !== false ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                      {config.enableCryptoPayments !== false ? "● Habilitado" : "○ Desactivado"}
                    </span>
                  </div>

                  {/* Toggle Modo Simulado / Test */}
                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[var(--foreground)] flex items-center gap-1.5">
                          🧪 Modo de Prueba / Simulado
                        </span>
                        <input
                          type="checkbox"
                          checked={config.enableTestPayments ?? true}
                          onChange={(e) => setConfig({ ...config, enableTestPayments: e.target.checked })}
                          className="h-4 w-4 accent-[#FF4A1C] cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Permite confirmar pujas de prueba instantáneamente en 1 clic (útil para testing y demostraciones).
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold mt-3 px-2 py-0.5 rounded-md inline-block w-fit ${config.enableTestPayments !== false ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                      {config.enableTestPayments !== false ? "● Habilitado (Testing)" : "○ Desactivado"}
                    </span>
                  </div>

                  {/* Toggle Pagos Manuales / Directos */}
                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[var(--foreground)] flex items-center gap-1.5">
                          💼 Billeteras Directas (P2P)
                        </span>
                        <input
                          type="checkbox"
                          checked={config.enableManualPayments ?? false}
                          onChange={(e) => setConfig({ ...config, enableManualPayments: e.target.checked })}
                          className="h-4 w-4 accent-[#FF4A1C] cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Muestra tus direcciones de wallet para recibir transferencias directas y aprobarlas manualmente.
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold mt-3 px-2 py-0.5 rounded-md inline-block w-fit ${config.enableManualPayments ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                      {config.enableManualPayments ? "● Habilitado" : "○ Desactivado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columnas: NOWPayments y Billeteras Manuales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Columna 1: Configuración NOWPayments */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 font-black">
                        NOW
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[var(--foreground)]">
                          Credenciales de NOWPayments
                        </h3>
                        <p className="text-[11px] text-[var(--muted)]">
                          Pasarela oficial de criptomonedas
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://account.nowpayments.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#FF4A1C] hover:underline flex items-center gap-1"
                    >
                      <span>Obtener API Keys</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Key className="h-3.5 w-3.5 text-[var(--muted)]" />
                        NOWPayments API Key
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                      >
                        {showApiKey ? "Ocultar" : "Mostrar"}
                      </button>
                    </label>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={config.nowpaymentsApiKey || ""}
                      onChange={(e) => setConfig({ ...config, nowpaymentsApiKey: e.target.value })}
                      placeholder="ej: H8Z9478-XXXXXXX-XXXXXXX-XXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Si se deja en blanco, la plataforma usará el simulador de checkout local automáticamente.
                    </p>
                  </div>

                  {/* IPN Secret */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-[var(--muted)]" />
                        NOWPayments IPN Secret Key (Webhooks)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowIpnSecret(!showIpnSecret)}
                        className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                      >
                        {showIpnSecret ? "Ocultar" : "Mostrar"}
                      </button>
                    </label>
                    <input
                      type={showIpnSecret ? "text" : "password"}
                      value={config.nowpaymentsIpnSecret || ""}
                      onChange={(e) => setConfig({ ...config, nowpaymentsIpnSecret: e.target.value })}
                      placeholder="ej: XXXXXXXXXXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  {/* Toggle Sandbox */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)] block">
                        Modo Sandbox / Testnet
                      </span>
                      <span className="text-[11px] text-[var(--muted)] block">
                        Usar entorno de pruebas de NOWPayments (sin dinero real).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.nowpaymentsSandbox || false}
                      onChange={(e) => setConfig({ ...config, nowpaymentsSandbox: e.target.checked })}
                      className="h-4 w-4 accent-[#FF4A1C] cursor-pointer"
                    />
                  </div>

                  {/* Webhook IPN Box */}
                  <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-2">
                    <span className="text-[11px] font-bold text-[var(--foreground)] block">
                      URL de Notificación Instantánea (Webhook IPN):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/nowpayments` : "/api/webhooks/nowpayments"}
                        className="w-full h-9 rounded-lg border border-[var(--input-border)] bg-[var(--card)] px-2.5 text-[11px] font-mono text-[var(--muted)] truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyWebhook}
                        className="h-9 px-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] hover:bg-[#FF4A1C] hover:text-white hover:border-[#FF4A1C] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedWebhook ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--muted)]">
                      Pega esta URL en la sección <strong>Payment Settings → Instant Payment Notifications</strong> de tu cuenta NOWPayments.
                    </p>
                  </div>

                  {/* Botón de Test de Conexión */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestNowPayments}
                      disabled={testingNowPayments}
                      className="w-full h-11 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] hover:bg-[#FF4A1C]/10 text-xs font-bold text-[var(--foreground)] hover:text-[#FF4A1C] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {testingNowPayments ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#FF4A1C]" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-[#FF4A1C]" />
                      )}
                      <span>Probar Conexión con NOWPayments</span>
                    </button>

                    {testResult && (
                      <div className={`mt-3 p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${testResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"}`}>
                        {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna 2: Billeteras Directas para Pagos Manuales */}
                <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-[var(--card-border)] pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-black">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--foreground)]">
                        Billeteras Directas (Pagos Offline)
                      </h3>
                      <p className="text-[11px] text-[var(--muted)]">
                        Direcciones para recibir pagos directos P2P
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Billetera USDT (TRC-20)
                    </label>
                    <input
                      type="text"
                      value={config.walletUsdtTrc20 || ""}
                      onChange={(e) => setConfig({ ...config, walletUsdtTrc20: e.target.value })}
                      placeholder="ej: TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Billetera USDT (ERC-20 / EVM)
                    </label>
                    <input
                      type="text"
                      value={config.walletUsdtErc20 || ""}
                      onChange={(e) => setConfig({ ...config, walletUsdtErc20: e.target.value })}
                      placeholder="ej: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Billetera Bitcoin (BTC)
                    </label>
                    <input
                      type="text"
                      value={config.walletBtc || ""}
                      onChange={(e) => setConfig({ ...config, walletBtc: e.target.value })}
                      placeholder="ej: bc1qXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Billetera Solana (SOL)
                    </label>
                    <input
                      type="text"
                      value={config.walletSol || ""}
                      onChange={(e) => setConfig({ ...config, walletSol: e.target.value })}
                      placeholder="ej: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs font-mono text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                      Instrucciones para el Usuario
                    </label>
                    <textarea
                      rows={3}
                      value={config.manualPaymentNotes || ""}
                      onChange={(e) => setConfig({ ...config, manualPaymentNotes: e.target.value })}
                      placeholder="Instrucciones que verá el usuario para transferir y enviar su Hash/TxID de pago..."
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Botón Guardar Inferior */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="h-12 px-8 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-md hover:bg-[#E63D10] transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Guardar Configuración de Pasarelas</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: GESTIÓN DE PROYECTOS (CRUD) */}
          {activeTab === "sites" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  Proyectos Registrados ({filteredSites.length})
                </h2>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, slug, dueño..."
                    value={siteSearch}
                    onChange={(e) => setSiteSearch(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                      <th className="pb-3 font-semibold uppercase">Proyecto</th>
                      <th className="pb-3 font-semibold uppercase">Dueño</th>
                      <th className="pb-3 font-semibold uppercase">Categoría</th>
                      <th className="pb-3 font-semibold uppercase">Puja Ganadora</th>
                      <th className="pb-3 font-semibold uppercase">Clicks</th>
                      <th className="pb-3 font-semibold uppercase">Estado</th>
                      <th className="pb-3 font-semibold uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {filteredSites.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getFaviconUrl(s.url, 32)}
                              alt=""
                              className="h-6 w-6 rounded-md bg-white p-0.5 border border-[var(--card-border)]"
                            />
                            <div>
                              <a
                                href={`/site/${s.slug}`}
                                target="_blank"
                                className="font-bold text-[var(--foreground)] hover:text-[#FF4A1C] transition-colors flex items-center gap-1"
                              >
                                <span>{s.name}</span>
                                <ExternalLink className="h-3 w-3 text-[var(--muted)]" />
                              </a>
                              <span className="text-[10px] text-[var(--muted)] block">{s.slug}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-[var(--muted)] font-medium">
                          @{s.owner?.handle || s.owner?.name}
                        </td>

                        <td className="py-3.5">
                          <span className="rounded-lg bg-[var(--muted-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                            {s.category}
                          </span>
                        </td>

                        <td className="py-3.5 font-bold text-[#FF4A1C] tabular-nums text-sm">
                          {formatCurrency(s.winningBid)}
                        </td>

                        <td className="py-3.5 font-bold text-[var(--foreground)] tabular-nums">
                          {new Intl.NumberFormat("es-ES").format(s.clicks)}
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditSiteModal(s)}
                              className="p-1.5 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] hover:text-[#FF4A1C]"
                              title="Editar Proyecto"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(s.id, s.status)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                s.status === "ACTIVE"
                                  ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              }`}
                            >
                              {s.status === "ACTIVE" ? "Suspender" : "Reactivar"}
                            </button>

                            <button
                              onClick={() => handleDeleteSite(s.id, s.name)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                              title="Eliminar Proyecto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: USUARIOS & ROLES */}
          {activeTab === "users" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  Usuarios Registrados ({filteredUsers.length})
                </h2>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar por handle, nombre, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                      <th className="pb-3 font-semibold uppercase">Usuario</th>
                      <th className="pb-3 font-semibold uppercase">Email</th>
                      <th className="pb-3 font-semibold uppercase">Sitios</th>
                      <th className="pb-3 font-semibold uppercase">Pujas</th>
                      <th className="pb-3 font-semibold uppercase">Rol</th>
                      <th className="pb-3 font-semibold uppercase text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                        <td className="py-3 font-bold text-[var(--foreground)] flex items-center gap-2">
                          <img
                            src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`}
                            alt=""
                            className="h-6 w-6 rounded-full border border-[var(--card-border)]"
                          />
                          <span>@{u.handle || u.name}</span>
                        </td>

                        <td className="py-3 text-[var(--muted)]">{u.email}</td>

                        <td className="py-3 font-bold text-[var(--foreground)]">{u.siteCount}</td>

                        <td className="py-3 font-bold text-[#FF4A1C]">{u.bidCount}</td>

                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              u.role === Role.ADMIN
                                ? "bg-purple-500/10 text-purple-600"
                                : "bg-blue-500/10 text-blue-600"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleUserRole(u.id, u.role)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[var(--card-border)] hover:border-[#FF4A1C] hover:text-[#FF4A1C] transition-colors"
                          >
                            {u.role === Role.ADMIN ? "Degradar a USER" : "Promover a ADMIN"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 6: HISTORIAL & GESTIÓN DE PAGOS */}
          {activeTab === "payments" && (
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-soft space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#FF4A1C]" />
                    <span>Control y Auditoría de Pagos</span>
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Monitorea los pagos de NOWPayments y activa manualmente cualquier transacción si ocurre algún retraso de red.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (sites[0]) setManualSiteId(sites[0].id)
                    setManualAmount(10)
                    setManualBidModalOpen(true)
                  }}
                  className="h-10 px-4 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold shadow-sm hover:bg-[#E63D10] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Registrar Pago/Puja Manual</span>
                </button>
              </div>

              {/* Filtros de Estado & Buscador */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-[var(--muted-bg)] p-1 rounded-xl border border-[var(--card-border)] text-xs font-semibold">
                  {(["ALL", "PENDING", "COMPLETED", "FAILED"] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      type="button"
                      onClick={() => setPaymentFilter(filterVal)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        paymentFilter === filterVal
                          ? "bg-[var(--card)] text-[var(--foreground)] font-black shadow-xs text-[#FF4A1C]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {filterVal === "ALL" && "Todos"}
                      {filterVal === "PENDING" && "⏳ Pendientes"}
                      {filterVal === "COMPLETED" && "✅ Completados"}
                      {filterVal === "FAILED" && "❌ Fallidos"}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario o ID..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-8 pr-3 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                      <th className="pb-3 font-semibold uppercase">Usuario</th>
                      <th className="pb-3 font-semibold uppercase">Monto</th>
                      <th className="pb-3 font-semibold uppercase">Tipo</th>
                      <th className="pb-3 font-semibold uppercase">Pasarela</th>
                      <th className="pb-3 font-semibold uppercase">Fecha</th>
                      <th className="pb-3 font-semibold uppercase">Estado</th>
                      <th className="pb-3 font-semibold uppercase text-right">Acción Manual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted)]">
                          No se encontraron transacciones con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                          <td className="py-3 font-bold text-[var(--foreground)]">
                            @{p.user?.handle || p.user?.name || "usuario"}
                          </td>
                          <td className="py-3 font-black text-[#FF4A1C] tabular-nums text-sm">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3 font-semibold text-[var(--foreground)]/80">
                            {p.type === "LISTING" ? "Publicación de Sitio" : "Puja en Vivo"}
                          </td>
                          <td className="py-3">
                            <span className="rounded-md bg-[var(--muted-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--foreground)]">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-[var(--muted)]">
                            {new Date(p.createdAt).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                p.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : p.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            {p.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={processingPaymentId === p.id}
                                  onClick={() => handleApprovePaymentManually(p.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Aprobar y activar puja en el ranking inmediatamente"
                                >
                                  {processingPaymentId === p.id ? "Aprobando..." : "⚡ Aprobar Manual"}
                                </button>
                                <button
                                  type="button"
                                  disabled={processingPaymentId === p.id}
                                  onClick={() => handleCancelPayment(p.id)}
                                  className="px-2 py-1 rounded-lg border border-red-500/30 text-red-600 hover:bg-red-500/10 font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {p.status === "COMPLETED" && (
                              <span className="text-[11px] text-emerald-600 font-semibold">
                                ✓ Activo en Ranking
                              </span>
                            )}
                            {p.status === "FAILED" && (
                              <span className="text-[11px] text-red-500 font-semibold">
                                Descartado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* MODAL CREAR / EDITAR CATEGORÍA */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                {editingCategory ? `Editar Categoría: ${editingCategory.name}` : "Crear Nueva Categoría"}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  placeholder="ej: AI Agents & Infrastructure"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value)
                    if (!editingCategory) {
                      setCatSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      )
                    }
                  }}
                  className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Slug URL</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  required
                />
              </div>

              {/* Selector de Iconos Lucide con Preview */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Icono Vectorial (Lucide) *
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const CurrentIcon = ICON_MAP[iconKey]
                    const isSelected = catIcon === iconKey
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setCatIcon(iconKey)}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-[#FF4A1C] text-white shadow-xs scale-105"
                            : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                        }`}
                        title={iconKey}
                      >
                        <CurrentIcon className="h-4 w-4" />
                        <span className="text-[9px] font-medium truncate w-full text-center">
                          {iconKey}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Orden / Posición</label>
                  <input
                    type="number"
                    min="0"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Previsualización</label>
                  <div className="h-10 rounded-xl border border-[var(--input-border)] bg-[var(--muted-bg)] px-3 flex items-center gap-2">
                    {React.createElement(getCategoryIcon(catIcon), {
                      className: "h-4 w-4 text-[#FF4A1C]",
                    })}
                    <span className="text-xs font-bold text-[var(--foreground)] truncate">
                      {catName || "Nombre"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold hover:bg-[#E63D10] flex items-center gap-1.5"
                >
                  {savingCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{editingCategory ? "Guardar Cambios" : "Crear Categoría"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE PROYECTO */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Editar Proyecto: {editingSite.name}
              </h3>
              <button
                onClick={() => setEditingSite(null)}
                className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">URL</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Categoría</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-xs text-[var(--foreground)] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Clicks Totales</label>
                  <input
                    type="number"
                    min="0"
                    value={editClicks}
                    onChange={(e) => setEditClicks(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Añadir Días de Vigencia</label>
                  <input
                    type="number"
                    value={editDaysToAdd}
                    onChange={(e) => setEditDaysToAdd(Number(e.target.value))}
                    placeholder="+30 días"
                    className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEditSite}
                  className="px-5 py-2 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold hover:bg-[#E63D10] flex items-center gap-1.5"
                >
                  {savingEditSite ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR PUJA / PAGO MANUAL */}
      {manualBidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#FF4A1C]" />
                <span>Registrar Pago / Puja Manual</span>
              </h3>
              <button
                onClick={() => setManualBidModalOpen(false)}
                className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Seleccionar Proyecto Destino *
                </label>
                <select
                  value={manualSiteId}
                  onChange={(e) => setManualSiteId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] cursor-pointer"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — Dueño: @{s.owner?.handle || "creador"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  Monto de la Puja ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[var(--muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] pl-8 pr-3 text-sm font-bold text-[var(--foreground)] tabular-nums"
                    required
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Esta acción registrará un pago completado (tipo MANUAL_ADMIN), activará la puja en la base de datos y moverá el proyecto al ranking en tiempo real.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setManualBidModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingManualBid}
                  className="px-5 py-2 rounded-xl bg-[#FF4A1C] text-white text-xs font-bold hover:bg-[#E63D10] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingManualBid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  <span>Registrar y Activar en Ranking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </main>
      </div>
    </div>
  )
}
