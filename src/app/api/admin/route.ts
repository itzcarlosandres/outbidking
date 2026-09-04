import { NextRequest, NextResponse } from "next/server"
import { auth, getOrCreateDbUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Role, SiteStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 })
    }

    const dbUser = await getOrCreateDbUser(session.user)
    const adminUserId = dbUser?.id || session.user.id

    const body = await request.json()
    const { action } = body

    // 1. Guardar Configuración SEO & Branding & Subasta & Pasarelas
    if (action === "update_site_config") {
      const {
        siteName,
        logoText,
        logoAccent,
        tagline,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage,
        faviconUrl,
        googleAnalyticsId,
        heroTitle,
        heroSubtitle,
        bannerNotice,
        minIncrement,
        maxBidsPerHour,
        basicPrice,
        basicDays,
        proPrice,
        proDays,
        elitePrice,
        eliteDays,
        nowpaymentsApiKey,
        nowpaymentsIpnSecret,
        nowpaymentsSandbox,
        enableCryptoPayments,
        enableTestPayments,
        enableManualPayments,
        walletUsdtTrc20,
        walletUsdtErc20,
        walletBtc,
        walletSol,
        manualPaymentNotes,
      } = body.config

      let existing = await prisma.siteConfig.findFirst()

      const dataToSave = {
        siteName: siteName || "puja.lol",
        logoText: logoText || "puja",
        logoAccent: logoAccent || ".lol",
        tagline: tagline || "",
        metaTitle: metaTitle || "puja.lol — Ranking de Proyectos y Pujas en Tiempo Real",
        metaDescription: metaDescription || "",
        metaKeywords: metaKeywords || "",
        ogImage: ogImage || "",
        faviconUrl: faviconUrl || "",
        googleAnalyticsId: googleAnalyticsId || "",
        heroTitle: heroTitle || "Reclama el #1 por",
        heroSubtitle: heroSubtitle || "",
        bannerNotice: bannerNotice || "",
        minIncrement: Number(minIncrement) || 5,
        maxBidsPerHour: Number(maxBidsPerHour) || 10,
        basicPrice: Number(basicPrice) || 5,
        basicDays: Number(basicDays) || 7,
        proPrice: Number(proPrice) || 12,
        proDays: Number(proDays) || 30,
        elitePrice: Number(elitePrice) || 25,
        eliteDays: Number(eliteDays) || 90,
        nowpaymentsApiKey: nowpaymentsApiKey ?? "",
        nowpaymentsIpnSecret: nowpaymentsIpnSecret ?? "",
        nowpaymentsSandbox: Boolean(nowpaymentsSandbox),
        enableCryptoPayments: enableCryptoPayments !== false,
        enableTestPayments: enableTestPayments !== false,
        enableManualPayments: Boolean(enableManualPayments),
        walletUsdtTrc20: walletUsdtTrc20 ?? "",
        walletUsdtErc20: walletUsdtErc20 ?? "",
        walletBtc: walletBtc ?? "",
        walletSol: walletSol ?? "",
        manualPaymentNotes: manualPaymentNotes ?? "",
      }

      let updated
      if (existing) {
        updated = await prisma.siteConfig.update({
          where: { id: existing.id },
          data: dataToSave,
        })
      } else {
        updated = await prisma.siteConfig.create({
          data: dataToSave,
        })
      }

      const auctionCfg = await prisma.auctionConfig.findFirst()
      if (auctionCfg) {
        await prisma.auctionConfig.update({
          where: { id: auctionCfg.id },
          data: {
            minIncrement: Number(minIncrement) || 5,
            maxBidsPerHour: Number(maxBidsPerHour) || 10,
          },
        })
      }

      return NextResponse.json({ success: true, config: updated })
    }

    // 1.1 Probar conexión con NOWPayments API
    if (action === "test_nowpayments") {
      const apiKey = body.apiKey || ""
      const isSandbox = Boolean(body.isSandbox)
      const baseUrl = isSandbox ? "https://api-sandbox.nowpayments.io/v1" : "https://api.nowpayments.io/v1"

      if (!apiKey.trim()) {
        return NextResponse.json({
          success: true,
          status: "mock",
          message: "Sin API Key ingresada: El sistema funcionará en Modo Simulado automático.",
        })
      }

      try {
        const res = await fetch(`${baseUrl}/status`, {
          headers: { "x-api-key": apiKey.trim() },
        })
        const data = await res.json()

        if (res.ok && data.message === "OK") {
          return NextResponse.json({
            success: true,
            status: "connected",
            message: `¡Conexión exitosa con NOWPayments (${isSandbox ? "Sandbox / Testnet" : "Producción"})!`,
          })
        } else {
          return NextResponse.json({
            success: false,
            status: "error",
            message: data.message || "Error al autenticar con la API Key de NOWPayments.",
          })
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          status: "error",
          message: err.message || "No se pudo conectar con el servidor de NOWPayments.",
        })
      }
    }

    // 2. Suspender / Reactivar Sitio
    if (action === "toggle_site_status") {
      const { siteId, newStatus } = body
      const site = await prisma.site.update({
        where: { id: siteId },
        data: { status: newStatus as SiteStatus },
      })
      return NextResponse.json({ success: true, site })
    }

    // 3. Editar Proyecto Completo
    if (action === "update_site") {
      const { siteId, name, url, description, category, clicks, daysToAdd } = body
      
      const existingSite = await prisma.site.findUnique({ where: { id: siteId } })
      if (!existingSite) {
        return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 })
      }

      let newExpiresAt = existingSite.expiresAt
      if (daysToAdd && Number(daysToAdd) !== 0) {
        newExpiresAt = new Date(newExpiresAt.getTime() + Number(daysToAdd) * 24 * 60 * 60 * 1000)
      }

      const updated = await prisma.site.update({
        where: { id: siteId },
        data: {
          name: name || existingSite.name,
          url: url || existingSite.url,
          description: description || existingSite.description,
          category: category || existingSite.category,
          clicks: clicks !== undefined ? Number(clicks) : existingSite.clicks,
          expiresAt: newExpiresAt,
        },
      })

      return NextResponse.json({ success: true, site: updated })
    }

    // 4. Eliminar Proyecto
    if (action === "delete_site") {
      const { siteId } = body
      await prisma.site.delete({
        where: { id: siteId },
      })
      return NextResponse.json({ success: true })
    }

    // 5. Categorías: Crear Categoría
    if (action === "create_category") {
      const { name, slug, icon, description, order } = body
      
      let finalSlug = slug
      if (!finalSlug) {
        finalSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }

      const newCategory = await prisma.categoryItem.create({
        data: {
          name,
          slug: finalSlug,
          icon: icon || "Sparkles",
          description: description || "",
          order: Number(order) || 0,
          isActive: true,
        },
      })

      return NextResponse.json({ success: true, category: newCategory })
    }

    // 6. Categorías: Actualizar Categoría
    if (action === "update_category") {
      const { categoryId, name, slug, icon, description, order, isActive } = body

      const updated = await prisma.categoryItem.update({
        where: { id: categoryId },
        data: {
          name,
          slug,
          icon,
          description,
          order: Number(order) || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      })

      return NextResponse.json({ success: true, category: updated })
    }

    // 7. Categorías: Eliminar Categoría
    if (action === "delete_category") {
      const { categoryId } = body
      await prisma.categoryItem.delete({
        where: { id: categoryId },
      })
      return NextResponse.json({ success: true })
    }

    // 8. Categorías: Toggle Activa / Inactiva
    if (action === "toggle_category_status") {
      const { categoryId, isActive } = body
      const updated = await prisma.categoryItem.update({
        where: { id: categoryId },
        data: { isActive },
      })
      return NextResponse.json({ success: true, category: updated })
    }

    // 9. Cambiar Rol de Usuario
    if (action === "update_user_role") {
      const { userId, newRole } = body
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as Role },
      })
      return NextResponse.json({ success: true, user })
    }

    // 11. Aprobar / Activar Pago Manualmente (Respaldo Admin)
    if (action === "approve_payment_manually") {
      const { paymentId } = body

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { user: true },
      })

      if (!payment) {
        return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
      }

      const now = new Date()
      let siteToRank: any = null

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "COMPLETED" },
        })

        if (payment.siteId) {
          siteToRank = await tx.site.findUnique({ where: { id: payment.siteId } })

          if (siteToRank) {
            if (siteToRank.status !== SiteStatus.ACTIVE) {
              await tx.site.update({
                where: { id: siteToRank.id },
                data: { status: SiteStatus.ACTIVE },
              })
            }

            await tx.bid.updateMany({
              where: { siteId: siteToRank.id, isWinning: true },
              data: { isWinning: false },
            })

            if (payment.bidId) {
              await tx.bid.update({
                where: { id: payment.bidId },
                data: { isWinning: true, auctionDate: now },
              })
            } else {
              const newBid = await tx.bid.create({
                data: {
                  siteId: siteToRank.id,
                  userId: payment.userId,
                  amount: payment.amount,
                  isWinning: true,
                  auctionDate: now,
                },
              })
              await tx.payment.update({
                where: { id: payment.id },
                data: { bidId: newBid.id },
              })
            }
          }
        }
      })

      // Recalcular y emitir Pusher
      if (siteToRank) {
        const allSites = await prisma.site.findMany({
          where: { status: SiteStatus.ACTIVE },
          include: { bids: { where: { isWinning: true }, take: 1 } },
        })

        const sorted = allSites.map((s) => ({
          id: s.id,
          amount: s.bids[0] ? Number(s.bids[0].amount) : 0,
        }))
        sorted.sort((a, b) => b.amount - a.amount)
        const newRank = sorted.findIndex((s) => s.id === (siteToRank as any).id) + 1

        const { triggerBidEvent } = await import("@/lib/pusher")
        await triggerBidEvent({
          siteId: (siteToRank as any).id,
          siteName: (siteToRank as any).name,
          siteSlug: (siteToRank as any).slug,
          amount: Number(payment.amount),
          newRank: newRank || 1,
          userHandle: payment.user?.handle || payment.user?.name || "admin",
          userName: payment.user?.name || "Admin",
          userAvatar: payment.user?.image || null,
          timestamp: now.toISOString(),
        })
      }

      return NextResponse.json({ success: true, message: "Pago y puja aprobados manualmente con éxito" })
    }

    // 12. Cancelar / Marcar Pago como Fallido
    if (action === "cancel_payment") {
      const { paymentId } = body
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      })
      return NextResponse.json({ success: true, message: "Pago marcado como fallido" })
    }

    // 12.1 Eliminar Registro de Pago
    if (action === "delete_payment") {
      const { paymentId } = body
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      })

      if (!payment) {
        return NextResponse.json({ error: "Registro de pago no encontrado" }, { status: 404 })
      }

      // Si el pago tenía una puja asociada, eliminarla para que la recaudación y el ranking bajen a 0 si no hay más pujas
      if (payment.bidId) {
        try {
          await prisma.bid.delete({
            where: { id: payment.bidId },
          })
        } catch (err) {
          console.warn("No se pudo eliminar la puja vinculada:", err)
        }
      }

      await prisma.payment.delete({
        where: { id: paymentId },
      })

      return NextResponse.json({ success: true, message: "Registro de pago y puja eliminados exitosamente" })
    }

    // 12.2 Limpiar Múltiples Pagos (Fallidos, Pendientes o Todos)
    if (action === "clear_payments") {
      const { filter } = body // "FAILED" | "PENDING" | "ALL"
      let whereClause: any = {}
      if (filter === "FAILED") whereClause = { status: "FAILED" }
      else if (filter === "PENDING") whereClause = { status: "PENDING" }
      
      const result = await prisma.payment.deleteMany({
        where: whereClause,
      })

      // Si se vacía todo el historial, limpiar también todas las pujas para que la web arranque 100% limpia en $0
      if (filter === "ALL") {
        await prisma.bid.deleteMany({})
      }

      return NextResponse.json({
        success: true,
        count: result.count,
        message: `Se eliminaron ${result.count} registros de pagos correctamente (recaudación actualizada)`,
      })
    }

    // 12.3 Reiniciar Todo a $0 (Plataforma Limpia)
    if (action === "reset_platform_stats") {
      await prisma.payment.deleteMany({})
      await prisma.bid.deleteMany({})
      return NextResponse.json({
        success: true,
        message: "Se reiniciaron todos los pagos y pujas a $0. La plataforma está lista para recibir nuevos clientes.",
      })
    }

    // 13. Registrar Pago / Puja Manual desde Admin
    if (action === "create_manual_bid") {
      const { siteId, amount, notes } = body
      const numAmount = Number(amount)

      if (!siteId || isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "Datos de puja inválidos" }, { status: 400 })
      }

      const site = await prisma.site.findUnique({ where: { id: siteId } })
      if (!site) {
        return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 })
      }

      const now = new Date()

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId: adminUserId,
            amount: numAmount,
            type: "BID",
            status: "COMPLETED",
            paymentMethod: "MANUAL_ADMIN",
            siteId: site.id,
          },
        })

        await tx.bid.updateMany({
          where: { siteId: site.id, isWinning: true },
          data: { isWinning: false },
        })

        const bid = await tx.bid.create({
          data: {
            siteId: site.id,
            userId: adminUserId,
            amount: numAmount,
            isWinning: true,
            auctionDate: now,
          },
        })

        await tx.payment.update({
          where: { id: payment.id },
          data: { bidId: bid.id },
        })

        return { payment, bid }
      })

      // Recalcular y emitir Pusher
      const allSites = await prisma.site.findMany({
        where: { status: SiteStatus.ACTIVE },
        include: { bids: { where: { isWinning: true }, take: 1 } },
      })

      const sorted = allSites.map((s) => ({
        id: s.id,
        amount: s.bids[0] ? Number(s.bids[0].amount) : 0,
      }))
      sorted.sort((a, b) => b.amount - a.amount)
      const newRank = sorted.findIndex((s) => s.id === site.id) + 1

      const { triggerBidEvent } = await import("@/lib/pusher")
      await triggerBidEvent({
        siteId: site.id,
        siteName: site.name,
        siteSlug: site.slug,
        amount: numAmount,
        newRank: newRank || 1,
        userHandle: session.user.handle || session.user.name || "admin",
        userName: session.user.name || "Admin",
        userAvatar: session.user.image || null,
        timestamp: now.toISOString(),
      })

      return NextResponse.json({ success: true, bid: result.bid, newRank })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error: any) {
    console.error("Error en POST /api/admin:", error)
    return NextResponse.json({ error: error.message || "Error en admin API" }, { status: 500 })
  }
}
